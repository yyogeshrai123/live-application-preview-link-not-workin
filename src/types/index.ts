// ==============================================================================
// A ONE FINANCIAL SERVICES - Core Domain Types & Definitions
// ==============================================================================

export type UserRole = 'CEO' | 'ADMIN' | 'MANAGER' | 'OFFICER' | 'PARTNER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  managerId?: string;
  managerName?: string;
  teamId?: string;
  teamName?: string;
  createdAt: string;
}

export type IdRequestStatus = 'PENDING_ADMIN' | 'PENDING_CEO' | 'APPROVED' | 'REJECTED';

export interface IdRequest {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  address: string;
  requestedRole: UserRole;
  panNumber: string;
  aadhaarNumber: string;
  bankAccountDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  submittedById: string;
  submittedByName: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  status: IdRequestStatus;
  adminReviewedById?: string;
  adminReviewedByName?: string;
  adminReviewedAt?: string;
  adminRemarks?: string;
  ceoApprovedById?: string;
  ceoApprovedByName?: string;
  ceoApprovedAt?: string;
  ceoRemarks?: string;
  createdUserId?: string;
  documents: {
    panCardUrl: string;
    aadhaarCardUrl: string;
    cancelledChequeUrl: string;
    bankStatementUrl: string;
  };
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadRequestType = 'EDIT' | 'DELETE';
export type LeadRequestStatus = 'PENDING_CEO' | 'APPROVED' | 'REJECTED';

export interface LeadChangeRequest {
  id: string;
  leadId: string;
  leadFileReference: string;
  customerName: string;
  requestType: LeadRequestType;
  status: LeadRequestStatus;
  requestedById: string;
  requestedByName: string;
  requestedByRole: UserRole;
  requestedAt: string;
  reason: string;
  proposedChanges?: Partial<Lead>;
  previousData?: Partial<Lead>;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  ceoRemarks?: string;
}

export interface LenderContact {
  id: string;
  lenderId: string;
  asmName: string;
  asmContactNumber: string;
  email?: string;
  isActive: boolean;
}

export interface Lender {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  contacts: LenderContact[];
  createdAt: string;
}

export type LeadStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENTS_RECEIVED'
  | 'APPLICATION_SUBMITTED'
  | 'UNDER_PROCESS'
  | 'SANCTIONED'
  | 'REJECTED'
  | 'DISBURSEMENT_PENDING'
  | 'PARTIALLY_DISBURSED'
  | 'FULLY_DISBURSED'
  | 'CLOSED';

export interface CustomerBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  ifscCode: string;
  branchName?: string;
}

export interface Lead {
  id: string;
  fileReference: string; // Customer Flee / File Reference
  // Mandatory customer fields
  customerName: string;
  fatherName: string;
  coApplicantName: string;
  customerContactNumber: string;
  coApplicantContactNumber: string;
  customerAddress: string;
  
  // Mandatory vehicle fields
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;

  // Mandatory lender & ASM fields
  lenderId: string;
  lenderName: string;
  asmName: string;
  asmContactNumber: string;

  // Mandatory Sales Officer fields
  createdById: string;
  createdByName: string;
  assignedOfficerId: string;
  salesOfficerName: string;
  salesOfficerContactNumber: string;
  managerId?: string;
  managerName?: string;

  // Customer Bank Account Details (Mandatory)
  bankAccount: CustomerBankAccount;

  // Optional Channel Partner field
  channelPartnerId?: string;
  channelPartnerName?: string;
  isDirectLead: boolean;

  // Lead Lifecycle & Follow-up
  status: LeadStatus;
  followUpDate?: string;
  remarks?: string;

  // Documents
  documents: {
    id: string;
    title: string;
    fileName: string;
    url: string;
    uploadedAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

export interface LoanApplication {
  id: string;
  leadId: string;
  customerName: string;
  applicationNumber: string;
  lenderId: string;
  lenderName: string;
  loanType: string;
  appliedAmount: number;
  sanctionedAmount: number;
  applicationDate: string;
  sanctionDate?: string;
  status: 'UNDER_PROCESS' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED';
  lenderReferenceNumber?: string;
  rejectionReason?: string;
  remarks?: string;
  createdAt: string;
}

export type TransferStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REVERSED';

export interface DisbursementTransaction {
  id: string;
  loanId: string;
  customerName: string;
  beneficiaryAccount: string;
  maskedAccount: string;
  accountHolderName: string;
  transferAmount: number;
  transferDate: string;
  utrNumber: string;
  status: TransferStatus;
  bankProofUrl?: string;
  remarks?: string;
  createdById: string;
  createdByName: string;
  verifiedById?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export type LockStatus = 'ACTIVE' | 'PARTIALLY_RELEASED' | 'RELEASED';

export interface DisbursementLock {
  id: string;
  loanId: string;
  customerName: string;
  lockedAmount: number;
  releasedAmount: number;
  status: LockStatus;
  reason: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  releases: {
    id: string;
    amount: number;
    reason: string;
    releasedById: string;
    releasedByName: string;
    releasedAt: string;
  }[];
}

export interface LenderPaymentReceipt {
  id: string;
  lenderId: string;
  lenderName: string;
  loanId: string;
  customerName: string;
  sanctionedAmount: number;
  amountReceived: number;
  receiptDate: string;
  transactionReference: string;
  bankDetails: string;
  proofUrl?: string;
  remarks?: string;
  recordedById: string;
  recordedByName: string;
  createdAt: string;
}

export interface PartnerPayoutRule {
  id: string;
  partnerId?: string; // specific partner or generic
  loanType: string;
  payoutPercentage: number; // e.g. 2.0%
  isActive: boolean;
}

export interface PartnerPayout {
  id: string;
  partnerId: string;
  partnerName: string;
  loanId: string;
  customerName: string;
  sanctionedAmount: number;
  payoutPercentageSnapshot: number; // Snapshot per loan
  payableAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
  transactions: {
    id: string;
    amount: number;
    paymentDate: string;
    utrNumber: string;
    bankProofUrl?: string;
    remarks?: string;
    recordedByName: string;
  }[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // target user or role
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityName: string;
  recordId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface FinancialSummary {
  totalSanctionedAmount: number;
  totalSuccessfulDisbursement: number;
  pendingDisbursement: number;
  activeLockedAmount: number;
  availableBalance: number;
  lenderPaymentsReceived: number;
  partnerPayoutPayable: number;
  partnerPayoutPaid: number;
  partnerPayoutPending: number;
  companyNetPayout: number; // Lender Payout Received - Partner Payout Paid
}
