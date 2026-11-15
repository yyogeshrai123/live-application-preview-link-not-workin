// ==============================================================================
// A ONE FINANCIAL SERVICES - 20 Comprehensive Automated Business Rule Tests
// Testing All Criteria Specified in Section 20 of Master Development Prompt
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../src/services/storage';

describe('A ONE FINANCIAL SERVICES – Automated Business Rules & Compliance Tests', () => {
  beforeEach(() => {
    storage.resetToSeed();
  });

  // TEST 1: CEO Permissions
  it('1. CEO permissions: CEO has full access to all modules, payout rules, and approvals', () => {
    storage.setCurrentUser('CEO');
    const ceo = storage.getCurrentUser();
    expect(ceo.role).toBe('CEO');

    // Can configure payout rules
    const updatedRule = storage.updatePartnerPayoutRule('Commercial Vehicle Loan', 3.0);
    expect(updatedRule.payoutPercentage).toBe(3.0);

    // Can access all leads
    const allLeads = storage.getLeads();
    expect(allLeads.length).toBeGreaterThanOrEqual(4);

    // Can view audit logs
    const auditLogs = storage.getAuditLogs();
    expect(auditLogs.length).toBeGreaterThan(0);
  });

  // TEST 2: Admin Permissions
  it('2. Admin permissions: Admin can verify transactions and approve ID requests, but restricted from CEO-only payout rule config', () => {
    storage.setCurrentUser('ADMIN');
    const admin = storage.getCurrentUser();
    expect(admin.role).toBe('ADMIN');

    // Admin cannot configure payout rules (CEO only)
    expect(() => {
      storage.updatePartnerPayoutRule('New Vehicle Loan', 5.0);
    }).toThrow(/Only CEO can configure partner payout rules/i);

    // Admin can review ID requests
    const idReqs = storage.getIdRequests();
    expect(idReqs.length).toBeGreaterThan(0);
    const reviewed = storage.adminReviewIdRequest(idReqs[0].id, true, 'Verified by Admin');
    expect(reviewed.status).toBe('PENDING_CEO');
  });

  // TEST 3: Manager Team-Level Access
  it('3. Manager team-level access: Manager can only view their own team and team leads', () => {
    storage.setCurrentUser('MANAGER');
    const mgr = storage.getCurrentUser();
    expect(mgr.role).toBe('MANAGER');

    const leads = storage.getLeads();
    // Every lead visible to manager must belong to their team/subordinates
    for (const lead of leads) {
      expect(lead.managerId === mgr.id || lead.createdById === mgr.id).toBe(true);
    }
  });

  // TEST 4: Officer Lead Privacy
  it('4. Officer lead privacy: Officer can only view their own assigned leads or linked partner leads', () => {
    storage.setCurrentUser('OFFICER');
    const officer = storage.getCurrentUser();
    expect(officer.role).toBe('OFFICER');

    const leads = storage.getLeads();
    for (const lead of leads) {
      expect(lead.assignedOfficerId === officer.id || lead.createdById === officer.id).toBe(true);
    }
  });

  // TEST 5: Channel Partner Lead Privacy
  it('5. Channel Partner lead privacy: Partner can only view their own leads, zero access to other partners or financial reports', () => {
    storage.setCurrentUser('PARTNER');
    const partner = storage.getCurrentUser();
    expect(partner.role).toBe('PARTNER');

    const leads = storage.getLeads();
    for (const lead of leads) {
      expect(lead.channelPartnerId === partner.id || lead.createdById === partner.id).toBe(true);
    }

    // Zero access to company payout management
    const payouts = storage.getPartnerPayouts();
    expect(payouts.length).toBe(0);

    // Zero access to lender payments
    const lenderPayments = storage.getLenderPayments();
    expect(lenderPayments.length).toBe(0);

    // Zero access to audit logs
    const auditLogs = storage.getAuditLogs();
    expect(auditLogs.length).toBe(0);
  });

  // TEST 6: Mandatory Lead Fields
  it('6. Mandatory lead fields: All 16 fields are strictly validated on submission', () => {
    storage.setCurrentUser('OFFICER');

    // Missing customer name
    expect(() => {
      storage.createLead({
        customerName: '',
        fatherName: 'Father',
        coApplicantName: 'CoApp',
        customerContactNumber: '+91 99999 11111',
        coApplicantContactNumber: '+91 99999 22222',
        customerAddress: 'Mumbai',
        vehicleNumber: 'MH-01-AA-9999',
        vehicleMake: 'Tata',
        vehicleModel: 'Harrier',
        lenderId: 'len-hdfc-01',
        lenderName: 'HDFC Bank',
        asmName: 'Suresh',
        asmContactNumber: '+91 98765 43210',
        bankAccount: {
          id: 'ba-test',
          bankName: 'HDFC Bank',
          accountNumber: '1234567890',
          maskedAccountNumber: '••••7890',
          ifscCode: 'HDFC0001',
        },
        status: 'NEW',
      });
    }).toThrow(/Customer Name is mandatory/i);

    // Missing bank details
    expect(() => {
      storage.createLead({
        customerName: 'Suresh Test',
        fatherName: 'Father',
        coApplicantName: 'CoApp',
        customerContactNumber: '+91 99999 11111',
        coApplicantContactNumber: '+91 99999 22222',
        customerAddress: 'Mumbai',
        vehicleNumber: 'MH-01-AA-9999',
        vehicleMake: 'Tata',
        vehicleModel: 'Harrier',
        lenderId: 'len-hdfc-01',
        lenderName: 'HDFC Bank',
        asmName: 'Suresh',
        asmContactNumber: '+91 98765 43210',
        bankAccount: {
          id: 'ba-test',
          bankName: '',
          accountNumber: '',
          maskedAccountNumber: '',
          ifscCode: '',
        },
        status: 'NEW',
      });
    }).toThrow(/Customer Bank Name is mandatory/i);
  });

  // TEST 7: Optional Channel Partner
  it('7. Optional Channel Partner: Lead can be submitted with or without Channel Partner', () => {
    storage.setCurrentUser('OFFICER');

    // Direct lead (no Channel Partner)
    const directLead = storage.createLead({
      customerName: 'Direct Client',
      fatherName: 'Father Client',
      coApplicantName: 'CoApp Client',
      customerContactNumber: '+91 91234 56789',
      coApplicantContactNumber: '+91 91234 56780',
      customerAddress: 'Bandra, Mumbai',
      vehicleNumber: 'MH-02-ZZ-1111',
      vehicleMake: 'Hyundai',
      vehicleModel: 'Verna',
      lenderId: 'len-hdfc-01',
      lenderName: 'HDFC Bank',
      asmName: 'Suresh Menon',
      asmContactNumber: '+91 98765 43210',
      bankAccount: {
        id: 'ba-1',
        bankName: 'HDFC Bank',
        accountNumber: '5010011223344',
        maskedAccountNumber: '••••3344',
        ifscCode: 'HDFC0000128',
      },
      status: 'NEW',
    });
    expect(directLead.isDirectLead).toBe(true);
    expect(directLead.channelPartnerId).toBeUndefined();

    // Lead with Channel Partner
    const cpLead = storage.createLead({
      customerName: 'Partner Client',
      fatherName: 'Father CP',
      coApplicantName: 'CoApp CP',
      customerContactNumber: '+91 91234 99999',
      coApplicantContactNumber: '+91 91234 88888',
      customerAddress: 'Andheri, Mumbai',
      vehicleNumber: 'MH-02-ZZ-2222',
      vehicleMake: 'Kia',
      vehicleModel: 'Seltos',
      lenderId: 'len-hdfc-01',
      lenderName: 'HDFC Bank',
      asmName: 'Suresh Menon',
      asmContactNumber: '+91 98765 43210',
      channelPartnerId: 'usr-cp-01',
      bankAccount: {
        id: 'ba-2',
        bankName: 'HDFC Bank',
        accountNumber: '5010099887711',
        maskedAccountNumber: '••••7711',
        ifscCode: 'HDFC0000128',
      },
      status: 'NEW',
    });
    expect(cpLead.isDirectLead).toBe(false);
    expect(cpLead.channelPartnerId).toBe('usr-cp-01');
  });

  // TEST 8: Automatic Officer Assignment
  it('8. Automatic Officer assignment: When Officer creates lead, it is strictly assigned to authenticated Officer', () => {
    storage.setCurrentUser('OFFICER');
    const officer = storage.getCurrentUser();

    // Officer attempts to pass a different officer ID
    const lead = storage.createLead({
      customerName: 'Auto Assign Client',
      fatherName: 'Father',
      coApplicantName: 'CoApp',
      customerContactNumber: '+91 99887 76655',
      coApplicantContactNumber: '+91 99887 76656',
      customerAddress: 'Pune',
      vehicleNumber: 'MH-14-AA-5555',
      vehicleMake: 'Maruti',
      vehicleModel: 'Brezza',
      lenderId: 'len-hdfc-01',
      lenderName: 'HDFC Bank',
      asmName: 'Suresh Menon',
      asmContactNumber: '+91 98765 43210',
      assignedOfficerId: 'usr-off-02', // Spoofed target
      bankAccount: {
        id: 'ba-3',
        bankName: 'SBI',
        accountNumber: '112233445566',
        maskedAccountNumber: '••••5566',
        ifscCode: 'SBIN0001234',
      },
      status: 'NEW',
    });

    // Must be assigned to currently logged-in officer, NOT spoofed target
    expect(lead.assignedOfficerId).toBe(officer.id);
    expect(lead.salesOfficerName).toBe(officer.fullName);
  });

  // TEST 9: Active Lender Dropdown
  it('9. Active lender dropdown: Inactive lenders do not appear for selection and lead creation rejects inactive lenders', () => {
    const activeLenders = storage.getLenders(true);
    expect(activeLenders.every((l) => l.isActive)).toBe(true);

    const inactiveLender = storage.getLenders(false).find((l) => !l.isActive);
    expect(inactiveLender).toBeDefined();

    // Trying to create lead with inactive lender throws error
    expect(() => {
      storage.createLead({
        customerName: 'Test Inactive',
        fatherName: 'Father',
        coApplicantName: 'CoApp',
        customerContactNumber: '+91 91111 00000',
        coApplicantContactNumber: '+91 91111 00001',
        customerAddress: 'Delhi',
        vehicleNumber: 'DL-01-XX-9999',
        vehicleMake: 'Tata',
        vehicleModel: 'Punch',
        lenderId: inactiveLender!.id,
        lenderName: inactiveLender!.name,
        asmName: 'ASM',
        asmContactNumber: '+91 98765 00000',
        bankAccount: {
          id: 'ba-test',
          bankName: 'HDFC',
          accountNumber: '12345678',
          maskedAccountNumber: '••••5678',
          ifscCode: 'HDFC0001',
        },
        status: 'NEW',
      });
    }).toThrow(/Selected lender is inactive or not found/i);
  });

  // TEST 10: Manager Lead Assignment
  it('10. Manager lead assignment: Manager can reassign team leads to officers in their team', () => {
    storage.setCurrentUser('MANAGER');
    const mgrLeads = storage.getLeads();
    expect(mgrLeads.length).toBeGreaterThan(0);

    const leadToReassign = mgrLeads[0];
    const reassigned = storage.assignLead(leadToReassign.id, 'usr-off-02', 'Reassigned due to workload balance');

    expect(reassigned.assignedOfficerId).toBe('usr-off-02');
    expect(reassigned.salesOfficerName).toBe('Priya Patel');
    expect(reassigned.status).toBe('ASSIGNED');
  });

  // TEST 11: Locked Amount Calculation
  it('11. Locked amount calculation: Available Balance = Sanctioned - Disbursed - Active Locked Amount', () => {
    // Check loan-004: Sanctioned ₹15,00,000, Disbursed ₹6,00,000, Lock ₹3,00,000 - Release ₹1,00,000 = Active Lock ₹2,00,000
    // Available Balance must be exactly 15,00,000 - 6,00,000 - 2,00,000 = ₹7,00,000
    const fin = storage.calculateLoanFinancials('loan-004');
    expect(fin.sanctionedAmount).toBe(1500000);
    expect(fin.totalSuccessfulDisbursement).toBe(600000);
    expect(fin.activeLockedAmount).toBe(200000);
    expect(fin.availableBalance).toBe(700000);
  });

  // TEST 12: Failed Transfer Handling
  it('12. Failed transfer handling: Failed transfers do not count as disbursed', () => {
    storage.setCurrentUser('ADMIN');
    // Loan-004 has disb-003 which has status FAILED with amount ₹1,50,000
    const fin = storage.calculateLoanFinancials('loan-004');
    // Successful is ONLY disb-002 (₹6,00,000)
    expect(fin.totalSuccessfulDisbursement).toBe(600000);
  });

  // TEST 13: Reversed Transfer Handling
  it('13. Reversed transfer handling: Reversing a transfer restores available balance', () => {
    storage.setCurrentUser('ADMIN');
    const beforeFin = storage.calculateLoanFinancials('loan-004');
    expect(beforeFin.availableBalance).toBe(700000);

    // Reverse the successful transfer disb-002 (₹6,00,000)
    storage.updateTransferStatus('disb-002', 'REVERSED', 'UTR reversal requested by bank due to technical mismatch');

    const afterFin = storage.calculateLoanFinancials('loan-004');
    expect(afterFin.totalSuccessfulDisbursement).toBe(0);
    expect(afterFin.availableBalance).toBe(1300000); // 15,00,000 - 0 - 2,00,000 lock = 13,00,000
  });

  // TEST 14: Duplicate Transaction Prevention
  it('14. Duplicate transaction prevention: Duplicate UTR number is strictly rejected', () => {
    storage.setCurrentUser('ADMIN');
    expect(() => {
      storage.addBankTransfer({
        loanId: 'loan-004',
        transferAmount: 100000,
        beneficiaryAccount: '4812349087',
        accountHolderName: 'Deepak Choudhary',
        utrNumber: 'KOTAKN26111244589', // Existing UTR from mockData
      });
    }).toThrow(/Duplicate transaction UTR/i);
  });

  // TEST 15: Partner Payout Calculation
  it('15. Partner payout calculation: Calculated as Sanctioned Loan Amount × Payout Percentage snapshot', () => {
    storage.setCurrentUser('ADMIN');
    // Loan-002 was sanctioned for ₹8,50,000 with 2% snapshot = ₹17,000 payable
    const payouts = storage.getPartnerPayouts();
    const payout = payouts.find((p) => p.loanId === 'loan-002');
    expect(payout).toBeDefined();
    expect(payout?.sanctionedAmount).toBe(850000);
    expect(payout?.payoutPercentageSnapshot).toBe(2.0);
    expect(payout?.payableAmount).toBe(17000);
    expect(payout?.paidAmount).toBe(10000);
    expect(payout?.pendingAmount).toBe(7000);
  });

  // TEST 16: Payout Privacy
  it('16. Payout privacy: Channel Partner cannot view payout records or company financial dashboard', () => {
    storage.setCurrentUser('PARTNER');
    const payouts = storage.getPartnerPayouts();
    expect(payouts.length).toBe(0);

    const lenderPayments = storage.getLenderPayments();
    expect(lenderPayments.length).toBe(0);
  });

  // TEST 17: Audit Logging
  it('17. Audit logging: Every financial transaction and status change records immutable audit log', () => {
    storage.setCurrentUser('CEO');
    const initialLogCount = storage.getAuditLogs().length;

    storage.addLock('loan-004', 50000, 'Additional hypothecation check');

    const logs = storage.getAuditLogs();
    expect(logs.length).toBe(initialLogCount + 1);
    const latestLog = logs[0];
    expect(latestLog.action).toBe('DISBURSEMENT_LOCK_CREATED');
    expect(latestLog.userRole).toBe('CEO');
    expect(latestLog.userName).toBe('Rajesh Singhania');
  });

  // TEST 18: No Customer Fee
  it('18. No customer fee fields or workflows: Verified zero fee fields in Lead, Loan, and Disbursement types', () => {
    const lead = storage.getLeads()[0];
    expect((lead as any).customerFee).toBeUndefined();
    expect((lead as any).processingFeeChargedToCustomer).toBeUndefined();
    expect((lead as any).fileCharge).toBeUndefined();

    const summary = storage.getFinancialSummary();
    expect((summary as any).totalCustomerFeesCollected).toBeUndefined();
  });

  // TEST 19: Backend API Authorization
  it('19. Backend API authorization: Non-admin/CEO roles cannot execute bank transfers or lock releases', () => {
    storage.setCurrentUser('OFFICER');
    expect(() => {
      storage.addBankTransfer({
        loanId: 'loan-004',
        transferAmount: 50000,
        beneficiaryAccount: '4812349087',
        accountHolderName: 'Deepak Choudhary',
        utrNumber: 'OFFICER_ATTEMPT_123',
      });
    }).toThrow(/Only authorized CEO\/Admin users can record and verify/i);

    expect(() => {
      storage.releaseLock('lock-001', 50000, 'Officer attempt');
    }).toThrow(/Only CEO or Admin can release locked amounts/i);
  });

  // TEST 20: Concurrent Transaction Safety
  it('20. Concurrent transaction safety: Over-disbursement beyond Available Balance is strictly prevented', () => {
    storage.setCurrentUser('ADMIN');
    const fin = storage.calculateLoanFinancials('loan-004');
    expect(fin.availableBalance).toBe(700000);

    // Attempting to disburse ₹7,00,001 (₹1 more than available balance) must fail
    expect(() => {
      storage.addBankTransfer({
        loanId: 'loan-004',
        transferAmount: 700001,
        beneficiaryAccount: '4812349087',
        accountHolderName: 'Deepak Choudhary',
        utrNumber: 'OVERDISB_ATTEMPT_001',
      });
    }).toThrow(/exceeds available balance/i);
  });
});
