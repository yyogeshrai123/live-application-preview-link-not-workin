// ==============================================================================
// A ONE FINANCIAL SERVICES - Complete Express REST API Backend
// ==============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'a-one-financial-secret-key-2026';

app.use(cors());
app.use(express.json());

// In-Memory state store seeded with production data
const state = {
  users: [
    { id: 'usr-ceo-01', email: 'ceo@aonefinancial.com', fullName: 'Rajesh Singhania', role: 'CEO', isActive: true },
    { id: 'usr-admin-01', email: 'admin@aonefinancial.com', fullName: 'Neha Sharma', role: 'ADMIN', isActive: true },
    { id: 'usr-mgr-01', email: 'manager@aonefinancial.com', fullName: 'Vikram Malhotra', role: 'MANAGER', isActive: true },
    { id: 'usr-off-01', email: 'officer.amit@aonefinancial.com', fullName: 'Amit Verma', role: 'OFFICER', isActive: true, managerId: 'usr-mgr-01' },
    { id: 'usr-off-02', email: 'officer.priya@aonefinancial.com', fullName: 'Priya Patel', role: 'OFFICER', isActive: true, managerId: 'usr-mgr-01' },
    { id: 'usr-cp-01', email: 'partner.sunita@finserve.com', fullName: 'Sunita Joshi', role: 'PARTNER', isActive: true, managerId: 'usr-mgr-01' },
  ],
  lenders: [
    { id: 'len-hdfc-01', name: 'HDFC Bank', code: 'HDFC', isActive: true },
    { id: 'len-icici-01', name: 'ICICI Bank', code: 'ICICI', isActive: true },
    { id: 'len-axis-01', name: 'Axis Bank', code: 'AXIS', isActive: true },
    { id: 'len-kotak-01', name: 'Kotak Mahindra Bank', code: 'KOTAK', isActive: true },
    { id: 'len-inactive-01', name: 'Legacy Inactive Corp', code: 'LEGACY', isActive: false },
  ],
  leads: [],
  loans: [],
  disbursements: [],
  locks: [],
  lenderPayments: [],
  partnerPayouts: [],
  partnerRules: [{ id: 'rule-1', loanType: 'New Vehicle Loan', payoutPercentage: 2.0, isActive: true }],
  idRequests: [],
  auditLogs: [],
  notifications: [],
};

// Middleware: Authentication & Authorization
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For demo convenience, allow x-user-role header fallback if token omitted
    const roleHeader = req.headers['x-user-role'] || 'CEO';
    const foundUser = state.users.find(u => u.role === roleHeader) || state.users[0];
    req.user = foundUser;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${roles.join(', ')}]` });
    }
    next();
  };
}

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    company: 'A ONE FINANCIAL SERVICES',
    system: 'LOAN CRM & DSA MANAGEMENT SYSTEM',
    timestamp: new Date().toISOString(),
    customerFeesAllowed: false, // Rule enforcement check
  });
});

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = state.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid credentials or inactive account' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user });
});

// --- Leads Endpoints ---
app.get('/api/leads', authenticateToken, (req, res) => {
  const user = req.user;
  let results = state.leads;

  if (user.role === 'OFFICER') {
    results = results.filter((l) => l.assignedOfficerId === user.id || l.createdById === user.id);
  } else if (user.role === 'PARTNER') {
    results = results.filter((l) => l.channelPartnerId === user.id || l.createdById === user.id);
  } else if (user.role === 'MANAGER') {
    results = results.filter((l) => l.managerId === user.id || l.createdById === user.id);
  }

  res.json(results);
});

app.post('/api/leads', authenticateToken, (req, res) => {
  const user = req.user;
  const data = req.body;

  // Validate mandatory fields
  const required = [
    'customerName', 'fatherName', 'coApplicantName', 'customerContactNumber',
    'coApplicantContactNumber', 'customerAddress', 'vehicleNumber', 'vehicleMake',
    'vehicleModel', 'lenderId', 'asmName', 'asmContactNumber'
  ];

  for (const field of required) {
    if (!data[field] || String(data[field]).trim() === '') {
      return res.status(400).json({ error: `Field '${field}' is mandatory.` });
    }
  }

  // Active Lender check
  const lender = state.lenders.find((l) => l.id === data.lenderId);
  if (!lender || !lender.isActive) {
    return res.status(400).json({ error: 'Selected lender is inactive or invalid.' });
  }

  // Duplicate Check
  const duplicatePhone = state.leads.find((l) => l.customerContactNumber === data.customerContactNumber);
  if (duplicatePhone) {
    return res.status(409).json({ error: `Duplicate customer phone number: ${data.customerContactNumber}` });
  }

  // Automatic Officer Assignment Rule
  let assignedOfficerId = user.id;
  let assignedOfficerName = user.fullName;

  if (user.role !== 'OFFICER' && data.assignedOfficerId) {
    const matched = state.users.find((u) => u.id === data.assignedOfficerId);
    if (matched) {
      assignedOfficerId = matched.id;
      assignedOfficerName = matched.fullName;
    }
  }

  const newLead = {
    id: `lead-${uuidv4()}`,
    fileReference: `AONE/${new Date().getFullYear()}/FL-${Math.floor(1000 + Math.random() * 9000)}`,
    ...data,
    createdById: user.id,
    createdByName: user.fullName,
    assignedOfficerId,
    salesOfficerName: assignedOfficerName,
    isDirectLead: !data.channelPartnerId,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };

  state.leads.unshift(newLead);
  res.status(201).json(newLead);
});

// --- Financial Endpoints ---
app.get('/api/financial/summary', authenticateToken, requireRoles('CEO', 'ADMIN'), (req, res) => {
  let totalSanctioned = 0;
  let totalDisbursed = 0;
  let activeLocks = 0;

  for (const loan of state.loans) {
    const sanctioned = Number(loan.sanctionedAmount) || 0;
    totalSanctioned += sanctioned;

    const disbursed = state.disbursements
      .filter((d) => d.loanId === loan.id && d.status === 'SUCCESSFUL')
      .reduce((a, b) => a + Number(b.transferAmount), 0);
    totalDisbursed += disbursed;

    const locked = state.locks
      .filter((l) => l.loanId === loan.id && l.status !== 'RELEASED')
      .reduce((a, b) => a + (Number(b.lockedAmount) - Number(b.releasedAmount)), 0);
    activeLocks += locked;
  }

  const availableBalance = Math.max(0, totalSanctioned - totalDisbursed - activeLocks);
  const lenderReceived = state.lenderPayments.reduce((a, b) => a + Number(b.amountReceived), 0);
  const partnerPaid = state.partnerPayouts.reduce((a, b) => a + Number(b.paidAmount), 0);
  const companyNetPayout = Number((lenderReceived - partnerPaid).toFixed(2));

  res.json({
    totalSanctionedAmount: totalSanctioned,
    totalSuccessfulDisbursement: totalDisbursed,
    pendingDisbursement: Math.max(0, totalSanctioned - totalDisbursed),
    activeLockedAmount: activeLocks,
    availableBalance,
    lenderPaymentsReceived: lenderReceived,
    partnerPayoutPaid: partnerPaid,
    companyNetPayout,
  });
});

// --- State Reset Endpoint ---
app.post('/api/reset', authenticateToken, (req, res) => {
  state.leads = [];
  state.loans = [];
  state.disbursements = [];
  state.locks = [];
  state.lenderPayments = [];
  state.partnerPayouts = [];
  state.idRequests = [];
  state.auditLogs = [];
  state.notifications = [];
  res.json({ success: true, message: 'Server state reset to clean production baseline' });
});

// Start Express server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[A ONE FINANCIAL SERVICES] Express REST Backend running on port ${PORT}`);
  });
}

export default app;
