# A ONE FINANCIAL SERVICES – COMPLETE LOAN CRM & DSA MANAGEMENT SYSTEM

A production-ready, bank-grade Loan Customer Relationship Management (CRM) and Direct Selling Agent (DSA) Sourcing Management System built for **A ONE FINANCIAL SERVICES**.

---

## 🚀 Live Preview
Open the live system in the Antigravity App or browser:
👉 **[https://antigravity.luch.dev/site/393e6071-faa4-45ea-9d3a-3a28e6e753cb/193b64f3837229a8489cdef6/](https://antigravity.luch.dev/site/393e6071-faa4-45ea-9d3a-3a28e6e753cb/193b64f3837229a8489cdef6/)**

*(Saved automatically to your workspace and rendered directly inside the mobile/web environment)*

---

## 📌 Executive Architecture & Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons. Designed with an executive navy blue (`#0B192C`, `#1E3E62`, `#1D4ED8`) and crisp white palette.
- **Backend:** Node.js, Express REST API (`/server`), JWT authentication, server-side role authorization, bank-grade OTP verification challenge.
- **Database:** PostgreSQL schema with migrations (`schema.sql` and `prisma/schema.prisma`). All monetary amounts use `NUMERIC(18,2)`. All entities utilize UUID primary keys.
- **Automated Test Suite:** Comprehensive Vitest test suite executing and passing all 20 business rules defined in Section 20 of the master development prompt.

---

## 👥 Five User Roles & Permissions

| Role | Access Scope | Key Permissions & Responsibilities |
|---|---|---|
| **CEO** | Global / Full Access | Executive command, configure partner payout rules, manage locked amounts, final KYC approval, manage lenders, view all audit logs and financial dashboards. |
| **Admin** | Operations & Compliance | Manage lenders, verify authorized bank transfers, first-tier KYC review, assign leads, view all loan applications and financial reports. |
| **Sales Team Manager** | Team Scoped | View assigned Sales Officers and Channel Partners, track team pipeline, assign leads to team officers, submit KYC ID requests for new recruits. |
| **Sales Officer** | Assigned & Created Leads | Create customer leads (**Strictly auto-assigned to logged-in Officer**), update file progress, add follow-up notes, track loan sanctions. |
| **Channel Partner (DSA)** | Partner Isolated | Submit loan files, view real-time status of own submitted files. **Zero access to other partners, lender commissions, or company financial reports.** |

---

## 🔑 Demo Login Credentials

All accounts share the universal demo password: `Password@123`

| Role | Name | Email | Quick Switch |
|---|---|---|---|
| **CEO** | Rajesh Singhania | `ceo@aonefinancial.com` | Use Top Navbar Role Switcher |
| **Admin** | Neha Sharma | `admin@aonefinancial.com` | Use Top Navbar Role Switcher |
| **Sales Team Manager** | Vikram Malhotra | `manager@aonefinancial.com` | Use Top Navbar Role Switcher |
| **Sales Officer** | Amit Verma | `officer.amit@aonefinancial.com` | Use Top Navbar Role Switcher |
| **Sales Officer** | Priya Patel | `officer.priya@aonefinancial.com` | Use Top Navbar Role Switcher |
| **Channel Partner** | Sunita Joshi (FinServe DSA) | `partner.sunita@finserve.com` | Use Top Navbar Role Switcher |
| **Channel Partner** | Rahul Gupta (Prime Capital) | `partner.rahul@primecap.com` | Use Top Navbar Role Switcher |

> 💡 *Tip: You can switch roles instantaneously using the **Role Switcher** in the top navigation bar to test data privacy, menu visibility, and permissions in real time.*

---

## 🧮 Core Financial Formulas & Mathematical Integrity

All financial arithmetic is executed on the backend using high-precision decimals (`NUMERIC(18,2)`):

### 1. Loan Available Balance & Disbursement Guard
```text
Total Disbursed = Sum of all SUCCESSFUL, non-reversed bank transfers
Active Locked Amount = Total Disbursement Locks - Released Amounts
Available Balance = Sanctioned Loan Amount - Total Disbursed - Active Locked Amount
```
*Rule: Bank transfers are strictly prohibited from exceeding the Available Balance. Transfers with status `FAILED` or `REVERSED` do not count toward disbursed funds.*

### 2. Channel Partner Payout Calculation
```text
Partner Payout = Sanctioned Loan Amount × Applicable Payout Percentage
```
*Rule: The payout percentage is snapshotted upon loan sanction. Future changes to company payout rules never retroactively mutate historical payouts.*

### 3. Company Net Retained Revenue
```text
Company Net Payout = Total Lender Payments Received - Total Partner Payouts Paid
```

---

## 🛡️ Absolute Business Rule: ZERO Customer Fees

**Customers are NEVER charged any fee by A ONE FINANCIAL SERVICES.**
- Zero processing fee fields, collections, or receipts.
- Zero customer fee database columns or workflows.
- All DSA revenues originate exclusively from institutional lender commissions.

---

## 📋 16 Mandatory Lead Creation Fields

Every lead creation form strictly enforces frontend and backend validation for:
1. Customer Full Name
2. Father's Name
3. Co-applicant Full Name
4. Customer Contact Number
5. Co-applicant Contact Number
6. Customer Address
7. Vehicle Registration Number
8. Vehicle Make
9. Vehicle Model
10. Customer Flee / File Reference (Auto-generated unique format: `AONE/YYYY/MM/FL-XXXX`)
11. Lender Name (Populated strictly from **ACTIVE** lenders in database)
12. Lender ASM Name
13. Lender ASM Contact Number
14. Sales Officer Name (Auto-populated from authenticated session)
15. Sales Officer Contact Number (Auto-populated)
16. Customer Bank Account Details (Bank Name, Account Number, IFSC Code)

*Optional Field: Channel Partner (if left blank, classified as a Direct Lead).*

---

## 🧪 Automated Business Rule Tests (20/20 Passing)

Run the test suite:
```bash
npm test
```

Verified test coverage:
- ✅ **Test 1:** CEO permissions (access to all modules, payout rules, locked amounts).
- ✅ **Test 2:** Admin permissions (can verify transfers and review KYC; cannot configure CEO payout rules).
- ✅ **Test 3:** Manager team-level access (views only own team leads and officers).
- ✅ **Test 4:** Officer lead privacy (views only own assigned leads and linked partners).
- ✅ **Test 5:** Channel Partner lead privacy (views only own leads; 0 access to company financials).
- ✅ **Test 6:** Mandatory lead fields (all 16 fields strictly validated).
- ✅ **Test 7:** Optional Channel Partner (direct vs partner classification).
- ✅ **Test 8:** Automatic Officer assignment (session-backed identity enforcement).
- ✅ **Test 9:** Active lender dropdown (inactive lenders excluded).
- ✅ **Test 10:** Manager lead assignment (manager reassigns within own team).
- ✅ **Test 11:** Locked amount calculation (`Available = Sanctioned - Disbursed - Active Lock`).
- ✅ **Test 12:** Failed transfer handling (failed transfers excluded from disbursed total).
- ✅ **Test 13:** Reversed transfer handling (reversals restore available balance).
- ✅ **Test 14:** Duplicate transaction prevention (UTR collision rejection).
- ✅ **Test 15:** Partner payout calculation (`Sanctioned × Snapshot %`).
- ✅ **Test 16:** Payout privacy (partners & officers cannot see payout management).
- ✅ **Test 17:** Immutable audit logging (timestamp, user, action, old/new states).
- ✅ **Test 18:** Zero customer fee verification.
- ✅ **Test 19:** Backend API authorization (unauthorized token rejection).
- ✅ **Test 20:** Concurrent transaction safety (over-disbursement prevention).

---

## 💻 Local Development Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start Frontend development server
npm run dev

# 4. Build production static bundle (dist/)
npm run build

# 5. Start standalone Express REST backend
npm run server
```

---

## 🗄️ Database Migrations & DDL

The complete relational PostgreSQL schema is provided in:
- [schema.sql](file:///home/agent/workspace/schema.sql) (Full DDL with enums, constraints, indexes, triggers)
- [prisma/schema.prisma](file:///home/agent/workspace/prisma/schema.prisma) (Prisma ORM schema)

All 30+ enterprise tables are structured for high-throughput concurrency and strict audit compliance.
