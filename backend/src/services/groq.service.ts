import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Vision model for invoice extraction
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Maximum image size for Groq API (4MB for base64)
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export interface ExtractedInvoiceData {
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  sellerName: string | null;
  sellerGstin: string | null;
  buyerName: string | null;
  buyerGstin: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  rawResponse?: string;
}

/**
 * Extract invoice data from an image file using Groq Vision API
 */
export async function extractInvoiceWithGroq(
  filePath: string
): Promise<ExtractedInvoiceData> {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  // Get file extension and validate
  const ext = path.extname(filePath).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  const isPdf = ext === '.pdf';

  if (!isImage && !isPdf) {
    throw new Error('Unsupported file type. Please upload JPG, PNG, or PDF files.');
  }

  let imageBase64: string;
  let mimeType: string;

  if (isPdf) {
    // For PDFs, we need to convert to image first
    // Using pdf2pic or returning error if not available
    try {
      const pdfImageResult = await convertPdfToImage(filePath);
      imageBase64 = pdfImageResult.base64;
      mimeType = pdfImageResult.mimeType;
    } catch (error) {
      console.error('PDF conversion failed:', error);
      throw new Error('PDF processing failed. Please upload an image (JPG/PNG) of the invoice instead.');
    }
  } else {
    // Process image file
    const imageResult = await processImage(filePath);
    imageBase64 = imageResult.base64;
    mimeType = imageResult.mimeType;
  }

  // Call Groq Vision API
  const extractedData = await callGroqVision(imageBase64, mimeType);

  return extractedData;
}

/**
 * Process and resize image if needed
 */
async function processImage(filePath: string): Promise<{ base64: string; mimeType: string }> {
  const ext = path.extname(filePath).toLowerCase();
  let mimeType = 'image/jpeg';

  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';

  // Read file
  let imageBuffer = fs.readFileSync(filePath);

  // Check size and resize if needed
  if (imageBuffer.length > MAX_IMAGE_SIZE) {
    console.log('Image too large, resizing...');
    const resizedBuffer = await sharp(imageBuffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    imageBuffer = Buffer.from(resizedBuffer);
    mimeType = 'image/jpeg';
  }

  const base64 = imageBuffer.toString('base64');

  return { base64, mimeType };
}

/**
 * Convert PDF first page to image
 */
async function convertPdfToImage(filePath: string): Promise<{ base64: string; mimeType: string }> {
  try {
    // Dynamic import for pdf2pic
    const { fromPath } = await import('pdf2pic');

    const options = {
      density: 150,
      saveFilename: 'invoice_page',
      savePath: path.dirname(filePath),
      format: 'png',
      width: 1500,
      height: 2000,
    };

    const convert = fromPath(filePath, options);
    const result = await convert(1); // First page only

    if (!result.path) {
      throw new Error('PDF conversion produced no output');
    }

    // Read the generated image
    const imageBuffer = fs.readFileSync(result.path);
    const base64 = imageBuffer.toString('base64');

    // Clean up temporary file
    try {
      fs.unlinkSync(result.path);
    } catch (e) {
      console.warn('Could not delete temp file:', result.path);
    }

    return { base64, mimeType: 'image/png' };
  } catch (error) {
    console.error('pdf2pic conversion failed:', error);
    throw new Error('PDF conversion requires GraphicsMagick. Please upload an image instead.');
  }
}

/**
 * Call Groq Vision API to extract invoice data
 */
async function callGroqVision(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedInvoiceData> {
  const systemPrompt = `You are an expert invoice data extractor. Analyze the provided invoice image and extract all relevant information with high accuracy. Focus on Indian GST invoices.

You MUST respond with a valid JSON object only, no other text. Use this exact format:
{
  "invoiceNumber": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "sellerName": "string or null",
  "sellerGstin": "15-character GSTIN or null",
  "buyerName": "string or null",
  "buyerGstin": "15-character GSTIN or null",
  "subtotal": number or null,
  "taxAmount": number or null,
  "totalAmount": number or null
}

Field explanations:
- invoiceNumber: The unique invoice identifier (e.g., INV-2024-001, GST/2024/12345)
- invoiceDate: Date invoice was issued, in YYYY-MM-DD format
- dueDate: Payment due date, in YYYY-MM-DD format (if not visible, estimate 30 days from invoice date)
- sellerName: Name of the seller/vendor company
- sellerGstin: 15-character Indian GST number of seller (format: 22AAAAA0000A1Z5)
- buyerName: Name of the buyer/customer company
- buyerGstin: 15-character Indian GST number of buyer
- subtotal: Amount before taxes (as a number, no currency symbols)
- taxAmount: Total GST/tax amount (as a number)
- totalAmount: Final payable amount including taxes (as a number)

If a field is not clearly visible or cannot be determined, use null.
For amounts, extract only the numeric value (e.g., 50000 not "₹50,000").`;

  const userPrompt = 'Please extract all invoice data from this image and return it as JSON.';

  try {
    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: systemPrompt + '\n\n' + userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.1, // Low temperature for more deterministic extraction
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the JSON response
    const extractedData = parseGroqResponse(content);
    extractedData.rawResponse = content;

    return extractedData;
  } catch (error: any) {
    console.error('Groq API error:', error);

    if (error.status === 429) {
      throw new Error('AI service is temporarily busy. Please try again in a moment.');
    }
    if (error.status === 401) {
      throw new Error('AI service authentication failed. Please contact support.');
    }

    throw new Error('Failed to extract invoice data. Please try uploading a clearer image.');
  }
}

/**
 * Parse Groq response and extract JSON data
 */
function parseGroqResponse(content: string): ExtractedInvoiceData {
  // Default empty result
  const defaultResult: ExtractedInvoiceData = {
    invoiceNumber: null,
    invoiceDate: null,
    dueDate: null,
    sellerName: null,
    sellerGstin: null,
    buyerName: null,
    buyerGstin: null,
    subtotal: null,
    taxAmount: null,
    totalAmount: null,
  };

  try {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in Groq response:', content);
      return defaultResult;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      invoiceNumber: parsed.invoiceNumber || null,
      invoiceDate: parseDate(parsed.invoiceDate),
      dueDate: parseDate(parsed.dueDate),
      sellerName: parsed.sellerName || null,
      sellerGstin: cleanGstin(parsed.sellerGstin),
      buyerName: parsed.buyerName || null,
      buyerGstin: cleanGstin(parsed.buyerGstin),
      subtotal: parseNumber(parsed.subtotal),
      taxAmount: parseNumber(parsed.taxAmount),
      totalAmount: parseNumber(parsed.totalAmount),
    };
  } catch (error) {
    console.error('Failed to parse Groq response:', error);
    return defaultResult;
  }
}

/**
 * Parse and validate date string
 */
function parseDate(dateStr: any): string | null {
  if (!dateStr) return null;

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse various formats
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return null;
}

/**
 * Parse number from various formats
 */
function parseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Remove currency symbols and formatting
    const cleaned = value.replace(/[₹$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  return null;
}

/**
 * Clean and validate GSTIN
 */
function cleanGstin(gstin: any): string | null {
  if (!gstin) return null;

  // Remove spaces and convert to uppercase
  const cleaned = String(gstin).replace(/\s/g, '').toUpperCase();

  // Basic GSTIN format validation (15 characters)
  if (cleaned.length === 15) {
    return cleaned;
  }

  return null;
}

/**
 * Validate GSTIN format
 */
export function isValidGstin(gstin: string): boolean {
  // Indian GSTIN format: 2 digits state code + 10 char PAN + 1 entity code + Z + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

export const groqService = {
  extractInvoiceWithGroq,
  isValidGstin,
};
