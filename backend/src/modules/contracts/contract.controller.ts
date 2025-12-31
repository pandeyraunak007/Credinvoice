import { Request, Response } from 'express';
import { contractService } from './contract.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

/**
 * Get all contracts for the authenticated user
 */
export const getContracts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    contractType: req.query.contractType as any,
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await contractService.getContractsForUser(
    req.user.userId,
    req.user.userType,
    query
  );

  return sendPaginated(res, result.contracts, result.pagination);
});

/**
 * Get a single contract by ID
 */
export const getContractById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, contract);
});

/**
 * Get contract text (for display/download)
 */
export const getContractText = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  // Return just the contract text
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(contract.contractText);
});

/**
 * Download contract as text file
 */
export const downloadContract = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  const filename = `${contract.contractNumber}.txt`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(contract.contractText);
});

/**
 * Get contract by invoice ID
 */
export const getContractByInvoiceId = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;

  const contract = await contractService.getContractByInvoiceId(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  if (!contract) {
    return sendSuccess(res, null, 'No contract found for this invoice');
  }

  return sendSuccess(res, contract);
});

/**
 * Download contract as PDF
 */
export const downloadContractPDF = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  // Generate PDF using simple HTML-to-PDF approach
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50 });

  const filename = `${contract.contractNumber}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('EARLY PAYMENT AGREEMENT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').text(`Contract No: ${contract.contractNumber}`, { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date(contract.generatedAt).toLocaleDateString('en-IN')}`, { align: 'center' });
  doc.moveDown(2);

  // Contract type badge
  const typeLabel = contract.contractType === 'TWO_PARTY' ? 'SELF-FUNDED (2-PARTY)' : 'FINANCIER-FUNDED (3-PARTY)';
  doc.fontSize(11).font('Helvetica-Bold').text(`Type: ${typeLabel}`);
  doc.moveDown();

  // Parties section
  doc.fontSize(14).font('Helvetica-Bold').text('PARTIES');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');

  doc.font('Helvetica-Bold').text('BUYER: ', { continued: true });
  doc.font('Helvetica').text(contract.buyer?.companyName || 'N/A');
  if (contract.buyer?.gstin) doc.text(`GSTIN: ${contract.buyer.gstin}`);
  if (contract.buyer?.address) doc.text(`Address: ${contract.buyer.address}`);
  doc.moveDown();

  doc.font('Helvetica-Bold').text('SELLER: ', { continued: true });
  doc.font('Helvetica').text(contract.seller?.companyName || 'N/A');
  if (contract.seller?.gstin) doc.text(`GSTIN: ${contract.seller.gstin}`);
  if (contract.seller?.address) doc.text(`Address: ${contract.seller.address}`);
  doc.moveDown();

  if (contract.contractType === 'THREE_PARTY' && contract.financier) {
    doc.font('Helvetica-Bold').text('FINANCIER: ', { continued: true });
    doc.font('Helvetica').text(contract.financier?.companyName || 'N/A');
    if (contract.financier?.rbiLicense) doc.text(`License: ${contract.financier.rbiLicense}`);
    doc.moveDown();
  }

  doc.moveDown();

  // Invoice details
  doc.fontSize(14).font('Helvetica-Bold').text('INVOICE DETAILS');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Invoice Number: ${contract.invoiceNumber}`);
  doc.text(`Invoice Date: ${new Date(contract.invoiceDate).toLocaleDateString('en-IN')}`);
  doc.text(`Original Due Date: ${new Date(contract.dueDate).toLocaleDateString('en-IN')}`);
  doc.text(`Invoice Amount: ₹${contract.invoiceAmount.toLocaleString('en-IN')}`);
  doc.moveDown();

  // Discount details
  doc.fontSize(14).font('Helvetica-Bold').text('DISCOUNT TERMS');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Discount Percentage: ${contract.discountPercentage}%`);
  doc.text(`Discount Amount: ₹${contract.discountAmount.toLocaleString('en-IN')}`);
  doc.text(`Early Payment Date: ${new Date(contract.earlyPaymentDate).toLocaleDateString('en-IN')}`);
  doc.text(`Seller Receives: ₹${contract.sellerReceives.toLocaleString('en-IN')}`);
  doc.moveDown();

  // Payment flow
  doc.fontSize(14).font('Helvetica-Bold').text('PAYMENT FLOW');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');

  if (contract.contractType === 'TWO_PARTY') {
    doc.text(`Buyer pays Seller: ₹${contract.buyerPays?.toLocaleString('en-IN') || contract.sellerReceives.toLocaleString('en-IN')}`);
    doc.text('Payment due within 2 business days of this agreement.');
  } else {
    doc.text(`1. Financier pays Seller: ₹${contract.financierPays?.toLocaleString('en-IN')}`);
    doc.text(`2. Buyer repays Financier: ₹${contract.buyerRepays?.toLocaleString('en-IN')}`);
    if (contract.repaymentDueDate) {
      doc.text(`   Repayment Due: ${new Date(contract.repaymentDueDate).toLocaleDateString('en-IN')}`);
    }
    if (contract.financierRate) {
      doc.text(`   Financier Rate: ${contract.financierRate}% (annualized)`);
    }
  }
  doc.moveDown(2);

  // Footer
  doc.fontSize(9).font('Helvetica').fillColor('gray');
  doc.text('This is a system-generated document. For any disputes, please contact CredInvoice support.', { align: 'center' });
  doc.text(`Document ID: ${contract.id}`, { align: 'center' });

  doc.end();
});
