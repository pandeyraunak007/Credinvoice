/**
 * Mock AI Invoice Extractor
 *
 * In production, this would integrate with:
 * - Google Document AI
 * - GPT-4 Vision
 * - AWS Textract
 * - Custom OCR + ML models
 *
 * For MVP, we return mock extracted data with confidence scores.
 */

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
}

// Helper to generate random confidence score
function randomConfidence(min: number = 85, max: number = 99): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// Helper to generate mock GSTIN
function generateMockGstin(): string {
  const stateCode = String(Math.floor(Math.random() * 36) + 1).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pan = Array(5).fill(0).map(() => chars[Math.floor(Math.random() * 26)]).join('') +
              String(Math.floor(Math.random() * 10000)).padStart(4, '0') +
              chars[Math.floor(Math.random() * 26)];
  return `${stateCode}${pan}1Z${Math.floor(Math.random() * 10)}`;
}

// Helper to generate mock invoice number
function generateMockInvoiceNumber(): string {
  const prefix = ['INV', 'BILL', 'TAX'][Math.floor(Math.random() * 3)];
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const serial = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}-${year}${month}-${serial}`;
}

// Companies for mock data
const mockCompanies = [
  { name: 'Tata Steel Limited', gstin: '27AAACT2727Q1ZW' },
  { name: 'Reliance Industries Ltd', gstin: '27AAACR5055K1ZS' },
  { name: 'Mahindra & Mahindra', gstin: '27AAACM2314B1ZE' },
  { name: 'Infosys Limited', gstin: '29AABCI1936E1ZG' },
  { name: 'Kumar Textiles Pvt Ltd', gstin: '27AABCK1234B1ZX' },
  { name: 'Singh Manufacturing Co', gstin: '09AADCS5678M1ZY' },
  { name: 'Patel Enterprises', gstin: '24AAFCP9012L1ZZ' },
  { name: 'Sharma Industries', gstin: '06BBASH3456N1ZA' },
];

/**
 * Mock invoice extraction from uploaded file
 * In production, this would analyze the actual PDF/image
 */
export async function extractInvoiceFromFile(
  filePath: string,
  uploadedBy: { type: string; name: string }
): Promise<InvoiceExtractionResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate mock data
  const invoiceDate = new Date();
  invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 30)); // 0-30 days ago

  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30 + Math.floor(Math.random() * 60)); // 30-90 days from invoice

  const subtotal = Math.round((50000 + Math.random() * 950000) * 100) / 100; // 50K to 10L
  const taxRate = [0.05, 0.12, 0.18, 0.28][Math.floor(Math.random() * 4)]; // GST rates
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  // Pick random seller and buyer
  const seller = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
  let buyer = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
  while (buyer.name === seller.name) {
    buyer = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
  }

  // Generate extraction result
  const extractionId = `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const fields = {
    invoiceNumber: { value: generateMockInvoiceNumber(), confidence: randomConfidence(92, 99) },
    invoiceDate: { value: invoiceDate.toISOString().split('T')[0], confidence: randomConfidence(90, 98) },
    dueDate: { value: dueDate.toISOString().split('T')[0], confidence: randomConfidence(88, 96) },
    sellerGstin: { value: seller.gstin, confidence: randomConfidence(85, 95) },
    sellerName: { value: seller.name, confidence: randomConfidence(90, 98) },
    buyerGstin: { value: buyer.gstin, confidence: randomConfidence(85, 95) },
    buyerName: { value: buyer.name, confidence: randomConfidence(90, 98) },
    subtotal: { value: subtotal, confidence: randomConfidence(92, 99) },
    taxAmount: { value: taxAmount, confidence: randomConfidence(90, 97) },
    totalAmount: { value: totalAmount, confidence: randomConfidence(94, 99) },
  };

  // Calculate overall confidence
  const confidenceValues = Object.values(fields).map(f => f.confidence);
  const overallConfidence = Math.round(
    (confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 10
  ) / 10;

  // Validation results
  const validationResults = [
    {
      rule: 'VAL-001',
      field: 'sellerGstin',
      passed: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(seller.gstin),
      message: 'GST format validation',
    },
    {
      rule: 'VAL-002',
      field: 'dates',
      passed: dueDate > invoiceDate,
      message: 'Due date must be after invoice date',
    },
    {
      rule: 'VAL-003',
      field: 'amounts',
      passed: Math.abs(totalAmount - (subtotal + taxAmount)) < 1,
      message: 'Amount consistency check',
    },
    {
      rule: 'VAL-004',
      passed: true, // Would check database for duplicates
      message: 'Duplicate invoice check',
    },
  ];

  // Flag low confidence fields for review
  const flagsForReview = Object.entries(fields)
    .filter(([_, field]) => field.confidence < 90)
    .map(([name, _]) => name);

  return {
    success: true,
    extractionId,
    overallConfidence,
    fields,
    validationResults,
    flagsForReview,
  };
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
