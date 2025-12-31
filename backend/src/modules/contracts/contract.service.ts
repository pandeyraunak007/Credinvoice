import { ContractType, ContractStatus, UserType } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { generateContractNumber } from './utils/contract-number';
import { generateTwoPartyContract, TwoPartyContractData } from './templates/two-party.template';
import { generateThreePartyContract, ThreePartyContractData } from './templates/three-party.template';
import { ListContractsQuery } from './contract.validation';

export class ContractService {
  /**
   * Generate a 2-party contract for self-funded discount
   * Called when buyer authorizes self-funded payment
   */
  async generateTwoPartyContract(
    discountOfferId: string,
    buyerId: string
  ) {
    // Fetch discount offer with all related data
    const discountOffer = await prisma.discountOffer.findUnique({
      where: { id: discountOfferId },
      include: {
        invoice: true,
        buyer: true,
      },
    });

    if (!discountOffer) {
      throw new AppError('Discount offer not found', 404);
    }

    if (discountOffer.buyerId !== buyerId) {
      throw new AppError('You are not authorized to generate this contract', 403);
    }

    if (discountOffer.fundingType !== 'SELF_FUNDED') {
      throw new AppError('This offer is not self-funded', 400);
    }

    // Check if contract already exists
    const existingContract = await prisma.contract.findFirst({
      where: { discountOfferId: discountOfferId },
    });

    if (existingContract) {
      return existingContract;
    }

    // Fetch seller details
    const seller = await prisma.seller.findUnique({
      where: { id: discountOffer.invoice.sellerId! },
    });

    if (!seller) {
      throw new AppError('Seller not found', 404);
    }

    // Generate contract number
    const contractNumber = await generateContractNumber();

    // Calculate amounts
    const invoiceAmount = discountOffer.invoice.totalAmount;
    const discountPercentage = discountOffer.discountPercentage;
    const discountAmount = invoiceAmount * (discountPercentage / 100);
    const sellerReceives = invoiceAmount - discountAmount;

    // Create contract record
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        contractType: 'TWO_PARTY',
        status: 'ACTIVE',
        invoiceId: discountOffer.invoice.id,
        discountOfferId: discountOffer.id,
        buyerId: discountOffer.buyer.id,
        sellerId: seller.id,
        invoiceNumber: discountOffer.invoice.invoiceNumber,
        invoiceDate: discountOffer.invoice.invoiceDate,
        invoiceAmount,
        dueDate: discountOffer.invoice.dueDate,
        discountPercentage,
        discountAmount,
        earlyPaymentDate: discountOffer.earlyPaymentDate,
        sellerReceives,
        buyerPays: sellerReceives,
      },
    });

    // Generate contract text for reference
    const contractData: TwoPartyContractData = {
      contractNumber,
      generatedAt: contract.generatedAt,
      invoiceNumber: discountOffer.invoice.invoiceNumber,
      invoiceDate: discountOffer.invoice.invoiceDate,
      invoiceAmount,
      dueDate: discountOffer.invoice.dueDate,
      discountPercentage,
      discountAmount,
      earlyPaymentDate: discountOffer.earlyPaymentDate,
      sellerReceives,
      buyer: {
        companyName: discountOffer.buyer.companyName,
        gstin: discountOffer.buyer.gstin,
        address: discountOffer.buyer.address,
        contactName: discountOffer.buyer.contactName,
      },
      seller: {
        companyName: seller.companyName,
        gstin: seller.gstin,
        address: seller.address,
        contactName: seller.contactName,
      },
      buyerAcceptedAt: discountOffer.createdAt,
      sellerAcceptedAt: discountOffer.respondedAt || discountOffer.updatedAt,
    };

    const contractText = generateTwoPartyContract(contractData);

    // Send notifications to both parties
    await this.sendContractNotifications(contract.id, 'TWO_PARTY', buyerId, seller.userId);

    return {
      ...contract,
      contractText,
    };
  }

  /**
   * Generate a 3-party contract for financier-funded discount
   * Called when buyer accepts a financier's bid
   */
  async generateThreePartyContract(
    bidId: string,
    buyerId: string
  ) {
    // Fetch bid with all related data
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        invoice: {
          include: {
            discountOffer: true,
          },
        },
        financier: true,
      },
    });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    const discountOffer = bid.invoice.discountOffer;
    if (!discountOffer) {
      throw new AppError('Discount offer not found for this invoice', 404);
    }

    if (discountOffer.buyerId !== buyerId) {
      throw new AppError('You are not authorized to generate this contract', 403);
    }

    // Check if contract already exists
    const existingContract = await prisma.contract.findFirst({
      where: { bidId: bidId },
    });

    if (existingContract) {
      return existingContract;
    }

    // Fetch buyer and seller details
    const buyer = await prisma.buyer.findUnique({
      where: { id: discountOffer.buyerId },
    });

    const seller = await prisma.seller.findUnique({
      where: { id: bid.invoice.sellerId! },
    });

    if (!buyer || !seller) {
      throw new AppError('Buyer or seller not found', 404);
    }

    // Generate contract number
    const contractNumber = await generateContractNumber();

    // Calculate amounts
    const invoiceAmount = bid.invoice.totalAmount;
    const discountPercentage = discountOffer.discountPercentage;
    const discountAmount = invoiceAmount * (discountPercentage / 100);
    const sellerReceives = bid.netAmount; // Amount seller receives from financier
    const financierRate = bid.discountRate;
    const financierFee = bid.processingFee;

    // Buyer repays the original invoice amount (or slightly more depending on arrangement)
    // For simplicity, buyer repays invoice amount
    const buyerRepays = invoiceAmount;

    // Create contract record
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        contractType: 'THREE_PARTY',
        status: 'ACTIVE',
        invoiceId: bid.invoice.id,
        discountOfferId: discountOffer.id,
        bidId: bid.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        financierId: bid.financier.id,
        invoiceNumber: bid.invoice.invoiceNumber,
        invoiceDate: bid.invoice.invoiceDate,
        invoiceAmount,
        dueDate: bid.invoice.dueDate,
        discountPercentage,
        discountAmount,
        earlyPaymentDate: discountOffer.earlyPaymentDate,
        sellerReceives,
        financierPays: sellerReceives,
        buyerRepays,
        repaymentDueDate: bid.invoice.dueDate,
        financierRate,
        financierFee,
      },
    });

    // Generate contract text
    const contractData: ThreePartyContractData = {
      contractNumber,
      generatedAt: contract.generatedAt,
      invoiceNumber: bid.invoice.invoiceNumber,
      invoiceDate: bid.invoice.invoiceDate,
      invoiceAmount,
      dueDate: bid.invoice.dueDate,
      discountPercentage,
      discountAmount,
      earlyPaymentDate: discountOffer.earlyPaymentDate,
      sellerReceives,
      financierRate,
      financierFee,
      buyerRepays,
      repaymentDueDate: bid.invoice.dueDate,
      buyer: {
        companyName: buyer.companyName,
        gstin: buyer.gstin,
        address: buyer.address,
        contactName: buyer.contactName,
      },
      seller: {
        companyName: seller.companyName,
        gstin: seller.gstin,
        address: seller.address,
        contactName: seller.contactName,
      },
      financier: {
        companyName: bid.financier.companyName,
        rbiLicense: bid.financier.rbiLicense,
        entityType: bid.financier.entityType,
        address: bid.financier.address,
        contactName: bid.financier.contactName,
      },
      buyerAcceptedAt: discountOffer.createdAt,
      sellerAcceptedAt: discountOffer.respondedAt || discountOffer.updatedAt,
      financierAcceptedAt: bid.createdAt,
    };

    const contractText = generateThreePartyContract(contractData);

    // Send notifications to all three parties
    await this.sendContractNotifications(
      contract.id,
      'THREE_PARTY',
      buyer.userId,
      seller.userId,
      bid.financier.userId
    );

    return {
      ...contract,
      contractText,
    };
  }

  /**
   * Get contracts for a specific user based on their role
   */
  async getContractsForUser(
    userId: string,
    userType: UserType,
    query: ListContractsQuery
  ) {
    const { contractType, status, page, limit } = query;
    const skip = (page - 1) * limit;

    // Get entity ID based on user type
    let entityId: string | null = null;
    let entityField: string;

    switch (userType) {
      case 'BUYER':
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (!buyer) throw new AppError('Buyer profile not found', 404);
        entityId = buyer.id;
        entityField = 'buyerId';
        break;
      case 'SELLER':
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (!seller) throw new AppError('Seller profile not found', 404);
        entityId = seller.id;
        entityField = 'sellerId';
        break;
      case 'FINANCIER':
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (!financier) throw new AppError('Financier profile not found', 404);
        entityId = financier.id;
        entityField = 'financierId';
        break;
      default:
        throw new AppError('Invalid user type', 400);
    }

    // Build where clause
    const where: any = {
      [entityField]: entityId,
    };

    if (contractType) where.contractType = contractType;
    if (status) where.status = status;

    // Financiers only see 3-party contracts
    if (userType === 'FINANCIER') {
      where.contractType = 'THREE_PARTY';
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return {
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single contract by ID with access check
   */
  async getContractById(
    contractId: string,
    userId: string,
    userType: UserType
  ) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    // Verify user has access to this contract
    const hasAccess = await this.checkContractAccess(contract, userId, userType);
    if (!hasAccess) {
      throw new AppError('You do not have access to this contract', 403);
    }

    // Fetch party details
    const [buyer, seller, financier] = await Promise.all([
      prisma.buyer.findUnique({ where: { id: contract.buyerId } }),
      prisma.seller.findUnique({ where: { id: contract.sellerId } }),
      contract.financierId
        ? prisma.financier.findUnique({ where: { id: contract.financierId } })
        : null,
    ]);

    // Generate contract text
    let contractText: string;

    if (contract.contractType === 'TWO_PARTY') {
      const contractData: TwoPartyContractData = {
        contractNumber: contract.contractNumber,
        generatedAt: contract.generatedAt,
        invoiceNumber: contract.invoiceNumber,
        invoiceDate: contract.invoiceDate,
        invoiceAmount: contract.invoiceAmount,
        dueDate: contract.dueDate,
        discountPercentage: contract.discountPercentage,
        discountAmount: contract.discountAmount,
        earlyPaymentDate: contract.earlyPaymentDate,
        sellerReceives: contract.sellerReceives,
        buyer: {
          companyName: buyer?.companyName || 'N/A',
          gstin: buyer?.gstin || null,
          address: buyer?.address || null,
          contactName: buyer?.contactName || null,
        },
        seller: {
          companyName: seller?.companyName || 'N/A',
          gstin: seller?.gstin || null,
          address: seller?.address || null,
          contactName: seller?.contactName || null,
        },
        buyerAcceptedAt: contract.createdAt,
        sellerAcceptedAt: contract.createdAt,
      };
      contractText = generateTwoPartyContract(contractData);
    } else {
      const contractData: ThreePartyContractData = {
        contractNumber: contract.contractNumber,
        generatedAt: contract.generatedAt,
        invoiceNumber: contract.invoiceNumber,
        invoiceDate: contract.invoiceDate,
        invoiceAmount: contract.invoiceAmount,
        dueDate: contract.dueDate,
        discountPercentage: contract.discountPercentage,
        discountAmount: contract.discountAmount,
        earlyPaymentDate: contract.earlyPaymentDate,
        sellerReceives: contract.sellerReceives,
        financierRate: contract.financierRate || 0,
        financierFee: contract.financierFee || 0,
        buyerRepays: contract.buyerRepays || contract.invoiceAmount,
        repaymentDueDate: contract.repaymentDueDate || contract.dueDate,
        buyer: {
          companyName: buyer?.companyName || 'N/A',
          gstin: buyer?.gstin || null,
          address: buyer?.address || null,
          contactName: buyer?.contactName || null,
        },
        seller: {
          companyName: seller?.companyName || 'N/A',
          gstin: seller?.gstin || null,
          address: seller?.address || null,
          contactName: seller?.contactName || null,
        },
        financier: {
          companyName: financier?.companyName || 'N/A',
          rbiLicense: financier?.rbiLicense || null,
          entityType: financier?.entityType || null,
          address: financier?.address || null,
          contactName: financier?.contactName || null,
        },
        buyerAcceptedAt: contract.createdAt,
        sellerAcceptedAt: contract.createdAt,
        financierAcceptedAt: contract.createdAt,
      };
      contractText = generateThreePartyContract(contractData);
    }

    return {
      ...contract,
      buyer,
      seller,
      financier,
      contractText,
    };
  }

  /**
   * Check if user has access to a contract
   */
  private async checkContractAccess(
    contract: any,
    userId: string,
    userType: UserType
  ): Promise<boolean> {
    switch (userType) {
      case 'BUYER':
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        return buyer?.id === contract.buyerId;
      case 'SELLER':
        const seller = await prisma.seller.findUnique({ where: { userId } });
        return seller?.id === contract.sellerId;
      case 'FINANCIER':
        const financier = await prisma.financier.findUnique({ where: { userId } });
        return contract.financierId && financier?.id === contract.financierId;
      case 'ADMIN':
        return true;
      default:
        return false;
    }
  }

  /**
   * Send notifications when contract is generated
   */
  private async sendContractNotifications(
    contractId: string,
    contractType: ContractType,
    buyerUserId: string,
    sellerUserId: string,
    financierUserId?: string
  ) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) return;

    const typeLabel = contractType === 'TWO_PARTY' ? 'Self-Funded' : 'Financier-Funded';
    const title = 'Contract Generated';
    const message = `Your ${typeLabel} contract ${contract.contractNumber} for invoice ${contract.invoiceNumber} has been generated.`;

    const notifications = [
      {
        userId: buyerUserId,
        type: 'CONTRACT_GENERATED' as const,
        title,
        message,
        data: JSON.stringify({ contractId, contractNumber: contract.contractNumber }),
      },
      {
        userId: sellerUserId,
        type: 'CONTRACT_GENERATED' as const,
        title,
        message,
        data: JSON.stringify({ contractId, contractNumber: contract.contractNumber }),
      },
    ];

    if (financierUserId) {
      notifications.push({
        userId: financierUserId,
        type: 'CONTRACT_GENERATED' as const,
        title,
        message,
        data: JSON.stringify({ contractId, contractNumber: contract.contractNumber }),
      });
    }

    await prisma.notification.createMany({ data: notifications });
  }

  /**
   * Mark contract as completed
   */
  async completeContract(contractId: string) {
    return prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}

export const contractService = new ContractService();
