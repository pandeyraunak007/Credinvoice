/**
 * AI Invoice Extractor using Groq Vision API
 *
 * Integrates with Groq's Llama 4 Scout vision model to extract
 * structured data from uploaded invoice PDFs and images.
 */

import { extractInvoiceWithGroq, isValidGstin, ExtractedInvoiceData } from '../../services/groq.service';
import { AppError } from '../../middleware/errorHandler';

export interface ExtractedField<T> {
  value: T;
  confidence: number; // 0-100
}

export interface InvoiceExtractionResult {
  success: boolean;
  extractionId: string;
  overallConfidence: number;
  fields: {
    invoiceNumber: ExtractedField<string>;
    invoiceDate: ExtractedField<string>;
    dueDate: ExtractedField<string>;
    sellerGstin: ExtractedField<string | null>;
    sellerName: ExtractedField<string>;
    buyerGstin: ExtractedField<string | null>;
    buyerName: ExtractedField<string>;
    subtotal: ExtractedField<number>;
    taxAmount: ExtractedField<number>;
    totalAmount: ExtractedField<number>;
  };
  validationResults: Array<{
    rule: string;
    field?: string;
    passed: boolean;
    message?: string;
  }>;
  flagsForReview: string[];
  rawResponse?: string;
}

/**
 * Calculate confidence score for a field based on extraction quality
 */
function calculateFieldConfidence(value: any, fieldName: string): number {
  if (value === null || value === undefined) {
    return 0;
  }

  let confidence = 85; // Base confidence for extracted fields

  // Boost confidence for well-formatted values
  switch (fieldName) {
    case 'sellerGstin':
    case 'buyerGstin':
      if (typeof value === 'string' && isValidGstin(value)) {
        confidence = 95;
      } else if (typeof value === 'string' && value.length === 15) {
        confidence = 80;
      } else {
        confidence = 40;
      }
      break;

    case 'invoiceNumber':
      if (typeof value === 'string' && value.length >= 3) {
        confidence = 92;
      }
      break;

    case 'invoiceDate':
    case 'dueDate':
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        confidence = 94;
      } else if (value) {
        confidence = 75;
      }
      break;

    case 'sellerName':
    case 'buyerName':
      if (typeof value === 'string' && value.length >= 3) {
        confidence = 90;
      }
      break;

    case 'subtotal':
    case 'taxAmount':
    case 'totalAmount':
      if (typeof value === 'number' && value >= 0) {
        confidence = 93;
      }
      break;
  }

  return confidence;
}

/**
 * Extract invoice data from uploaded file using Groq Vision API
 */
export async function extractInvoiceFromFile(
  filePath: string,
  uploadedBy: { type: string; name: string }
): Promise<InvoiceExtractionResult> {
  const extractionId = `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Call Groq Vision API for extraction
    const extractedData = await extractInvoiceWithGroq(filePath);

    // Build fields with confidence scores
    const fields = {
      invoiceNumber: {
        value: extractedData.invoiceNumber || 'UNKNOWN',
        confidence: calculateFieldConfidence(extractedData.invoiceNumber, 'invoiceNumber'),
      },
      invoiceDate: {
        value: extractedData.invoiceDate || new Date().toISOString().split('T')[0],
        confidence: calculateFieldConfidence(extractedData.invoiceDate, 'invoiceDate'),
      },
      dueDate: {
        value: extractedData.dueDate || calculateDefaultDueDate(extractedData.invoiceDate),
        confidence: calculateFieldConfidence(extractedData.dueDate, 'dueDate'),
      },
      sellerGstin: {
        value: extractedData.sellerGstin,
        confidence: calculateFieldConfidence(extractedData.sellerGstin, 'sellerGstin'),
      },
      sellerName: {
        value: extractedData.sellerName || 'Unknown Seller',
        confidence: calculateFieldConfidence(extractedData.sellerName, 'sellerName'),
      },
      buyerGstin: {
        value: extractedData.buyerGstin,
        confidence: calculateFieldConfidence(extractedData.buyerGstin, 'buyerGstin'),
      },
      buyerName: {
        value: extractedData.buyerName || 'Unknown Buyer',
        confidence: calculateFieldConfidence(extractedData.buyerName, 'buyerName'),
      },
      subtotal: {
        value: extractedData.subtotal || 0,
        confidence: calculateFieldConfidence(extractedData.subtotal, 'subtotal'),
      },
      taxAmount: {
        value: extractedData.taxAmount || 0,
        confidence: calculateFieldConfidence(extractedData.taxAmount, 'taxAmount'),
      },
      totalAmount: {
        value: extractedData.totalAmount || 0,
        confidence: calculateFieldConfidence(extractedData.totalAmount, 'totalAmount'),
      },
    };

    // Calculate overall confidence
    const confidenceValues = Object.values(fields).map(f => f.confidence);
    const overallConfidence = Math.round(
      (confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 10
    ) / 10;

    // Run validation rules
    const validationResults = runValidations(fields);

    // Flag low confidence fields for review
    const flagsForReview = Object.entries(fields)
      .filter(([_, field]) => field.confidence < 80)
      .map(([name, _]) => name);

    return {
      success: true,
      extractionId,
      overallConfidence,
      fields,
      validationResults,
      flagsForReview,
      rawResponse: extractedData.rawResponse,
    };
  } catch (error: any) {
    console.error('Invoice extraction failed:', error);

    // Throw AppError with the actual error message so it's visible in production
    const errorMessage = error.message || 'Failed to extract invoice data';
    throw new AppError(errorMessage, 400);
  }
}

/**
 * Calculate default due date (30 days from invoice date)
 */
function calculateDefaultDueDate(invoiceDate: string | null): string {
  const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
  baseDate.setDate(baseDate.getDate() + 30);
  return baseDate.toISOString().split('T')[0];
}

/**
 * Run validation rules on extracted data
 */
function runValidations(fields: InvoiceExtractionResult['fields']) {
  const validations: InvoiceExtractionResult['validationResults'] = [];

  // VAL-001: Seller GSTIN format
  const sellerGstinValid = fields.sellerGstin.value === null || isValidGstin(fields.sellerGstin.value);
  validations.push({
    rule: 'VAL-001',
    field: 'sellerGstin',
    passed: sellerGstinValid,
    message: sellerGstinValid ? 'Seller GSTIN format valid' : 'Seller GSTIN format invalid or missing',
  });

  // VAL-002: Buyer GSTIN format
  const buyerGstinValid = fields.buyerGstin.value === null || isValidGstin(fields.buyerGstin.value);
  validations.push({
    rule: 'VAL-002',
    field: 'buyerGstin',
    passed: buyerGstinValid,
    message: buyerGstinValid ? 'Buyer GSTIN format valid' : 'Buyer GSTIN format invalid or missing',
  });

  // VAL-003: Due date after invoice date
  const invoiceDate = new Date(fields.invoiceDate.value);
  const dueDate = new Date(fields.dueDate.value);
  const datesValid = dueDate >= invoiceDate;
  validations.push({
    rule: 'VAL-003',
    field: 'dates',
    passed: datesValid,
    message: datesValid ? 'Due date is after invoice date' : 'Due date should be after invoice date',
  });

  // VAL-004: Amount consistency (total = subtotal + tax)
  const expectedTotal = fields.subtotal.value + fields.taxAmount.value;
  const amountsConsistent = Math.abs(fields.totalAmount.value - expectedTotal) < 1;
  validations.push({
    rule: 'VAL-004',
    field: 'amounts',
    passed: amountsConsistent,
    message: amountsConsistent
      ? 'Amount calculation consistent'
      : `Total (${fields.totalAmount.value}) should equal subtotal + tax (${expectedTotal})`,
  });

  // VAL-005: Invoice number present
  const hasInvoiceNumber = fields.invoiceNumber.value && fields.invoiceNumber.value !== 'UNKNOWN';
  validations.push({
    rule: 'VAL-005',
    field: 'invoiceNumber',
    passed: !!hasInvoiceNumber,
    message: hasInvoiceNumber ? 'Invoice number extracted' : 'Invoice number could not be extracted',
  });

  // VAL-006: Total amount positive
  const hasValidTotal = fields.totalAmount.value > 0;
  validations.push({
    rule: 'VAL-006',
    field: 'totalAmount',
    passed: hasValidTotal,
    message: hasValidTotal ? 'Total amount is valid' : 'Total amount should be greater than zero',
  });

  return validations;
}

/**
 * Get flat extracted values for database storage
 */
export function getExtractedValues(result: InvoiceExtractionResult) {
  return {
    invoiceNumber: result.fields.invoiceNumber.value,
    invoiceDate: new Date(result.fields.invoiceDate.value),
    dueDate: new Date(result.fields.dueDate.value),
    sellerGstin: result.fields.sellerGstin.value,
    sellerName: result.fields.sellerName.value,
    buyerGstin: result.fields.buyerGstin.value,
    buyerName: result.fields.buyerName.value,
    subtotal: result.fields.subtotal.value,
    taxAmount: result.fields.taxAmount.value,
    totalAmount: result.fields.totalAmount.value,
    extractionConfidence: result.overallConfidence,
  };
}
