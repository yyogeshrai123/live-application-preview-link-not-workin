// ==============================================================================
// A ONE FINANCIAL SERVICES - Core Business Logic & Persistent Storage Engine
// Enforces All Core Financial Rules, Role Permissions & Audit Logging
// ==============================================================================

import {
  User,
  UserRole,
  Lender,
  Lead,
  LeadStatus,
  LoanApplication,
  DisbursementTransaction,
  TransferStatus,
  DisbursementLock,
  LenderPaymentReceipt,
  PartnerPayoutRule,
  PartnerPayout,
  IdRequest,
  NotificationItem,
  AuditLogItem,
  FinancialSummary,
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_LENDERS,
  INITIAL_LEADS,
  INITIAL_LOANS,
  INITIAL_DISBURSEMENTS,
  INITIAL_LOCKS,
  INITIAL_LENDER_PAYMENTS,
  INITIAL_PARTNER_RULES,
  INITIAL_PARTNER_PAYOUTS,
  INITIAL_ID_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'aone_current_user',
  USERS: 'aone_users',
  LENDERS: 'aone_lenders',
  LEADS: 'aone_leads',
  LOANS: 'aone_loans',
  DISBURSEMENTS: 'aone_disbursements',
  LOCKS: 'aone_locks',
  LENDER_PAYMENTS: 'aone_lender_payments',
  PARTNER_RULES: 'aone_partner_rules',
  PARTNER_PAYOUTS: 'aone_partner_payouts',
  ID_REQUESTS: 'aone_id_requests',
  NOTIFICATIONS: 'aone_notifications',
  AUDIT_LOGS: 'aone_audit_logs',
};

export const DATA_VERSION = 'v1.0.1_clean_prod_20261115';
const VERSION_KEY = 'aone_data_version';

// Safe JSON parser with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage, using fallback:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}

class StorageEngine {
  private users: User[];
  private currentUser: User;
  private lenders: Lender[];
  private leads: Lead[];
  private loans: LoanApplication[];
  private disbursements: DisbursementTransaction[];
  private locks: DisbursementLock[];
  private lenderPayments: LenderPaymentReceipt[];
  private partnerRules: PartnerPayoutRule[];
  private partnerPayouts: PartnerPayout[];
  private idRequests: IdRequest[];
  private notifications: NotificationItem[];
  private auditLogs: AuditLogItem[];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion !== DATA_VERSION) {
          // Clean reset to pristine seed data on version mismatch
          Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
          localStorage.setItem(VERSION_KEY, DATA_VERSION);
        }
      } catch (e) {
        console.warn('Error verifying storage version:', e);
      }
    }

    this.users = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // default CEO
    this.lenders = loadFromStorage(STORAGE_KEYS.LENDERS, INITIAL_LENDERS);
    this.leads = loadFromStorage(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    this.loans = loadFromStorage(STORAGE_KEYS.LOANS, INITIAL_LOANS);
    this.disbursements = loadFromStorage(STORAGE_KEYS.DISBURSEMENTS, INITIAL_DISBURSEMENTS);
    this.locks = loadFromStorage(STORAGE_KEYS.LOCKS, INITIAL_LOCKS);
    this.lenderPayments = loadFromStorage(STORAGE_KEYS.LENDER_PAYMENTS, INITIAL_LENDER_PAYMENTS);
    this.partnerRules = loadFromStorage(STORAGE_KEYS.PARTNER_RULES, INITIAL_PARTNER_RULES);
    this.partnerPayouts = loadFromStorage(STORAGE_KEYS.PARTNER_PAYOUTS, INITIAL_PARTNER_PAYOUTS);
    this.idRequests = loadFromStorage(STORAGE_KEYS.ID_REQUESTS, INITIAL_ID_REQUESTS);
    this.notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.auditLogs = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  // --- Reset to Initial Seed Data ---
  public resetToSeed(preserveRole: boolean = false): void {
    const roleToKeep = preserveRole && this.currentUser ? this.currentUser.role : 'CEO';
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    const matched = this.users.find((u) => u.role === roleToKeep) || this.users[0];
    this.currentUser = JSON.parse(JSON.stringify(matched));
    this.lenders = JSON.parse(JSON.stringify(INITIAL_LENDERS));
    this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
    this.loans = JSON.parse(JSON.stringify(INITIAL_LOANS));
    this.disbursements = JSON.parse(JSON.stringify(INITIAL_DISBURSEMENTS));
    this.locks = JSON.parse(JSON.stringify(INITIAL_LOCKS));
    this.lenderPayments = JSON.parse(JSON.stringify(INITIAL_LENDER_PAYMENTS));
    this.partnerRules = JSON.parse(JSON.stringify(INITIAL_PARTNER_RULES));
    this.partnerPayouts = JSON.parse(JSON.stringify(INITIAL_PARTNER_PAYOUTS));
    this.idRequests = JSON.parse(JSON.stringify(INITIAL_ID_REQUESTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

    this.persistAll();
  }

  private persistAll(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(VERSION_KEY, DATA_VERSION);
      } catch (e) {
        console.warn('Error saving data version:', e);
      }
    }
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    saveToStorage(STORAGE_KEYS.LENDERS, this.lenders);
    saveToStorage(STORAGE_KEYS.LEADS, this.leads);
    saveToStorage(STORAGE_KEYS.LOANS, this.loans);
    saveToStorage(STORAGE_KEYS.DISBURSEMENTS, this.disbursements);
    saveToStorage(STORAGE_KEYS.LOCKS, this.locks);
    saveToStorage(STORAGE_KEYS.LENDER_PAYMENTS, this.lenderPayments);
    saveToStorage(STORAGE_KEYS.PARTNER_RULES, this.partnerRules);
    saveToStorage(STORAGE_KEYS.PARTNER_PAYOUTS, this.partnerPayouts);
    saveToStorage(STORAGE_KEYS.ID_REQUESTS, this.idRequests);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- Audit Logging (Immutable) ---
  public logAudit(action: string, entityName: string, recordId: string, previousValue?: string, newValue?: string): void {
    const entry: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.role,
      action,
      entityName,
      recordId,
      previousValue: previousValue || 'None',
      newValue: newValue || 'None',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Local Session)',
    };
    this.auditLogs.unshift(entry);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- Notifications ---
  public createNotification(targetRole: UserRole | undefined, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT', link?: string): void {
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetRole,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(item);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // --- Current User & Role Switcher ---
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(userOrRole: User | UserRole): User {
    if (typeof userOrRole === 'string') {
      const match = this.users.find((u) => u.role === userOrRole && u.isActive);
      if (match) {
        this.currentUser = match;
      }
    } else {
      this.currentUser = userOrRole;
    }
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    return this.currentUser;
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  // --- Lenders Management ---
  public getLenders(onlyActive: boolean = false): Lender[] {
    if (onlyActive) {
      return this.lenders.filter((l) => l.isActive);
    }
    return [...this.lenders];
  }

  public addLender(name: string, code: string, asmName: string, asmContact: string, email?: string): Lender {
    if (this.currentUser.role !== 'CEO' && this.currentUser.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can add lenders.');
    }
    const newLender: Lender = {
      id: `len-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      isActive: true,
      createdAt: new Date().toISOString(),
      contacts: [
        {
          id: `con-${Date.now()}`,
          lenderId: `len-${Date.now()}`,
          asmName,
          asmContactNumber: asmContact,
          email,
          isActive: true,
        },
      ],
    };
    this.lenders.push(newLender);
    saveToStorage(STORAGE_KEYS.LENDERS, this.lenders);
    this.logAudit('LENDER_CREATED', 'Lender', newLender.id, undefined, `Created lender ${name}`);
    return newLender;
  }

  public toggleLenderStatus(lenderId: string): Lender {
    if (this.currentUser.role !== 'CEO' && this.currentUser.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can manage lenders.');
    }
    const lender = this.lenders.find((l) => l.id === lenderId);
    if (!lender) throw new Error('Lender not found.');
    const prev = lender.isActive;
    lender.isActive = !lender.isActive;
    saveToStorage(STORAGE_KEYS.LENDERS, this.lenders);
    this.logAudit('LENDER_STATUS_TOGGLED', 'Lender', lenderId, `Active: ${prev}`, `Active: ${lender.isActive}`);
    return lender;
  }

  public addLenderContact(lenderId: string, asmName: string, asmContactNumber: string, email?: string): LenderContact {
    const lender = this.lenders.find((l) => l.id === lenderId);
    if (!lender) throw new Error('Lender not found.');
    const newContact: LenderContact = {
      id: `con-${Date.now()}`,
      lenderId,
      asmName,
      asmContactNumber,
      email,
      isActive: true,
    };
    lender.contacts.push(newContact);
    saveToStorage(STORAGE_KEYS.LENDERS, this.lenders);
    this.logAudit('LENDER_CONTACT_ADDED', 'LenderContact', newContact.id, undefined, `Added ASM ${asmName} to ${lender.name}`);
    return newContact;
  }

  // --- Leads Management & Privacy Rules ---
  public getLeads(): Lead[] {
    const user = this.currentUser;
    switch (user.role) {
      case 'CEO':
      case 'ADMIN':
        return [...this.leads];
      case 'MANAGER':
        // Manager sees team leads (assigned to officers in their team or submitted by their team/partners)
        return this.leads.filter((l) => l.managerId === user.id || l.createdById === user.id);
      case 'OFFICER':
        // Sales Officer sees their own assigned leads + leads from linked/assigned partners
        return this.leads.filter((l) => l.assignedOfficerId === user.id || l.createdById === user.id);
      case 'PARTNER':
        // Channel Partner sees ONLY leads submitted by themselves
        return this.leads.filter((l) => l.channelPartnerId === user.id || l.createdById === user.id);
      default:
        return [];
    }
  }

  public checkLeadDuplicates(phoneNumber: string, vehicleNumber: string): { duplicateFound: boolean; reason?: string } {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const cleanVehicle = vehicleNumber.replace(/[\s-]+/g, '').toUpperCase();

    const phoneMatch = this.leads.find((l) => l.customerContactNumber.replace(/\s+/g, '') === cleanPhone);
    if (phoneMatch) {
      return { duplicateFound: true, reason: `Lead already exists with Customer Contact Number ${phoneNumber} (File: ${phoneMatch.fileReference})` };
    }

    const vehicleMatch = this.leads.find((l) => l.vehicleNumber.replace(/[\s-]+/g, '').toUpperCase() === cleanVehicle);
    if (vehicleMatch) {
      return { duplicateFound: true, reason: `Lead already exists with Vehicle Number ${vehicleNumber} (File: ${vehicleMatch.fileReference})` };
    }

    return { duplicateFound: false };
  }

  public createLead(leadData: Omit<Lead, 'id' | 'fileReference' | 'createdById' | 'createdByName' | 'assignedOfficerId' | 'salesOfficerName' | 'salesOfficerContactNumber' | 'isDirectLead' | 'createdAt' | 'updatedAt' | 'documents'> & { assignedOfficerId?: string; documents?: any[] }): Lead {
    const user = this.currentUser;

    // Validate ALL 16 Mandatory fields
    if (!leadData.customerName?.trim()) throw new Error('Customer Name is mandatory.');
    if (!leadData.fatherName?.trim()) throw new Error('Father Name is mandatory.');
    if (!leadData.coApplicantName?.trim()) throw new Error('Co-applicant Name is mandatory.');
    if (!leadData.customerContactNumber?.trim()) throw new Error('Customer Contact Number is mandatory.');
    if (!leadData.coApplicantContactNumber?.trim()) throw new Error('Co-applicant Contact Number is mandatory.');
    if (!leadData.customerAddress?.trim()) throw new Error('Customer Address is mandatory.');
    if (!leadData.vehicleNumber?.trim()) throw new Error('Vehicle Number is mandatory.');
    if (!leadData.vehicleMake?.trim()) throw new Error('Vehicle Make is mandatory.');
    if (!leadData.vehicleModel?.trim()) throw new Error('Vehicle Model is mandatory.');
    if (!leadData.lenderId?.trim()) throw new Error('Lender is mandatory.');
    if (!leadData.asmName?.trim()) throw new Error('Lender ASM Name is mandatory.');
    if (!leadData.asmContactNumber?.trim()) throw new Error('Lender ASM Contact Number is mandatory.');
    if (!leadData.bankAccount?.bankName?.trim()) throw new Error('Customer Bank Name is mandatory.');
    if (!leadData.bankAccount?.accountNumber?.trim()) throw new Error('Customer Bank Account Number is mandatory.');
    if (!leadData.bankAccount?.ifscCode?.trim()) throw new Error('Customer Bank IFSC Code is mandatory.');

    // Verify Lender is Active
    const lender = this.lenders.find((l) => l.id === leadData.lenderId);
    if (!lender || !lender.isActive) {
      throw new Error('Selected lender is inactive or not found.');
    }

    // AUTOMATIC OFFICER ASSIGNMENT RULE:
    // If current user is Sales Officer, automatically assign to current user and ignore client input!
    let assignedOfficer: User;
    if (user.role === 'OFFICER') {
      assignedOfficer = user;
    } else if (leadData.assignedOfficerId) {
      const match = this.users.find((u) => u.id === leadData.assignedOfficerId && u.role === 'OFFICER');
      if (!match) throw new Error('Selected officer not found.');
      assignedOfficer = match;
    } else {
      // Default to first available active officer
      const fallbackOfficer = this.users.find((u) => u.role === 'OFFICER' && u.isActive) || user;
      assignedOfficer = fallbackOfficer;
    }

    // Channel partner link
    const isDirectLead = !leadData.channelPartnerId;
    let partnerUser: User | undefined;
    if (user.role === 'PARTNER') {
      partnerUser = user;
    } else if (leadData.channelPartnerId) {
      partnerUser = this.users.find((u) => u.id === leadData.channelPartnerId && u.role === 'PARTNER');
    }

    const leadId = `lead-${Date.now()}`;
    const fileReference = `AONE/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/FL-${Math.floor(1000 + Math.random() * 9000)}`;

    const maskedAcc = '••••' + leadData.bankAccount.accountNumber.slice(-4);

    const newLead: Lead = {
      ...leadData,
      id: leadId,
      fileReference,
      createdById: user.id,
      createdByName: user.fullName,
      assignedOfficerId: assignedOfficer.id,
      salesOfficerName: assignedOfficer.fullName,
      salesOfficerContactNumber: assignedOfficer.phoneNumber,
      managerId: assignedOfficer.managerId || user.managerId,
      managerName: assignedOfficer.managerName || user.managerName,
      bankAccount: {
        ...leadData.bankAccount,
        id: `ba-${Date.now()}`,
        maskedAccountNumber: maskedAcc,
      },
      channelPartnerId: partnerUser?.id,
      channelPartnerName: partnerUser?.fullName,
      isDirectLead,
      status: 'NEW',
      documents: leadData.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.leads.unshift(newLead);
    saveToStorage(STORAGE_KEYS.LEADS, this.leads);

    this.logAudit(
      'LEAD_CREATED',
      'Lead',
      newLead.id,
      undefined,
      `Lead ${fileReference} created for ${newLead.customerName}. Assigned to ${assignedOfficer.fullName}. Channel Partner: ${partnerUser?.fullName || 'Direct'}`
    );

    this.createNotification(
      'ADMIN',
      `New Lead: ${newLead.customerName}`,
      `File ${fileReference} created by ${user.fullName} and assigned to ${assignedOfficer.fullName}.`,
      'INFO',
      'lead-list'
    );

    return newLead;
  }

  public updateLeadStatus(leadId: string, newStatus: LeadStatus, remarks?: string): Lead {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found.');
    const prevStatus = lead.status;
    lead.status = newStatus;
    if (remarks) lead.remarks = remarks;
    lead.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.LEADS, this.leads);
    this.logAudit('LEAD_STATUS_UPDATED', 'Lead', leadId, `Status: ${prevStatus}`, `Status: ${newStatus}`);

    this.createNotification(
      undefined,
      `Lead Status Updated: ${lead.customerName}`,
      `Lead ${lead.fileReference} moved to ${newStatus}.`,
      'INFO',
      'lead-list'
    );

    return lead;
  }

  public assignLead(leadId: string, targetOfficerId: string, notes?: string): Lead {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new Error('You do not have permission to reassign leads.');
    }
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found.');

    const targetOfficer = this.users.find((u) => u.id === targetOfficerId && u.role === 'OFFICER');
    if (!targetOfficer) throw new Error('Target officer not found.');

    // If manager, ensure officer belongs to manager's team
    if (user.role === 'MANAGER' && targetOfficer.managerId !== user.id) {
      throw new Error('Managers can only assign leads to officers in their own team.');
    }

    const prevOfficer = lead.salesOfficerName;
    lead.assignedOfficerId = targetOfficer.id;
    lead.salesOfficerName = targetOfficer.fullName;
    lead.salesOfficerContactNumber = targetOfficer.phoneNumber;
    lead.status = 'ASSIGNED';
    lead.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.LEADS, this.leads);
    this.logAudit(
      'LEAD_REASSIGNED',
      'Lead',
      leadId,
      `Officer: ${prevOfficer}`,
      `Assigned to: ${targetOfficer.fullName}. Notes: ${notes || 'None'}`
    );

    return lead;
  }

  // --- Loan Applications Management ---
  public getLoans(): LoanApplication[] {
    const visibleLeads = this.getLeads();
    const visibleLeadIds = new Set(visibleLeads.map((l) => l.id));
    return this.loans.filter((ln) => visibleLeadIds.has(ln.leadId));
  }

  public createLoanApplication(data: { leadId: string; appliedAmount: number; loanType?: string }): LoanApplication {
    const lead = this.leads.find((l) => l.id === data.leadId);
    if (!lead) throw new Error('Lead not found.');

    const applicationNumber = `APP-${lead.lenderName.replace(/\s+/g, '').toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLoan: LoanApplication = {
      id: `loan-${Date.now()}`,
      leadId: lead.id,
      customerName: lead.customerName,
      applicationNumber,
      lenderId: lead.lenderId,
      lenderName: lead.lenderName,
      loanType: data.loanType || 'New Vehicle Loan',
      appliedAmount: data.appliedAmount,
      sanctionedAmount: 0,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'UNDER_PROCESS',
      createdAt: new Date().toISOString(),
    };

    this.loans.unshift(newLoan);
    lead.status = 'APPLICATION_SUBMITTED';
    saveToStorage(STORAGE_KEYS.LOANS, this.loans);
    saveToStorage(STORAGE_KEYS.LEADS, this.leads);

    this.logAudit('LOAN_APPLICATION_CREATED', 'LoanApplication', newLoan.id, undefined, `Applied for ₹${data.appliedAmount.toLocaleString('en-IN')}`);
    return newLoan;
  }

  public sanctionLoan(loanId: string, sanctionedAmount: number, lenderRef: string, remarks?: string): LoanApplication {
    if (this.currentUser.role !== 'CEO' && this.currentUser.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can record loan sanctions.');
    }
    const loan = this.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found.');
    if (sanctionedAmount <= 0) throw new Error('Sanctioned amount must be greater than 0.');

    loan.sanctionedAmount = sanctionedAmount;
    loan.sanctionDate = new Date().toISOString().split('T')[0];
    loan.status = 'SANCTIONED';
    loan.lenderReferenceNumber = lenderRef;
    loan.remarks = remarks;

    const lead = this.leads.find((l) => l.id === loan.leadId);
    if (lead) {
      lead.status = 'SANCTIONED';
    }

    // Auto-create Partner Payout snapshot if lead has Channel Partner
    if (lead?.channelPartnerId) {
      this.createOrUpdatePartnerPayout(lead.channelPartnerId, lead.channelPartnerName || 'Partner', loan.id, lead.customerName, sanctionedAmount);
    }

    saveToStorage(STORAGE_KEYS.LOANS, this.loans);
    saveToStorage(STORAGE_KEYS.LEADS, this.leads);

    this.logAudit(
      'LOAN_SANCTIONED',
      'LoanApplication',
      loanId,
      'Status: UNDER_PROCESS',
      `Sanctioned: ₹${sanctionedAmount.toLocaleString('en-IN')}, Ref: ${lenderRef}`
    );

    this.createNotification(
      undefined,
      `Loan Sanctioned: ${loan.customerName}`,
      `Sanctioned amount ₹${sanctionedAmount.toLocaleString('en-IN')} approved by ${loan.lenderName}.`,
      'SUCCESS',
      'loan-management'
    );

    return loan;
  }

  // --- Financial Formulas: Locked Amount & Available Balance ---
  public calculateLoanFinancials(loanId: string): {
    sanctionedAmount: number;
    totalSuccessfulDisbursement: number;
    activeLockedAmount: number;
    availableBalance: number;
  } {
    const loan = this.loans.find((l) => l.id === loanId);
    const sanctionedAmount = loan ? Number(loan.sanctionedAmount) : 0;

    // Formula: Total Disbursed = Sum of SUCCESSFUL, non-reversed transfers.
    const successfulTransfers = this.disbursements
      .filter((d) => d.loanId === loanId && d.status === 'SUCCESSFUL')
      .reduce((acc, curr) => acc + Number(curr.transferAmount), 0);

    // Formula: Active Locked Amount = Total locks - Released amounts.
    const activeLocks = this.locks
      .filter((l) => l.loanId === loanId && l.status !== 'RELEASED')
      .reduce((acc, curr) => acc + (Number(curr.lockedAmount) - Number(curr.releasedAmount)), 0);

    // Formula: Available Balance = Sanctioned Amount - Total Disbursed - Active Locked Amount.
    const availableBalance = Math.max(0, sanctionedAmount - successfulTransfers - activeLocks);

    return {
      sanctionedAmount,
      totalSuccessfulDisbursement: successfulTransfers,
      activeLockedAmount: activeLocks,
      availableBalance,
    };
  }

  // --- Bank Transfers & Disbursements ---
  public getDisbursements(): DisbursementTransaction[] {
    return [...this.disbursements];
  }

  public addBankTransfer(data: {
    loanId: string;
    transferAmount: number;
    beneficiaryAccount: string;
    accountHolderName: string;
    utrNumber: string;
    remarks?: string;
    bankProofUrl?: string;
  }): DisbursementTransaction {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN') {
      throw new Error('Only authorized CEO/Admin users can record and verify financial transactions.');
    }

    const loan = this.loans.find((l) => l.id === data.loanId);
    if (!loan) throw new Error('Loan not found.');

    const { availableBalance } = this.calculateLoanFinancials(data.loanId);

    // CRITICAL FINANCIAL RULE: No transfer beyond available balance!
    if (data.transferAmount > availableBalance) {
      throw new Error(
        `Transfer amount ₹${data.transferAmount.toLocaleString('en-IN')} exceeds available balance ₹${availableBalance.toLocaleString('en-IN')}. Cannot over-disburse.`
      );
    }

    // Check duplicate UTR
    const duplicateUtr = this.disbursements.find((d) => d.utrNumber.trim().toUpperCase() === data.utrNumber.trim().toUpperCase());
    if (duplicateUtr) {
      throw new Error(`Duplicate transaction UTR '${data.utrNumber}' already recorded.`);
    }

    const maskedAcc = '••••' + data.beneficiaryAccount.slice(-4);
    const newTxn: DisbursementTransaction = {
      id: `disb-${Date.now()}`,
      loanId: loan.id,
      customerName: loan.customerName,
      beneficiaryAccount: data.beneficiaryAccount,
      maskedAccount: maskedAcc,
      accountHolderName: data.accountHolderName,
      transferAmount: data.transferAmount,
      transferDate: new Date().toISOString(),
      utrNumber: data.utrNumber.trim().toUpperCase(),
      status: 'SUCCESSFUL', // Verified transfer recorded
      bankProofUrl: data.bankProofUrl || 'bank_transfer_advice.pdf',
      remarks: data.remarks,
      createdById: user.id,
      createdByName: user.fullName,
      verifiedById: user.id,
      verifiedByName: user.fullName,
      verifiedAt: new Date().toISOString(),
      idempotencyKey: `idem-${data.loanId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.disbursements.unshift(newTxn);

    // Update Lead status according to disbursement progress
    const lead = this.leads.find((l) => l.id === loan.leadId);
    if (lead) {
      const updatedFin = this.calculateLoanFinancials(loan.id);
      if (updatedFin.availableBalance <= 0) {
        lead.status = 'FULLY_DISBURSED';
      } else {
        lead.status = 'PARTIALLY_DISBURSED';
      }
    }

    saveToStorage(STORAGE_KEYS.DISBURSEMENTS, this.disbursements);
    saveToStorage(STORAGE_KEYS.LEADS, this.leads);

    this.logAudit(
      'BANK_TRANSFER_RECORDED',
      'DisbursementTransaction',
      newTxn.id,
      undefined,
      `Transferred ₹${data.transferAmount.toLocaleString('en-IN')} to ${data.accountHolderName} (UTR: ${data.utrNumber}). Verified by ${user.fullName}.`
    );

    return newTxn;
  }

  public updateTransferStatus(transactionId: string, status: TransferStatus, reason?: string): DisbursementTransaction {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can alter transaction status.');
    }
    const txn = this.disbursements.find((d) => d.id === transactionId);
    if (!txn) throw new Error('Transaction not found.');
    const prevStatus = txn.status;
    txn.status = status;
    if (reason) {
      txn.remarks = (txn.remarks ? txn.remarks + ' | ' : '') + `Status changed to ${status}: ${reason}`;
    }

    saveToStorage(STORAGE_KEYS.DISBURSEMENTS, this.disbursements);
    this.logAudit('TRANSFER_STATUS_MODIFIED', 'DisbursementTransaction', transactionId, `Status: ${prevStatus}`, `Status: ${status}. Reason: ${reason || 'N/A'}`);

    return txn;
  }

  // --- Locked Amount Management ---
  public getLocks(): DisbursementLock[] {
    return [...this.locks];
  }

  public addLock(loanId: string, lockedAmount: number, reason: string): DisbursementLock {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can create locked amounts.');
    }
    const loan = this.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan not found.');

    const { availableBalance } = this.calculateLoanFinancials(loanId);
    if (lockedAmount > availableBalance) {
      throw new Error(
        `Lock amount ₹${lockedAmount.toLocaleString('en-IN')} exceeds available balance ₹${availableBalance.toLocaleString('en-IN')}. Cannot lock more than available.`
      );
    }

    const newLock: DisbursementLock = {
      id: `lock-${Date.now()}`,
      loanId,
      customerName: loan.customerName,
      lockedAmount,
      releasedAmount: 0,
      status: 'ACTIVE',
      reason,
      createdById: user.id,
      createdByName: user.fullName,
      createdAt: new Date().toISOString(),
      releases: [],
    };

    this.locks.unshift(newLock);
    saveToStorage(STORAGE_KEYS.LOCKS, this.locks);

    this.logAudit(
      'DISBURSEMENT_LOCK_CREATED',
      'DisbursementLock',
      newLock.id,
      undefined,
      `Locked ₹${lockedAmount.toLocaleString('en-IN')} for ${loan.customerName}. Reason: ${reason}`
    );

    return newLock;
  }

  public releaseLock(lockId: string, releaseAmount: number, reason: string): DisbursementLock {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can release locked amounts.');
    }
    const lock = this.locks.find((l) => l.id === lockId);
    if (!lock) throw new Error('Lock record not found.');

    const remainingLocked = lock.lockedAmount - lock.releasedAmount;
    if (releaseAmount > remainingLocked) {
      throw new Error(
        `Release amount ₹${releaseAmount.toLocaleString('en-IN')} exceeds active remaining lock ₹${remainingLocked.toLocaleString('en-IN')}.`
      );
    }

    lock.releasedAmount += releaseAmount;
    if (lock.releasedAmount >= lock.lockedAmount) {
      lock.status = 'RELEASED';
    } else {
      lock.status = 'PARTIALLY_RELEASED';
    }

    lock.releases.push({
      id: `rel-${Date.now()}`,
      amount: releaseAmount,
      reason,
      releasedById: user.id,
      releasedByName: user.fullName,
      releasedAt: new Date().toISOString(),
    });

    saveToStorage(STORAGE_KEYS.LOCKS, this.locks);

    this.logAudit(
      'LOCK_RELEASED',
      'DisbursementLock',
      lockId,
      `Remaining locked: ₹${remainingLocked.toLocaleString('en-IN')}`,
      `Released: ₹${releaseAmount.toLocaleString('en-IN')}. Reason: ${reason}. Status: ${lock.status}`
    );

    return lock;
  }

  // --- Lender Payments Received ---
  public getLenderPayments(): LenderPaymentReceipt[] {
    if (this.currentUser.role !== 'CEO' && this.currentUser.role !== 'ADMIN') {
      return []; // Strictly private to CEO/Admin
    }
    return [...this.lenderPayments];
  }

  public recordLenderPayment(data: {
    lenderId: string;
    loanId: string;
    amountReceived: number;
    receiptDate: string;
    transactionReference: string;
    bankDetails: string;
    remarks?: string;
  }): LenderPaymentReceipt {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can record lender payments.');
    }
    const lender = this.lenders.find((l) => l.id === data.lenderId);
    const loan = this.loans.find((l) => l.id === data.loanId);
    if (!lender || !loan) throw new Error('Lender or Loan not found.');

    const newReceipt: LenderPaymentReceipt = {
      id: `lrec-${Date.now()}`,
      lenderId: lender.id,
      lenderName: lender.name,
      loanId: loan.id,
      customerName: loan.customerName,
      sanctionedAmount: loan.sanctionedAmount,
      amountReceived: data.amountReceived,
      receiptDate: data.receiptDate,
      transactionReference: data.transactionReference,
      bankDetails: data.bankDetails,
      remarks: data.remarks,
      recordedById: user.id,
      recordedByName: user.fullName,
      createdAt: new Date().toISOString(),
    };

    this.lenderPayments.unshift(newReceipt);
    saveToStorage(STORAGE_KEYS.LENDER_PAYMENTS, this.lenderPayments);

    this.logAudit(
      'LENDER_PAYMENT_RECEIVED',
      'LenderPaymentReceipt',
      newReceipt.id,
      undefined,
      `Received ₹${data.amountReceived.toLocaleString('en-IN')} from ${lender.name} for ${loan.customerName}. Ref: ${data.transactionReference}`
    );

    return newReceipt;
  }

  // --- Channel Partner Payouts & Rules ---
  public getPartnerPayoutRules(): PartnerPayoutRule[] {
    return [...this.partnerRules];
  }

  public updatePartnerPayoutRule(loanType: string, percentage: number): PartnerPayoutRule {
    if (this.currentUser.role !== 'CEO') {
      throw new Error('Only CEO can configure partner payout rules.');
    }
    let rule = this.partnerRules.find((r) => r.loanType === loanType);
    if (rule) {
      const prev = rule.payoutPercentage;
      rule.payoutPercentage = percentage;
      this.logAudit('PAYOUT_RULE_UPDATED', 'PartnerPayoutRule', rule.id, `${prev}%`, `${percentage}%`);
    } else {
      rule = {
        id: `rule-${Date.now()}`,
        loanType,
        payoutPercentage: percentage,
        isActive: true,
      };
      this.partnerRules.push(rule);
      this.logAudit('PAYOUT_RULE_CREATED', 'PartnerPayoutRule', rule.id, undefined, `${loanType}: ${percentage}%`);
    }
    saveToStorage(STORAGE_KEYS.PARTNER_RULES, this.partnerRules);
    return rule;
  }

  public getPartnerPayouts(): PartnerPayout[] {
    // Only CEO and Admin can access payout management
    if (this.currentUser.role !== 'CEO' && this.currentUser.role !== 'ADMIN') {
      return [];
    }
    return [...this.partnerPayouts];
  }

  public createOrUpdatePartnerPayout(partnerId: string, partnerName: string, loanId: string, customerName: string, sanctionedAmount: number): PartnerPayout {
    const existing = this.partnerPayouts.find((p) => p.loanId === loanId);
    if (existing) return existing;

    // Fetch applicable rule
    const rule = this.partnerRules.find((r) => r.isActive) || { payoutPercentage: 2.0 };
    const snapshotPercentage = rule.payoutPercentage;

    // Formula: Partner Payout = Sanctioned Loan Amount × Applicable Payout Percentage
    const payableAmount = Number((sanctionedAmount * (snapshotPercentage / 100)).toFixed(2));

    const newPayout: PartnerPayout = {
      id: `ppay-${Date.now()}`,
      partnerId,
      partnerName,
      loanId,
      customerName,
      sanctionedAmount,
      payoutPercentageSnapshot: snapshotPercentage,
      payableAmount,
      paidAmount: 0,
      pendingAmount: payableAmount,
      status: 'PENDING',
      transactions: [],
      createdAt: new Date().toISOString(),
    };

    this.partnerPayouts.unshift(newPayout);
    saveToStorage(STORAGE_KEYS.PARTNER_PAYOUTS, this.partnerPayouts);

    this.logAudit(
      'PARTNER_PAYOUT_CALCULATED',
      'PartnerPayout',
      newPayout.id,
      undefined,
      `Payable ₹${payableAmount.toLocaleString('en-IN')} (${snapshotPercentage}% of ₹${sanctionedAmount.toLocaleString('en-IN')}) for ${partnerName}`
    );

    return newPayout;
  }

  public recordPartnerPayoutTransaction(payoutId: string, amount: number, utrNumber: string, remarks?: string): PartnerPayout {
    const user = this.currentUser;
    if (user.role !== 'CEO' && user.role !== 'ADMIN') {
      throw new Error('Only CEO or Admin can record partner payouts.');
    }
    const payout = this.partnerPayouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error('Partner payout record not found.');

    if (amount > payout.pendingAmount) {
      throw new Error(`Payment amount ₹${amount.toLocaleString('en-IN')} exceeds pending payable balance ₹${payout.pendingAmount.toLocaleString('en-IN')}.`);
    }

    payout.paidAmount += amount;
    payout.pendingAmount -= amount;
    if (payout.pendingAmount <= 0) {
      payout.status = 'PAID';
    } else {
      payout.status = 'PARTIALLY_PAID';
    }

    payout.transactions.push({
      id: `ptxn-${Date.now()}`,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      utrNumber,
      remarks,
      recordedByName: user.fullName,
    });

    saveToStorage(STORAGE_KEYS.PARTNER_PAYOUTS, this.partnerPayouts);

    this.logAudit(
      'PARTNER_PAYOUT_PAID',
      'PartnerPayout',
      payoutId,
      `Pending was ₹${(payout.pendingAmount + amount).toLocaleString('en-IN')}`,
      `Paid ₹${amount.toLocaleString('en-IN')} via UTR: ${utrNumber}. Status: ${payout.status}`
    );

    return payout;
  }

  // --- ID Requests & KYC Onboarding Workflow ---
  public getIdRequests(): IdRequest[] {
    const user = this.currentUser;
    switch (user.role) {
      case 'CEO':
      case 'ADMIN':
        return [...this.idRequests];
      case 'MANAGER':
        return this.idRequests.filter((r) => r.submittedById === user.id || r.assignedManagerId === user.id);
      default:
        return [];
    }
  }

  public submitIdRequest(data: Omit<IdRequest, 'id' | 'status' | 'submittedById' | 'submittedByName' | 'createdAt' | 'updatedAt'>): IdRequest {
    const user = this.currentUser;
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN' && user.role !== 'CEO') {
      throw new Error('You do not have permission to submit ID requests.');
    }

    const newReq: IdRequest = {
      ...data,
      id: `idreq-${Date.now()}`,
      status: 'PENDING_ADMIN',
      submittedById: user.id,
      submittedByName: user.fullName,
      assignedManagerId: data.assignedManagerId || user.id,
      assignedManagerName: data.assignedManagerName || user.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.idRequests.unshift(newReq);
    saveToStorage(STORAGE_KEYS.ID_REQUESTS, this.idRequests);

    this.logAudit('ID_REQUEST_SUBMITTED', 'IdRequest', newReq.id, undefined, `Submitted KYC onboarding for ${newReq.fullName} (${newReq.requestedRole})`);

    this.createNotification(
      'ADMIN',
      'New ID Request Pending Review',
      `${user.fullName} submitted an ID request for ${newReq.fullName} (${newReq.requestedRole}).`,
      'ALERT',
      'id-approval'
    );

    return newReq;
  }

  public adminReviewIdRequest(requestId: string, approve: boolean, remarks?: string): IdRequest {
    const user = this.currentUser;
    if (user.role !== 'ADMIN' && user.role !== 'CEO') {
      throw new Error('Only Admin or CEO can review ID requests.');
    }
    const req = this.idRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('ID Request not found.');

    req.adminReviewedById = user.id;
    req.adminReviewedByName = user.fullName;
    req.adminReviewedAt = new Date().toISOString();
    req.adminRemarks = remarks;
    req.status = approve ? 'PENDING_CEO' : 'REJECTED';
    req.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.ID_REQUESTS, this.idRequests);

    this.logAudit(
      'ID_REQUEST_ADMIN_REVIEW',
      'IdRequest',
      requestId,
      'PENDING_ADMIN',
      `${approve ? 'Approved and forwarded to CEO' : 'Rejected by Admin'}. Remarks: ${remarks || 'None'}`
    );

    if (approve) {
      this.createNotification(
        'CEO',
        'ID Request Awaiting Final CEO Approval',
        `Admin ${user.fullName} verified documents for ${req.fullName}. Final CEO approval required.`,
        'ALERT',
        'id-approval'
      );
    }

    return req;
  }

  public ceoFinalApproveIdRequest(requestId: string, approve: boolean, remarks?: string): IdRequest {
    const user = this.currentUser;
    if (user.role !== 'CEO') {
      throw new Error('Only CEO can provide final approval for ID requests.');
    }
    const req = this.idRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('ID Request not found.');

    req.ceoApprovedById = user.id;
    req.ceoApprovedByName = user.fullName;
    req.ceoApprovedAt = new Date().toISOString();
    req.ceoRemarks = remarks;
    req.updatedAt = new Date().toISOString();

    if (approve) {
      req.status = 'APPROVED';
      // Automatically create the active User account
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: req.email,
        fullName: req.fullName,
        phoneNumber: req.mobileNumber,
        role: req.requestedRole,
        isActive: true,
        managerId: req.assignedManagerId,
        managerName: req.assignedManagerName,
        createdAt: new Date().toISOString(),
      };
      this.users.push(newUser);
      req.createdUserId = newUser.id;
      saveToStorage(STORAGE_KEYS.USERS, this.users);

      this.logAudit('USER_ACTIVATED_POST_APPROVAL', 'User', newUser.id, undefined, `User ${newUser.fullName} (${newUser.role}) created and activated post CEO approval.`);

      this.createNotification(
        undefined,
        'Account Activated',
        `ID Request for ${req.fullName} (${req.requestedRole}) has been approved by CEO. Account is now active.`,
        'SUCCESS',
        'user-management'
      );
    } else {
      req.status = 'REJECTED';
    }

    saveToStorage(STORAGE_KEYS.ID_REQUESTS, this.idRequests);

    this.logAudit(
      'ID_REQUEST_CEO_FINAL',
      'IdRequest',
      requestId,
      'PENDING_CEO',
      `CEO Final Verdict: ${approve ? 'APPROVED' : 'REJECTED'}. Remarks: ${remarks || 'None'}`
    );

    return req;
  }

  // --- Financial Dashboard Aggregations ---
  public getFinancialSummary(): FinancialSummary {
    let totalSanctionedAmount = 0;
    let totalSuccessfulDisbursement = 0;
    let activeLockedAmount = 0;

    for (const loan of this.loans) {
      const fin = this.calculateLoanFinancials(loan.id);
      totalSanctionedAmount += fin.sanctionedAmount;
      totalSuccessfulDisbursement += fin.totalSuccessfulDisbursement;
      activeLockedAmount += fin.activeLockedAmount;
    }

    const availableBalance = Math.max(0, totalSanctionedAmount - totalSuccessfulDisbursement - activeLockedAmount);
    const pendingDisbursement = Math.max(0, totalSanctionedAmount - totalSuccessfulDisbursement);

    const lenderPaymentsReceived = this.lenderPayments.reduce((acc, curr) => acc + Number(curr.amountReceived), 0);
    const partnerPayoutPayable = this.partnerPayouts.reduce((acc, curr) => acc + Number(curr.payableAmount), 0);
    const partnerPayoutPaid = this.partnerPayouts.reduce((acc, curr) => acc + Number(curr.paidAmount), 0);
    const partnerPayoutPending = Math.max(0, partnerPayoutPayable - partnerPayoutPaid);

    // Formula: Company Net Payout = Lender Payout Received - Partner Payout Paid
    const companyNetPayout = Number((lenderPaymentsReceived - partnerPayoutPaid).toFixed(2));

    return {
      totalSanctionedAmount,
      totalSuccessfulDisbursement,
      pendingDisbursement,
      activeLockedAmount,
      availableBalance,
      lenderPaymentsReceived,
      partnerPayoutPayable,
      partnerPayoutPaid,
      partnerPayoutPending,
      companyNetPayout,
    };
  }

  public getNotifications(): NotificationItem[] {
    const user = this.currentUser;
    return this.notifications.filter((n) => !n.targetRole || n.targetRole === user.role || n.userId === user.id);
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  public getAuditLogs(): AuditLogItem[] {
    if (this.currentUser.role !== 'CEO' && this.currentUser.role !== 'ADMIN') {
      return []; // Audit logs restricted to CEO/Admin
    }
    return [...this.auditLogs];
  }
}

export const storage = new StorageEngine();
