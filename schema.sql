-- ==============================================================================
-- A ONE FINANCIAL SERVICES - Complete Database Schema (PostgreSQL DDL)
-- All financial amounts use NUMERIC(18,2)
-- All IDs use UUID primary keys
-- ABSOLUTE RULE: ZERO Customer Fee tables or columns
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES
CREATE TYPE user_role_enum AS ENUM ('CEO', 'ADMIN', 'MANAGER', 'OFFICER', 'PARTNER');
CREATE TYPE id_request_status_enum AS ENUM ('PENDING_ADMIN', 'PENDING_CEO', 'APPROVED', 'REJECTED');
CREATE TYPE lead_status_enum AS ENUM (
  'NEW', 'ASSIGNED', 'CONTACTED', 'DOCUMENTS_PENDING', 'DOCUMENTS_RECEIVED',
  'APPLICATION_SUBMITTED', 'UNDER_PROCESS', 'SANCTIONED', 'REJECTED',
  'DISBURSEMENT_PENDING', 'PARTIALLY_DISBURSED', 'FULLY_DISBURSED', 'CLOSED'
);
CREATE TYPE transfer_status_enum AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REVERSED');
CREATE TYPE lock_status_enum AS ENUM ('ACTIVE', 'PARTIALLY_RELEASED', 'RELEASED');

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role user_role_enum NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TEAMS
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TEAM MEMBERS
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- ID REQUESTS (USER REGISTRATION & KYC)
CREATE TABLE id_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    requested_role user_role_enum NOT NULL,
    pan_number VARCHAR(20) NOT NULL,
    aadhaar_number VARCHAR(20) NOT NULL,
    status id_request_status_enum DEFAULT 'PENDING_ADMIN',
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    admin_reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    admin_reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_remarks TEXT,
    ceo_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ceo_approved_at TIMESTAMP WITH TIME ZONE,
    ceo_remarks TEXT,
    created_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KYC DOCUMENTS
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_request_id UUID REFERENCES id_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'PAN_CARD', 'AADHAAR_CARD', 'CANCELLED_CHEQUE', 'BANK_STATEMENT'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LENDERS
CREATE TABLE lenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LENDER CONTACTS (ASM)
CREATE TABLE lender_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    asm_name VARCHAR(255) NOT NULL,
    asm_contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CO-APPLICANTS
CREATE TABLE co_applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMER BANK ACCOUNTS
CREATE TABLE customer_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    masked_account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VEHICLES
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OFFICER-PARTNER LINKS
CREATE TABLE officer_partner_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(officer_id, partner_id)
);

-- LEADS
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_reference VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE RESTRICT,
    lender_contact_id UUID REFERENCES lender_contacts(id) ON DELETE SET NULL,
    asm_name VARCHAR(255) NOT NULL,
    asm_contact_number VARCHAR(20) NOT NULL,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    channel_partner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- OPTIONAL
    status lead_status_enum DEFAULT 'NEW',
    follow_up_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LEAD ASSIGNMENTS HISTORY
CREATE TABLE lead_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_from_id UUID REFERENCES users(id),
    assigned_to_id UUID NOT NULL REFERENCES users(id),
    assigned_by_id UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LEAD STATUS HISTORY
CREATE TABLE lead_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    from_status lead_status_enum,
    to_status lead_status_enum NOT NULL,
    changed_by_id UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LEAD DOCUMENTS
CREATE TABLE lead_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LOAN APPLICATIONS
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE RESTRICT,
    application_number VARCHAR(100) UNIQUE NOT NULL,
    lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE RESTRICT,
    loan_type VARCHAR(100) NOT NULL DEFAULT 'Vehicle Loan',
    applied_amount NUMERIC(18,2) NOT NULL,
    sanctioned_amount NUMERIC(18,2) DEFAULT 0.00,
    application_date DATE NOT NULL,
    sanction_date DATE,
    status VARCHAR(50) DEFAULT 'UNDER_PROCESS',
    lender_reference_number VARCHAR(100),
    rejection_reason TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LOAN STATUS HISTORY
CREATE TABLE loan_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by_id UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DISBURSEMENT TRANSACTIONS (BANK TRANSFERS)
CREATE TABLE disbursement_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    beneficiary_account_id UUID REFERENCES customer_bank_accounts(id),
    account_holder_name VARCHAR(255) NOT NULL,
    transfer_amount NUMERIC(18,2) NOT NULL,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    utr_number VARCHAR(100) NOT NULL,
    status transfer_status_enum DEFAULT 'PENDING',
    bank_proof_url TEXT,
    remarks TEXT,
    created_by_id UUID NOT NULL REFERENCES users(id),
    verified_by_id UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DISBURSEMENT LOCKS
CREATE TABLE disbursement_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE RESTRICT,
    locked_amount NUMERIC(18,2) NOT NULL,
    released_amount NUMERIC(18,2) DEFAULT 0.00,
    status lock_status_enum DEFAULT 'ACTIVE',
    reason TEXT NOT NULL,
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LOCK RELEASES
CREATE TABLE lock_releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lock_id UUID NOT NULL REFERENCES disbursement_locks(id) ON DELETE CASCADE,
    release_amount NUMERIC(18,2) NOT NULL,
    reason TEXT NOT NULL,
    released_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRANSACTION REVERSALS
CREATE TABLE transaction_reversals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES disbursement_transactions(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    reversed_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LENDER PAYOUT RECEIPTS (RECEIVED FROM LENDER)
CREATE TABLE lender_payout_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE RESTRICT,
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    sanctioned_amount NUMERIC(18,2) NOT NULL,
    amount_received NUMERIC(18,2) NOT NULL,
    receipt_date DATE NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL,
    bank_details VARCHAR(255),
    proof_url TEXT,
    remarks TEXT,
    recorded_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PARTNER PAYOUT RULES
CREATE TABLE partner_payout_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    loan_type VARCHAR(100) DEFAULT 'Vehicle Loan',
    payout_percentage NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PARTNER PAYOUTS (SNAPSHOT PER LOAN)
CREATE TABLE partner_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE RESTRICT,
    sanctioned_amount NUMERIC(18,2) NOT NULL,
    payout_percentage_snapshot NUMERIC(5,2) NOT NULL,
    payable_amount NUMERIC(18,2) NOT NULL,
    paid_amount NUMERIC(18,2) DEFAULT 0.00,
    pending_amount NUMERIC(18,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, loan_id)
);

-- PARTNER PAYOUT TRANSACTIONS
CREATE TABLE partner_payout_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_payout_id UUID NOT NULL REFERENCES partner_payouts(id) ON DELETE RESTRICT,
    amount NUMERIC(18,2) NOT NULL,
    payment_date DATE NOT NULL,
    utr_number VARCHAR(100) NOT NULL,
    bank_proof_url TEXT,
    remarks TEXT,
    recorded_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OTP CHALLENGES (FOR SECURE BANK TRANSFERS AND ACTIONS)
CREATE TABLE otp_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS (IMMUTABLE)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ATTACHMENTS
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- IDEMPOTENCY KEYS
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    response_body JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- APPROVAL RECORDS
CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- APPROVED, REJECTED
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE & PRIVACY
CREATE INDEX idx_leads_assigned_officer ON leads(assigned_officer_id);
CREATE INDEX idx_leads_channel_partner ON leads(channel_partner_id);
CREATE INDEX idx_leads_lender ON leads(lender_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_customer ON leads(customer_id);
CREATE INDEX idx_vehicles_number ON vehicles(vehicle_number);
CREATE INDEX idx_disb_trans_loan ON disbursement_transactions(loan_id);
CREATE INDEX idx_disb_locks_loan ON disbursement_locks(loan_id);
CREATE INDEX idx_partner_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_record ON audit_logs(entity_name, record_id);
