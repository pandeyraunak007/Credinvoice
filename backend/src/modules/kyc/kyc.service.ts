import { UserType, EntityType, KycDocumentType, KycDocumentStatus, KycStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { UploadKycDocumentInput, ReviewKycDocumentInput, ListKycDocumentsQuery } from './kyc.validation';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';

export class KycService {
  // Get entity info based on user type
  private async getEntityInfo(userId: string, userType: UserType): Promise<{
    entityId: string;
    entityType: EntityType;
  }> {
    switch (userType) {
      case 'BUYER': {
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (!buyer) throw new AppError('Buyer profile not found', 404);
        return { entityId: buyer.id, entityType: 'BUYER' };
      }
      case 'SELLER': {
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (!seller) throw new AppError('Seller profile not found', 404);
        return { entityId: seller.id, entityType: 'SELLER' };
      }
      case 'FINANCIER': {
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (!financier) throw new AppError('Financier profile not found', 404);
        return { entityId: financier.id, entityType: 'FINANCIER' };
      }
      default:
        throw new AppError('Invalid user type for KYC', 400);
    }
  }

  // Upload KYC document
  async uploadDocument(
    userId: string,
    userType: UserType,
    documentType: KycDocumentType,
    file: Express.Multer.File
  ) {
    const { entityId, entityType } = await this.getEntityInfo(userId, userType);

    // Check if document type already uploaded and pending/approved
    const existing = await prisma.kycDocument.findFirst({
      where: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
        documentType,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existing) {
      throw new AppError(`${documentType} is already uploaded and ${existing.status.toLowerCase()}`, 409);
    }

    // Save file and create record
    const documentUrl = `/uploads/kyc/${file.filename}`;

    const kycDocument = await prisma.kycDocument.create({
      data: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
        documentType,
        documentUrl,
        fileName: file.originalname,
        status: 'PENDING',
      },
    });

    // Update KYC status to SUBMITTED if this is first document
    await this.updateKycStatus(entityId, entityType);

    return kycDocument;
  }

  // Get user's KYC documents
  async getUserDocuments(userId: string, userType: UserType) {
    const { entityId, entityType } = await this.getEntityInfo(userId, userType);

    const documents = await prisma.kycDocument.findMany({
      where: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  // Get single document
  async getDocument(documentId: string, userId?: string, userType?: UserType) {
    const document = await prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // If user info provided, verify ownership (for non-admin users)
    if (userId && userType && userType !== 'ADMIN') {
      const { entityId, entityType } = await this.getEntityInfo(userId, userType);
      if (document.entityType !== entityType ||
          document[`${entityType.toLowerCase()}Id` as keyof typeof document] !== entityId) {
        throw new AppError('Access denied', 403);
      }
    }

    return document;
  }

  // Admin: Get pending KYC documents
  async getPendingDocuments(query: ListKycDocumentsQuery) {
    const { status, entityType, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    else where.status = 'PENDING'; // Default to pending
    if (entityType) where.entityType = entityType;

    const [documents, total] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        include: {
          buyer: {
            select: { id: true, companyName: true, gstin: true },
          },
          seller: {
            select: { id: true, companyName: true, gstin: true },
          },
          financier: {
            select: { id: true, companyName: true, rbiLicense: true },
          },
        },
        orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
        skip,
        take: limit,
      }),
      prisma.kycDocument.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Review KYC document
  async reviewDocument(
    documentId: string,
    adminUserId: string,
    input: ReviewKycDocumentInput
  ) {
    const document = await prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.status !== 'PENDING') {
      throw new AppError('Document has already been reviewed', 400);
    }

    const updated = await prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status: input.status as KycDocumentStatus,
        rejectionReason: input.rejectionReason,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });

    // Update entity's overall KYC status
    const entityId = document.buyerId || document.sellerId || document.financierId;
    if (entityId) {
      await this.updateKycStatus(entityId, document.entityType);
    }

    return updated;
  }

  // Delete document (user can delete their own rejected documents to re-upload)
  async deleteDocument(documentId: string, userId: string, userType: UserType) {
    const { entityId, entityType } = await this.getEntityInfo(userId, userType);

    const document = await prisma.kycDocument.findFirst({
      where: {
        id: documentId,
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.status === 'APPROVED') {
      throw new AppError('Cannot delete approved documents', 400);
    }

    // Delete file from storage
    if (document.documentUrl) {
      const filePath = path.join(process.cwd(), document.documentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.kycDocument.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  // Helper: Update overall KYC status based on document statuses
  private async updateKycStatus(entityId: string, entityType: EntityType) {
    const documents = await prisma.kycDocument.findMany({
      where: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
    });

    let kycStatus: KycStatus = 'PENDING';

    if (documents.length === 0) {
      kycStatus = 'PENDING';
    } else if (documents.some(d => d.status === 'REJECTED')) {
      kycStatus = 'REJECTED';
    } else if (documents.every(d => d.status === 'APPROVED')) {
      kycStatus = 'APPROVED';
    } else if (documents.some(d => d.status === 'PENDING')) {
      kycStatus = 'UNDER_REVIEW';
    } else {
      kycStatus = 'SUBMITTED';
    }

    // Update the entity's KYC status
    const table = entityType.toLowerCase();
    await (prisma as any)[table].update({
      where: { id: entityId },
      data: { kycStatus },
    });
  }

  // Get KYC status summary for a user
  async getKycStatus(userId: string, userType: UserType) {
    const { entityId, entityType } = await this.getEntityInfo(userId, userType);

    const entity = await (prisma as any)[entityType.toLowerCase()].findUnique({
      where: { id: entityId },
      select: { kycStatus: true },
    });

    const documents = await prisma.kycDocument.findMany({
      where: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
      select: {
        documentType: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    // Required documents based on entity type
    const requiredDocs: KycDocumentType[] = entityType === 'FINANCIER'
      ? ['PAN_CARD', 'GST_CERTIFICATE', 'INCORPORATION_CERTIFICATE', 'RBI_LICENSE', 'CANCELLED_CHEQUE']
      : ['PAN_CARD', 'GST_CERTIFICATE', 'INCORPORATION_CERTIFICATE', 'CANCELLED_CHEQUE'];

    const uploadedTypes = documents.map(d => d.documentType);
    const missingDocs = requiredDocs.filter(doc => !uploadedTypes.includes(doc));

    return {
      overallStatus: entity?.kycStatus || 'PENDING',
      documents,
      requiredDocuments: requiredDocs,
      missingDocuments: missingDocs,
      isComplete: missingDocs.length === 0 && documents.every(d => d.status === 'APPROVED'),
    };
  }
}

export const kycService = new KycService();
