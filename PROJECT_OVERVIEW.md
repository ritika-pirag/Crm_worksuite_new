# 🧠 CRM WORKSUITE - PROJECT OVERVIEW (AI BRAIN FILE)
## Complete Project Understanding - Tech Stack, Flow, Architecture

**Project Name:** CRM Worksuite
**Version:** 1.0.0
**Type:** Multi-tenant SaaS CRM System
**Status:** Development (Not Production Ready)

---

## 📋 TABLE OF CONTENTS

1. [What is This Project?](#what-is-this-project)
2. [Tech Stack](#tech-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Modules](#core-modules)
5. [Business Rules](#business-rules)
6. [Architecture & Flow](#architecture--flow)
7. [Database Schema](#database-schema)
8. [API Structure](#api-structure)
9. [Authentication Flow](#authentication-flow)
10. [Key Features](#key-features)
11. [Multi-Tenancy](#multi-tenancy)
12. [Settings System](#settings-system)
13. [Important Business Logic](#important-business-logic)
14. [Project Structure](#project-structure)
15. [Development Workflow](#development-workflow)

---

## 🎯 WHAT IS THIS PROJECT?

### Overview
**CRM Worksuite** is a comprehensive **Customer Relationship Management (CRM)** and **Work Management System** designed for businesses to manage:
- Customer relationships
- Sales pipeline
- Projects and tasks
- Team collaboration
- Financial operations (invoicing, payments, expenses)
- HR operations (attendance, leave, payroll)

### Target Users
- **Small to Medium Businesses** (SMBs)
- **Agencies** (Marketing, IT, Consulting)
- **Freelancers** and **Teams**
- **Service Providers**

### Business Model
- **SaaS (Software as a Service)**
- **Multi-tenant** - Multiple companies on same system
- **Subscription-based** - Companies pay monthly/yearly
- **Package-based** - Different feature tiers (Basic, Professional, Enterprise)

### Key Differentiators
1. **All-in-One Solution** - CRM + Project Management + HR + Finance
2. **Multi-tenant Architecture** - Single codebase, multiple companies
3. **Role-based Access** - 4 user types with different permissions
4. **Highly Customizable** - Settings, modules, custom fields
5. **Web-based** - No installation required
6. **PWA Support** - Works offline, installable

---

## 💻 TECH STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool (faster than Webpack) |
| **React Router** | 6.x | Client-side routing |
| **TailwindCSS** | 3.x | Utility-first CSS framework |
| **Recharts** | 2.x | Charts and visualizations |
| **Axios** | 1.x | HTTP client |
| **React Icons** | 5.x | Icon library (io5 family) |
| **date-fns** | - | Date manipulation |

**Frontend Structure:**
```
src/
├── app/          # Dashboard pages (admin, employee, client, superadmin)
├── website/      # Public landing pages
├── auth/         # Login, signup, forgot password
├── components/   # Reusable UI components
├── api/          # API service layer
├── context/      # React contexts (Auth, Theme)
├── routes/       # Routing configuration
└── layouts/      # Page layouts
```

---

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.x | Web framework |
| **MySQL** | 8.x | Relational database |
| **JWT** | 9.x | Authentication tokens |
| **bcrypt** | 5.x | Password hashing |
| **Multer** | 1.x | File uploads |
| **node-cron** | 3.x | Scheduled tasks |
| **nodemailer** | 6.x | Email sending |

**Backend Structure:**
```
crm-worksuite-backend/
├── routes/          # API route definitions
├── controllers/     # Business logic
├── middleware/      # Auth, validation, etc.
├── config/          # Database, env config
├── utils/           # Helper functions
├── services/        # Service layer
├── migrations/      # Database migrations
└── uploads/         # File storage
```

---

### Database
- **MySQL 8.0+**
- **50+ Tables**
- **Foreign Key Constraints**
- **Indexes for Performance**
- **Multi-tenant Design** (company_id in all tables)

---

## 👥 USER ROLES & PERMISSIONS

### 1. SUPERADMIN (Platform Owner)
**Access:** Full system access across ALL companies

**Capabilities:**
- Create/manage companies (tenants)
- Create/manage subscription packages
- View all data across companies
- Manage billing and payments
- Handle support tickets
- Configure global settings
- Access system-wide analytics

**Dashboard:** `/app/superadmin`

**Cannot:**
- Access individual company operations (that's Admin role)

---

### 2. ADMIN (Company Owner/Manager)
**Access:** Full access within their company

**Capabilities:**
- Manage employees, clients, projects
- Create invoices, estimates, proposals
- View all company reports
- Configure company settings
- Manage team attendance and leave
- Handle all CRM operations (leads, deals)
- Access all financial data
- Create/delete users in their company
- Enable/disable modules

**Dashboard:** `/app/admin`

**Cannot:**
- Access other companies' data
- Modify subscription/package (must contact SuperAdmin)

---

### 3. EMPLOYEE (Team Member)
**Access:** Limited to assigned tasks and projects

**Capabilities:**
- View/update assigned tasks
- View/update assigned projects
- Clock in/out (attendance)
- Submit leave requests
- Track time on tasks
- View own documents
- Send messages
- Create support tickets
- View assigned calendar events

**Dashboard:** `/app/employee`

**Cannot:**
- View other employees' data (unless manager)
- Create/delete projects
- Access financial data
- Modify company settings
- View all clients/leads

---

### 4. CLIENT (Customer/External User)
**Access:** Limited to their own data and projects

**Capabilities:**
- View assigned projects
- View/download invoices
- Make payments
- View/download proposals and estimates
- Create support tickets
- Upload files to projects
- View contracts
- Message with team
- View project calendar

**Dashboard:** `/app/client`

**Cannot:**
- View other clients' data
- Access internal operations
- View employee information
- Access financial admin features

---

## 📦 CORE MODULES

### 1. CRM & SALES MODULE
**Purpose:** Manage sales pipeline and customer relationships

**Features:**
- **Leads Management**
  - Capture leads from website/manual entry
  - Lead scoring and stages (New, Contacted, Qualified, etc.)
  - Convert lead to client
  - Lead sources tracking (Website, Referral, Social Media)
  - Lead assignment to sales team

- **Clients Management**
  - Client profiles with contact information
  - Multiple contacts per client
  - Client documents and notes
  - Client activity history
  - Client categorization and labels

- **Contacts**
  - Primary and secondary contacts
  - Contact roles (Decision Maker, Influencer, etc.)
  - Contact communication history

**User Access:**
- Admin: Full access
- Employee: View assigned clients
- Client: View own profile only

---

### 2. PROJECT MANAGEMENT MODULE
**Purpose:** Plan, execute, and track projects

**Features:**
- **Projects**
  - Project creation with milestones
  - Project status (Not Started, In Progress, On Hold, Completed, Cancelled)
  - Budget and time tracking
  - Project members assignment
  - File attachments
  - Project templates for reuse
  - Gantt chart view

- **Tasks**
  - Task assignment to team members
  - Task priorities (Low, Medium, High, Urgent)
  - Task dependencies
  - Time estimates and actual time
  - Task comments and attachments
  - Sub-tasks support

- **Time Tracking**
  - Manual time entry
  - Timer-based tracking
  - Time logs per task/project
  - Weekly/monthly timesheets
  - Billable vs non-billable hours

**User Access:**
- Admin: All projects
- Employee: Assigned projects only
- Client: Projects they're involved in

---

### 3. FINANCE MODULE
**Purpose:** Manage all financial transactions

**Features:**
- **Invoices**
  - Create professional invoices
  - Recurring invoices (monthly, quarterly, yearly)
  - Invoice templates
  - Send via email
  - Payment tracking
  - PDF generation
  - Invoice status (Draft, Sent, Paid, Overdue, Cancelled)
  - Tax calculations (GST, VAT, etc.)

- **Estimates/Quotes**
  - Create estimates for clients
  - Convert estimate to invoice
  - Estimate validity period
  - Accept/Reject by client

- **Proposals**
  - Detailed project proposals
  - Rich text editor
  - PDF generation
  - E-signature support

- **Payments**
  - Record payments against invoices
  - Multiple payment methods (Cash, Bank Transfer, Online)
  - Payment gateways (Stripe, PayPal, Razorpay)
  - Payment receipts

- **Expenses**
  - Track company expenses
  - Categories (Travel, Office, Marketing, etc.)
  - Billable expenses (charge to client)
  - Receipt uploads
  - Expense approval workflow

- **Credit Notes**
  - Issue refunds/credits
  - Apply to invoices

- **Bank Accounts**
  - Manage company bank accounts
  - Transaction tracking

**User Access:**
- Admin: Full access
- Employee: View only (or limited based on role)
- Client: View own invoices, payments

---

### 4. HR & TEAM MODULE
**Purpose:** Manage team and HR operations

**Features:**
- **Employees**
  - Employee profiles
  - Departments and positions
  - Salary information (encrypted)
  - Documents (ID, contracts, certificates)
  - Performance tracking

- **Attendance**
  - Check-in/check-out system
  - GPS location tracking (optional)
  - Late arrival tracking
  - Attendance reports

- **Leave Management**
  - Leave types (Sick, Casual, Earned, etc.)
  - Leave balance tracking
  - Leave request approval workflow
  - Leave calendar

- **Departments**
  - Organize employees by department
  - Department heads

- **Positions/Roles**
  - Job titles and descriptions
  - Hierarchy

**User Access:**
- Admin: Full access
- Employee: Own data + limited team view
- Client: No access

---

### 5. COMMUNICATION MODULE
**Purpose:** Internal and external communication

**Features:**
- **Messages**
  - Direct messaging between users
  - Group conversations
  - File attachments
  - Message notifications

- **Tickets/Support**
  - Support ticket system
  - Priority levels
  - Status tracking (Open, In Progress, Resolved, Closed)
  - Department assignment
  - SLA tracking

- **Email Templates**
  - Pre-defined email templates
  - Variables/placeholders
  - Templates for invoices, proposals, etc.

**User Access:**
- All roles can send/receive messages
- Clients can create tickets

---

### 6. STORE/E-COMMERCE MODULE
**Purpose:** Sell products/services online

**Features:**
- **Products/Items**
  - Product catalog
  - Pricing and inventory
  - Product images
  - Categories

- **Orders**
  - Online order management
  - Order status tracking
  - Fulfillment

- **Client Portal Store**
  - Clients can browse and purchase
  - Shopping cart
  - Checkout process

**User Access:**
- Admin: Manage products and orders
- Client: Browse and purchase

---

### 7. DOCUMENTS & FILES MODULE
**Purpose:** Centralized document management

**Features:**
- File uploads (PDFs, images, documents)
- Folder organization
- Access control per file
- Version history
- File sharing with clients

**User Access:**
- Role-based file access

---

### 8. CALENDAR & EVENTS MODULE
**Purpose:** Schedule and track events

**Features:**
- Calendar views (Month, Week, Day, List)
- Event creation and invitations
- Recurring events
- Event reminders
- Integration with projects and tasks

**User Access:**
- All users can create events
- Visibility based on role

---

### 9. REPORTS MODULE
**Purpose:** Business intelligence and analytics

**Features:**
- Sales reports
- Project reports
- Time tracking reports
- Financial reports (P&L, Revenue)
- Employee reports
- Custom report builder
- Export to CSV/PDF

**User Access:**
- Admin: All reports
- Employee: Limited reports
- Client: Own data reports

---

### 10. SETTINGS & CONFIGURATION MODULE
**Purpose:** System customization

**Features:**
- **General Settings** (80+ settings)
- Company profile
- Email configuration (SMTP)
- Payment gateway setup
- Module enable/disable
- Custom fields
- Localization (language, timezone, currency)
- Theme customization
- PWA settings
- Integration settings (Google Calendar, Slack, Zapier)
- Notifications preferences
- Security settings (2FA, session timeout)

**User Access:**
- Admin: Company settings
- SuperAdmin: Global settings

---

## 📜 BUSINESS RULES

### 1. Multi-Tenancy Rules
- **Each company is isolated** - Cannot access other companies' data
- **company_id** is present in ALL data tables
- Database queries MUST filter by company_id
- SuperAdmin can bypass company_id filtering

### 2. Lead to Client Conversion
- **Lead** can be converted to **Client**
- Once converted, Lead is marked as "Converted"
- All Lead data (notes, contacts) transfers to Client
- Cannot convert same Lead twice

### 3. Invoice Rules
- Invoice must have at least one line item
- Invoice total = Sum of items + Tax - Discount
- Invoice can have status: Draft, Sent, Paid, Partially Paid, Overdue, Cancelled
- Paid invoices cannot be edited (must create Credit Note)
- Overdue = Sent + Due Date passed + Not Paid

### 4. Project-Task Relationship
- Task must belong to a Project
- Project can have 0 or many Tasks
- Deleting Project deletes all Tasks (CASCADE)
- Task status affects Project completion %

### 5. Time Tracking Rules
- Time can be tracked against Task OR Project
- Billable time = Time that can be charged to client
- Billable rate can be set per employee, task, or project
- Time logs are used for payroll calculations

### 6. Leave Management Rules
- Employee has leave balance per leave type
- Leave balance = Allocated - Used
- Leave request requires approval by Admin/Manager
- Cannot request leave for past dates
- Cannot exceed leave balance (or require special approval)

### 7. Attendance Rules
- Employee must check-in before check-out
- Multiple check-ins same day = last one counts
- Attendance status: Present, Absent, Late, Half Day, Leave
- Grace period for late arrival (configurable)

### 8. Payment Rules
- Payment must be linked to Invoice
- Payment can be partial or full
- Invoice status changes based on payment:
  - Partially Paid = Payment < Invoice Total
  - Paid = Payment >= Invoice Total
- Payment methods: Cash, Bank Transfer, Credit Card, Online Gateway

### 9. Module Enable/Disable
- Admin can enable/disable modules via Settings
- Disabled modules:
  - Hide from menu
  - Block API access (if middleware applied)
  - Save database space (no data created)
- Core modules cannot be disabled (Dashboard, Settings)

### 10. File Upload Rules
- Maximum file size: Configurable (default 10MB)
- Allowed file types: Configurable (default: pdf, doc, docx, jpg, png, xls, xlsx)
- Files stored in `/uploads` directory
- File path stored in database
- Files associated with entity (Project, Task, Client, etc.)

### 11. Email Rules
- System emails sent via SMTP (configured in Settings)
- Email templates used for invoices, proposals, etc.
- Email queue for bulk sending
- Email tracking (sent, opened, clicked)

### 12. Subscription/Package Rules
- Company subscribes to a Package
- Package defines:
  - Number of users allowed
  - Storage limit
  - Features/modules available
- Package can be upgraded/downgraded
- Billing cycle: Monthly, Quarterly, Yearly
- Trial period supported

---

## 🏗️ ARCHITECTURE & FLOW

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                       │
│  (React SPA - Vite Build - TailwindCSS)                │
└────────────┬────────────────────────────────────────────┘
             │
             │ HTTP/HTTPS (REST API)
             │ JWT Token in Authorization Header
             │
┌────────────▼────────────────────────────────────────────┐
│                   EXPRESS SERVER                        │
│  - Routes (40+ route files)                            │
│  - Controllers (Business Logic)                         │
│  - Middleware (Auth, Validation, Upload)                │
│  - Services (Reusable business logic)                   │
└────────────┬────────────────────────────────────────────┘
             │
             │ MySQL Queries (Parameterized)
             │ Connection Pool
             │
┌────────────▼────────────────────────────────────────────┐
│                   MySQL DATABASE                        │
│  - 50+ Tables                                           │
│  - Foreign Keys                                         │
│  - Indexes                                              │
│  - Multi-tenant (company_id column)                     │
└─────────────────────────────────────────────────────────┘
```

---

### Request Flow

```
1. User clicks button in React UI
   ↓
2. API function called (from src/api/)
   ↓
3. Axios sends HTTP request with JWT token
   ↓
4. Express route matches request
   ↓
5. Middleware runs (authenticate, authorize, validate)
   ↓
6. Controller function executes
   ↓
7. Service layer called (if exists)
   ↓
8. Database query executed (MySQL)
   ↓
9. Result returned to controller
   ↓
10. Response sent back to frontend
   ↓
11. React component updates state
   ↓
12. UI re-renders with new data
```

---

### Data Flow Example: Creating an Invoice

**Frontend:**
```javascript
// User fills invoice form and clicks "Create Invoice"
const handleSubmit = async () => {
  const response = await invoicesAPI.create({
    client_id: 5,
    items: [...],
    tax: 18,
    discount: 10
  });
  // Success: Navigate to invoice detail
};
```

**API Layer:**
```javascript
// src/api/invoices.js
export const invoicesAPI = {
  create: (data) => axiosInstance.post('/invoices', data)
};
```

**Backend Route:**
```javascript
// routes/invoiceRoutes.js
router.post('/', authenticate, authorize('ADMIN'), invoiceController.create);
```

**Controller:**
```javascript
// controllers/invoiceController.js
const create = async (req, res) => {
  const { client_id, items, tax, discount } = req.body;
  const company_id = req.user.company_id;

  // Calculate total
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = (subtotal * tax) / 100;
  const total = subtotal + taxAmount - discount;

  // Insert invoice
  const [result] = await pool.execute(
    'INSERT INTO invoices (company_id, client_id, total, tax, discount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [company_id, client_id, total, tax, discount, 'Draft']
  );

  const invoiceId = result.insertId;

  // Insert items
  for (const item of items) {
    await pool.execute(
      'INSERT INTO invoice_items (invoice_id, description, qty, rate, amount) VALUES (?, ?, ?, ?, ?)',
      [invoiceId, item.description, item.qty, item.rate, item.qty * item.rate]
    );
  }

  res.json({ success: true, data: { id: invoiceId } });
};
```

**Database:**
```sql
-- Tables affected:
-- 1. invoices (main record)
-- 2. invoice_items (line items)

-- Query executed:
INSERT INTO invoices (company_id, client_id, total, tax, discount, status)
VALUES (1, 5, 1180, 18, 10, 'Draft');

INSERT INTO invoice_items (invoice_id, description, qty, rate, amount)
VALUES (123, 'Web Development', 10, 100, 1000);
```

---

## 💾 DATABASE SCHEMA

### Key Tables (50+ total)

#### Core Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | All system users | id, email, password, role, company_id |
| `companies` | Tenant companies | id, name, package_id, subscription_expires_at |
| `packages` | Subscription packages | id, name, price, max_users, features |

#### CRM Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `leads` | Sales leads | id, company_id, name, email, status, source |
| `clients` | Customers | id, company_id, name, email, phone |
| `contacts` | Client contacts | id, client_id, name, email, is_primary |

#### Project Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `projects` | Projects | id, company_id, name, client_id, status, budget |
| `tasks` | Tasks | id, project_id, assigned_to, status, priority |
| `time_logs` | Time tracking | id, task_id, user_id, hours, is_billable |

#### Finance Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `invoices` | Invoices | id, company_id, client_id, total, status |
| `invoice_items` | Invoice line items | id, invoice_id, description, qty, rate |
| `estimates` | Estimates/Quotes | id, company_id, client_id, total, status |
| `proposals` | Project proposals | id, company_id, client_id, content, status |
| `payments` | Payment records | id, invoice_id, amount, method, date |
| `expenses` | Company expenses | id, company_id, category, amount, is_billable |
| `credit_notes` | Credit notes | id, invoice_id, amount, reason |

#### HR Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `employees` | Employee profiles | id, company_id, user_id, department_id, salary |
| `attendance` | Daily attendance | id, employee_id, check_in, check_out, status |
| `leave_requests` | Leave applications | id, employee_id, leave_type, from_date, to_date, status |
| `departments` | Departments | id, company_id, name |
| `positions` | Job positions | id, company_id, title |

#### Other Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `messages` | Internal messaging | id, from_user_id, to_user_id, message |
| `tickets` | Support tickets | id, company_id, subject, status, priority |
| `documents` | File uploads | id, company_id, entity_type, entity_id, file_path |
| `events` | Calendar events | id, company_id, title, start_date, end_date |
| `system_settings` | Settings | id, company_id, setting_key, setting_value |
| `audit_logs` | Activity logs | id, user_id, action, module, old_values, new_values |

### Relationships

```
companies (1) ──────── (many) users
companies (1) ──────── (many) clients
companies (1) ──────── (many) projects
companies (1) ──────── (many) invoices

clients (1) ────────── (many) projects
clients (1) ────────── (many) invoices
clients (1) ────────── (many) contacts

projects (1) ───────── (many) tasks
projects (1) ───────── (many) time_logs

invoices (1) ───────── (many) invoice_items
invoices (1) ───────── (many) payments

users (1) ──────────── (many) tasks (assigned_to)
users (1) ──────────── (many) time_logs
```

---

## 🔌 API STRUCTURE

### API Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### API Endpoints Summary

| Module | Endpoint | Methods |
|--------|----------|---------|
| Auth | `/auth` | POST (login, logout), GET (me) |
| Dashboard | `/dashboard` | GET (stats) |
| Leads | `/leads` | GET, POST, PUT, DELETE |
| Clients | `/clients` | GET, POST, PUT, DELETE |
| Projects | `/projects` | GET, POST, PUT, DELETE |
| Tasks | `/tasks` | GET, POST, PUT, DELETE |
| Invoices | `/invoices` | GET, POST, PUT, DELETE |
| Estimates | `/estimates` | GET, POST, PUT, DELETE |
| Proposals | `/proposals` | GET, POST, PUT, DELETE |
| Payments | `/payments` | GET, POST, PUT, DELETE |
| Expenses | `/expenses` | GET, POST, PUT, DELETE |
| Employees | `/employees` | GET, POST, PUT, DELETE |
| Attendance | `/attendance` | GET, POST |
| Leave Requests | `/leave-requests` | GET, POST, PUT |
| Messages | `/messages` | GET, POST, DELETE |
| Tickets | `/tickets` | GET, POST, PUT, DELETE |
| Documents | `/documents` | GET, POST, DELETE |
| Settings | `/settings` | GET, PUT (10 endpoints) |
| ... | ... | ... |

**Total: 40+ route modules, 200+ endpoints**

---

## 🔐 AUTHENTICATION FLOW

### Login Process

```
1. User enters email and password
   ↓
2. Frontend sends POST /api/v1/auth/login
   {
     "email": "admin@example.com",
     "password": "password123",
     "role": "ADMIN"
   }
   ↓
3. Backend verifies credentials
   - Fetch user from database
   - Compare password (bcrypt)
   ↓
4. Generate JWT token
   - Payload: { id, email, role, company_id }
   - Expires: 24 hours
   ↓
5. Return token to frontend
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { id, name, email, role, company_id }
   }
   ↓
6. Frontend stores token in localStorage
   ↓
7. All subsequent requests include token in headers
   Authorization: Bearer <token>
```

### Protected Route Access

```
1. Frontend makes API request with token
   ↓
2. Express middleware intercepts request
   ↓
3. Extract token from Authorization header
   ↓
4. Verify token with JWT_SECRET
   ↓
5. If valid:
   - Decode token
   - Attach user data to req.user
   - Call next()
   ↓
6. If invalid:
   - Return 401 Unauthorized
   ↓
7. Controller accesses req.user for company_id, user_id
```

### Logout Process

```
1. User clicks logout
   ↓
2. Frontend calls POST /api/v1/auth/logout
   ↓
3. Backend adds token to blacklist (if implemented)
   ↓
4. Frontend clears localStorage
   ↓
5. Redirect to login page
```

---

## ✨ KEY FEATURES

### 1. Multi-Tenant Architecture
- Single codebase serves multiple companies
- Data isolation by company_id
- Shared infrastructure, separate data

### 2. Role-Based Access Control (RBAC)
- 4 user roles with different permissions
- Menu items filtered by role
- API endpoints protected by role

### 3. Module System
- Enable/disable features per company
- Save costs by disabling unused modules
- Modules: Leads, Clients, Projects, Tasks, Invoices, etc.

### 4. Settings System (NEW)
- 80+ configurable settings
- Categories: General, Email, UI, Modules, Integrations
- Real-time theme changes
- Validation on all settings

### 5. Customization
- Custom fields for entities
- Email templates
- Invoice templates
- Brand colors and logos

### 6. Integrations
- Google Calendar sync
- Slack notifications
- Zapier automation
- Payment gateways (Stripe, PayPal, Razorpay)
- Accounting software (Zoho Books, QuickBooks)

### 7. Reporting & Analytics
- Dashboard with charts and KPIs
- Custom report builder
- Export to CSV, Excel, PDF

### 8. Mobile-Friendly
- Responsive design (TailwindCSS)
- PWA support (installable on mobile)
- Touch-optimized UI

### 9. Real-Time Features
- Notifications
- Messaging
- Activity feeds

### 10. Security
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens (to be implemented)
- Role-based authorization

---

## 🏢 MULTI-TENANCY

### How Multi-Tenancy Works

**Concept:**
- One application serves multiple companies (tenants)
- Each company has isolated data
- Companies share same codebase and database

**Implementation:**
1. **company_id Column** in all data tables
2. **All Queries Filter by company_id**
   ```sql
   SELECT * FROM projects WHERE company_id = 1;
   ```
3. **JWT Token Contains company_id**
   ```javascript
   const token = jwt.sign({
     id: user.id,
     company_id: user.company_id,
     role: user.role
   }, JWT_SECRET);
   ```
4. **Middleware Attaches company_id**
   ```javascript
   req.user.company_id // Available in all controllers
   ```

**Benefits:**
- Single deployment for all customers
- Easy updates (one codebase)
- Cost-effective (shared infrastructure)
- Scalable (add tenants without code changes)

**Challenges:**
- Data isolation must be perfect (security risk if leaked)
- Performance (large dataset from multiple companies)
- Backups (must support per-tenant restore)

---

## ⚙️ SETTINGS SYSTEM

### Settings Architecture

**Total Settings:** 80+
**Categories:** 19
**Storage:** `system_settings` table

**Key-Value Storage:**
```sql
CREATE TABLE system_settings (
  id INT PRIMARY KEY,
  company_id INT,
  setting_key VARCHAR(100),
  setting_value TEXT,
  UNIQUE(company_id, setting_key)
);
```

**Example Settings:**
```json
{
  "company_name": "Acme Corp",
  "company_email": "info@acme.com",
  "theme_mode": "dark",
  "primary_color": "#217E45",
  "default_currency": "USD",
  "module_leads": "true",
  "module_invoices": "true",
  "email_notifications": "true",
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587"
}
```

### Settings Flow

```
1. Admin changes setting in UI
   ↓
2. Frontend sends PUT /api/v1/settings/bulk
   {
     "settings": [
       { "setting_key": "theme_mode", "setting_value": "dark" }
     ]
   }
   ↓
3. Backend validates setting (settingsValidator.js)
   ↓
4. Backend saves to database (settingsService.js)
   ↓
5. Backend applies change (applySettingChange)
   - Theme: Update cache
   - Module: Clear access cache
   - Email: Validate SMTP
   ↓
6. Frontend receives success response
   ↓
7. Frontend applies change (updateTheme)
   ↓
8. UI updates immediately (no page reload)
```

---

## 🧠 IMPORTANT BUSINESS LOGIC

### 1. Invoice Total Calculation

```javascript
// Formula:
Subtotal = Sum of (Item Quantity × Item Rate)
Tax Amount = Subtotal × (Tax % / 100)
Total = Subtotal + Tax Amount - Discount

// Example:
Items: 2 items × $100 = $200
Tax: 18% of $200 = $36
Discount: $10
Total: $200 + $36 - $10 = $226
```

### 2. Project Completion Percentage

```javascript
// Formula:
Completed Tasks = Count(status = 'Completed')
Total Tasks = Count(all tasks)
Completion % = (Completed Tasks / Total Tasks) × 100

// Example:
Total Tasks: 10
Completed: 7
Completion: 70%
```

### 3. Leave Balance Calculation

```javascript
// Formula:
Leave Balance = Allocated - Used - Pending

// Example:
Allocated: 20 days (annual)
Used: 8 days (already taken)
Pending: 2 days (requested, not approved)
Balance: 20 - 8 - 2 = 10 days
```

### 4. Time Tracking Billable Amount

```javascript
// Formula:
Billable Amount = Hours × Hourly Rate

// Example:
Hours Tracked: 40 hours
Hourly Rate: $50/hour
Billable Amount: 40 × $50 = $2,000
```

### 5. Attendance Status

```javascript
// Logic:
if (checked_in && checked_out) {
  if (check_in_time <= grace_period) {
    status = "Present";
  } else {
    status = "Late";
  }
} else if (leave_approved) {
  status = "Leave";
} else {
  status = "Absent";
}
```

---

## 📁 PROJECT STRUCTURE

### Frontend Directory Structure

```
crm-worksuite-frontend/
├── public/               # Static assets
├── src/
│   ├── api/             # API service layer (44 modules)
│   ├── app/
│   │   ├── admin/       # Admin dashboard pages (60+)
│   │   ├── employee/    # Employee dashboard pages (12)
│   │   ├── client/      # Client dashboard pages (18)
│   │   └── superadmin/  # SuperAdmin dashboard pages (10)
│   ├── auth/            # Login, signup, forgot password (4 pages)
│   ├── website/         # Landing pages (6 pages)
│   ├── components/
│   │   ├── ui/          # Reusable UI components (11)
│   │   ├── layout/      # Layout components (7)
│   │   └── charts/      # Chart components (3)
│   ├── context/         # React contexts (Auth, Theme)
│   ├── routes/          # Routing configuration
│   ├── layouts/         # Page layouts (3)
│   ├── config/          # Sidebar configs (4)
│   ├── assets/          # Images, fonts
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── package.json
└── vite.config.js
```

### Backend Directory Structure

```
crm-worksuite-backend/
├── config/
│   └── db.js            # Database connection + auto-migration
├── controllers/         # 40+ controllers
├── routes/              # 40+ route files
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── checkModuleAccess.js  # Module access control
│   └── upload.js        # File upload middleware
├── services/
│   └── settingsService.js    # Settings business logic
├── utils/
│   └── settingsValidator.js  # Settings validation
├── migrations/          # Database migrations
├── uploads/             # File storage
├── server.js            # Express server entry point
├── schema.sql           # Database schema
├── package.json
└── .env                 # Environment variables
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>

# 2. Install backend dependencies
cd crm-worksuite-backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Create database
mysql -u root -p
CREATE DATABASE crm_worksuite;

# 5. Import schema
mysql -u root -p crm_worksuite < schema.sql

# 6. Run migrations
node migrations/20260103_add_default_settings.js

# 7. Start backend server
npm start
# Server runs on http://localhost:5000

# 8. Install frontend dependencies
cd ../crm-worksuite-frontend
npm install

# 9. Start frontend dev server
npm run dev
# Frontend runs on http://localhost:5173
```

### Default Login Credentials

```
SuperAdmin:
Email: superadmin@crmapp.com
Password: password

Admin:
Email: admin@crmapp.com
Password: password

Employee:
Email: employee@crmapp.com
Password: password

Client:
Email: client@crmapp.com
Password: password
```

### Development Workflow

```
1. Create feature branch
   git checkout -b feature/new-feature

2. Make changes (frontend or backend)

3. Test locally
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

4. Commit changes
   git add .
   git commit -m "Add new feature"

5. Push to remote
   git push origin feature/new-feature

6. Create pull request

7. Review and merge
```

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crm_worksuite
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=CRM Worksuite
```

---

## 📊 CURRENT STATUS

### ✅ What's Working
- Frontend: All 99+ pages render
- UI Components: All working
- Routing: Complete
- Database: Schema ready
- API: 44 modules defined
- Settings: Full system implemented

### ❌ What's NOT Working
- **Authentication not enforced** (CRITICAL)
- **No authorization checks** (CRITICAL)
- **No input validation** (CRITICAL)
- **Settings functions are stubs** (HIGH)
- Module access not applied to routes (HIGH)
- Excel/PDF export missing libraries (MEDIUM)

### 🚧 In Progress
- Security hardening
- Validation implementation
- Settings functions completion

---

## 🎯 NEXT STEPS

### Immediate (Week 1)
1. Add authentication to all routes
2. Add role-based authorization
3. Add input validation
4. Fix database migrations
5. Implement settings functions

### Short-term (Week 2-3)
1. Add rate limiting
2. Implement CSRF protection
3. Complete integrations
4. Optimize queries
5. Add audit logging

### Long-term (Month 2+)
1. Implement PWA features
2. Add real-time notifications
3. Performance optimization
4. Comprehensive testing
5. Production deployment

---

## 📖 LEARNING RESOURCES

### Frontend
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- TailwindCSS: https://tailwindcss.com

### Backend
- Express Docs: https://expressjs.com
- MySQL Docs: https://dev.mysql.com/doc
- JWT: https://jwt.io

---

## 📞 SUPPORT & CONTACT

### Documentation Files
- `COMPLETE_SOFTWARE_AUDIT_REPORT.md` - Full audit report
- `SETTINGS_COMPLETE_IMPLEMENTATION.md` - Settings guide
- `SETTINGS_TESTING_GUIDE.md` - Testing guide
- `PROJECT_OVERVIEW.md` - This file

---

## 🎊 SUMMARY

**CRM Worksuite** is a comprehensive, multi-tenant CRM and work management system built with:
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + MySQL
- **Architecture:** Multi-tenant SaaS
- **Users:** 4 roles (SuperAdmin, Admin, Employee, Client)
- **Modules:** 10+ core modules
- **Status:** Development (needs security fixes)

**Goal:** Provide businesses with an all-in-one solution for managing customers, projects, team, and finances.

---

**END OF PROJECT OVERVIEW**

*This AI brain file should give complete understanding of the project structure, flow, and business logic.*

*Last Updated: January 3, 2026*
