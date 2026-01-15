# CRM System - Flow Logic & Architecture Documentation

**Date:** January 15, 2026
**Version:** 1.0

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│  │ Super Admin  │ │    Admin     │ │   Employee   │ │  Client  ││
│  │  Dashboard   │ │  Dashboard   │ │  Dashboard   │ │Dashboard ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Express.js)                        │
│                      /api/v1/*                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Auth   │ │  Leads  │ │Clients  │ │Projects │ │  Tasks  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Invoices │ │Employees│ │Tickets  │ │Messages │ │Settings │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL/MariaDB)                      │
│                         crm_db                                   │
│                       75+ Tables                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. AUTHENTICATION FLOW

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│  Verify  │────▶│ Generate │────▶│ Redirect │
│   Form   │     │Password  │     │   JWT    │     │Dashboard │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────────┐
              │ Check Role:  │
              │ SUPERADMIN   │──▶ /app/superadmin/dashboard
              │ ADMIN        │──▶ /app/admin/dashboard
              │ EMPLOYEE     │──▶ /app/employee/dashboard
              │ CLIENT       │──▶ /app/client/dashboard
              └──────────────┘
```

### Authentication API
- **POST /api/v1/auth/login** - User login
- **POST /api/v1/auth/register** - User registration
- **POST /api/v1/auth/refresh** - Refresh JWT token
- **GET /api/v1/auth/me** - Get current user

---

## 3. DASHBOARD DATA FLOWS

### 3.1 Super Admin Dashboard Flow

```
Frontend Request                 Backend Process                    Database
────────────────                 ───────────────                    ────────
GET /superadmin/stats    ──▶    superAdminController.getStats()
                                        │
                                        ├──▶ COUNT(*) FROM companies
                                        ├──▶ COUNT(*) FROM users
                                        ├──▶ SUM(amount) FROM payments
                                        ├──▶ COUNT(*) FROM packages
                                        │
                                        ▼
                                 Return JSON response
```

**Data Sources:**
| Card | Table | Query |
|------|-------|-------|
| Total Companies | companies | COUNT(*) WHERE is_deleted=0 |
| Total Users | users | COUNT(*) WHERE is_deleted=0 |
| Total Revenue | payments | SUM(amount) WHERE status='Complete' |
| Active Packages | packages | COUNT(*) WHERE is_deleted=0 |

---

### 3.2 Admin Dashboard Flow

```
Frontend Request                 Backend Process                    Database Tables
────────────────                 ───────────────                    ───────────────
GET /dashboard/admin     ──▶    dashboardController.getAdminStats()
                                        │
                                        ├──▶ projects (count, status)
                                        ├──▶ tasks (count, status)
                                        ├──▶ clients (count)
                                        ├──▶ invoices (sum, status)
                                        ├──▶ leads (count, status)
                                        ├──▶ employees (count)
                                        │
                                        ▼
                                 Return JSON response
```

---

### 3.3 Employee Dashboard Flow

```
Frontend Request                 Backend Process                    Database Tables
────────────────                 ───────────────                    ───────────────
GET /employees/:id/stats ──▶    employeeController.getDashboardStats()
                                        │
                                        ├──▶ tasks (WHERE assigned to user)
                                        ├──▶ projects (WHERE member)
                                        ├──▶ attendance (WHERE user_id)
                                        ├──▶ leave_requests (WHERE user_id)
                                        ├──▶ time_logs (WHERE user_id)
                                        │
                                        ▼
                                 Return JSON response
```

---

### 3.4 Client Dashboard Flow

```
Frontend Request                 Backend Process                    Database Tables
────────────────                 ───────────────                    ───────────────
GET /dashboard/client    ──▶    dashboardController.getClientStats()
                                        │
                                        ├──▶ projects (WHERE client_id)
                                        ├──▶ invoices (WHERE client_id)
                                        ├──▶ payments (WHERE client_id)
                                        ├──▶ tickets (WHERE client_id)
                                        ├──▶ contracts (WHERE client_id)
                                        │
                                        ▼
                                 Return JSON response
```

---

## 4. MODULE-WISE CRUD FLOW

### 4.1 Leads Module

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEADS FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CREATE LEAD                                                     │
│  ────────────                                                    │
│  POST /api/v1/leads                                              │
│       │                                                          │
│       ├── Validate: company_id, name                             │
│       ├── Insert into: leads table                               │
│       ├── Insert labels into: lead_labels table                  │
│       └── Return: created lead with labels                       │
│                                                                  │
│  UPDATE LEAD STATUS (Kanban)                                     │
│  ────────────────────────────                                    │
│  PUT /api/v1/leads/:id/update-status                             │
│       │                                                          │
│       ├── Get current status                                     │
│       ├── Update: leads.status                                   │
│       ├── Log to: lead_status_history (optional)                 │
│       └── Return: updated lead                                   │
│                                                                  │
│  CONVERT TO CLIENT                                               │
│  ─────────────────                                               │
│  POST /api/v1/leads/:id/convert-to-client                        │
│       │                                                          │
│       ├── Create user account                                    │
│       ├── Create client record                                   │
│       ├── Create primary contact                                 │
│       ├── Update lead status to 'Won'                            │
│       └── Return: client_id                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Projects Module

```
┌─────────────────────────────────────────────────────────────────┐
│                       PROJECTS FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CREATE PROJECT                                                  │
│  ──────────────                                                  │
│  POST /api/v1/projects                                           │
│       │                                                          │
│       ├── Validate: company_id, project_name, start_date         │
│       ├── Generate: short_code                                   │
│       ├── Insert into: projects table                            │
│       ├── Add members to: project_members table                  │
│       └── Return: created project                                │
│                                                                  │
│  PROJECT HIERARCHY                                               │
│  ─────────────────                                               │
│                                                                  │
│  projects                                                        │
│      │                                                           │
│      ├── project_members (user assignments)                      │
│      ├── tasks (project tasks)                                   │
│      │     ├── task_assignees                                    │
│      │     ├── task_comments                                     │
│      │     └── task_files                                        │
│      ├── project_labels                                          │
│      └── time_logs                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Invoices Module

```
┌─────────────────────────────────────────────────────────────────┐
│                       INVOICES FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CREATE INVOICE                                                  │
│  ──────────────                                                  │
│  POST /api/v1/invoices                                           │
│       │                                                          │
│       ├── Generate: invoice_number (INV-YYYY-XXXX)               │
│       ├── Calculate: sub_total, tax, discount, total             │
│       ├── Insert into: invoices table                            │
│       ├── Insert items into: invoice_items table                 │
│       └── Return: created invoice                                │
│                                                                  │
│  RECORD PAYMENT                                                  │
│  ──────────────                                                  │
│  POST /api/v1/payments                                           │
│       │                                                          │
│       ├── Link to: invoice_id                                    │
│       ├── Insert into: payments table                            │
│       ├── Update: invoices.paid, invoices.status                 │
│       └── Return: payment record                                 │
│                                                                  │
│  INVOICE STATUS FLOW                                             │
│  ───────────────────                                             │
│                                                                  │
│  Draft ──▶ Sent ──▶ Viewed ──▶ Paid/Partially Paid/Overdue       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. DATA RELATIONSHIPS

### 5.1 Core Entity Relationships

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  companies  │◀──────│    users    │──────▶│  employees  │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   clients   │       │   projects  │
└─────────────┘       └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  invoices   │       │    tasks    │
└─────────────┘       └─────────────┘
       │
       ▼
┌─────────────┐
│  payments   │
└─────────────┘
```

### 5.2 Company Isolation (Multi-Tenant)

```
Every table has company_id column for tenant isolation:

SELECT * FROM leads WHERE company_id = ? AND is_deleted = 0;
SELECT * FROM clients WHERE company_id = ? AND is_deleted = 0;
SELECT * FROM projects WHERE company_id = ? AND is_deleted = 0;
...
```

---

## 6. API ENDPOINT REFERENCE

### 6.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/register | User registration |
| POST | /api/v1/auth/refresh | Refresh token |
| GET | /api/v1/auth/me | Get current user |

### 6.2 Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/superadmin/stats | Dashboard stats |
| GET | /api/v1/superadmin/companies | List companies |
| POST | /api/v1/superadmin/companies | Create company |
| PUT | /api/v1/superadmin/companies/:id | Update company |
| DELETE | /api/v1/superadmin/companies/:id | Delete company |
| GET | /api/v1/superadmin/packages | List packages |
| GET | /api/v1/superadmin/users | List all users |
| GET | /api/v1/superadmin/billing | Billing overview |
| GET/PUT | /api/v1/superadmin/settings | System settings |

### 6.3 Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/leads | List leads |
| GET | /api/v1/leads/:id | Get lead |
| POST | /api/v1/leads | Create lead |
| PUT | /api/v1/leads/:id | Update lead |
| DELETE | /api/v1/leads/:id | Delete lead |
| PUT | /api/v1/leads/:id/update-status | Update status (Kanban) |
| POST | /api/v1/leads/:id/convert-to-client | Convert to client |
| GET | /api/v1/leads/overview | Lead statistics |
| GET | /api/v1/leads/labels | Get labels |
| POST | /api/v1/leads/labels | Create label |
| GET | /api/v1/leads/contacts | Get contacts |
| POST | /api/v1/leads/contacts | Create contact |

### 6.4 Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/clients | List clients |
| GET | /api/v1/clients/:id | Get client |
| POST | /api/v1/clients | Create client |
| PUT | /api/v1/clients/:id | Update client |
| DELETE | /api/v1/clients/:id | Delete client |
| GET | /api/v1/clients/:id/contacts | Get contacts |
| POST | /api/v1/clients/:id/contacts | Add contact |
| GET | /api/v1/clients/labels | Get labels |
| POST | /api/v1/clients/labels | Create label |

### 6.5 Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/projects | List projects |
| GET | /api/v1/projects/:id | Get project |
| POST | /api/v1/projects | Create project |
| PUT | /api/v1/projects/:id | Update project |
| DELETE | /api/v1/projects/:id | Delete project |
| GET | /api/v1/projects/:id/tasks | Get project tasks |
| GET | /api/v1/projects/:id/members | Get members |
| POST | /api/v1/projects/:id/members | Add member |
| GET | /api/v1/projects/labels | Get labels |
| POST | /api/v1/projects/labels | Create label |

### 6.6 Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/tasks | List tasks |
| GET | /api/v1/tasks/:id | Get task |
| POST | /api/v1/tasks | Create task |
| PUT | /api/v1/tasks/:id | Update task |
| DELETE | /api/v1/tasks/:id | Delete task |
| PUT | /api/v1/tasks/:id/status | Update status |
| GET | /api/v1/tasks/:id/comments | Get comments |
| POST | /api/v1/tasks/:id/comments | Add comment |
| POST | /api/v1/tasks/:id/files | Upload file |

### 6.7 Finance (Invoices, Payments, etc.)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/invoices | List invoices |
| POST | /api/v1/invoices | Create invoice |
| GET | /api/v1/payments | List payments |
| POST | /api/v1/payments | Record payment |
| GET | /api/v1/estimates | List estimates |
| POST | /api/v1/estimates | Create estimate |
| GET | /api/v1/expenses | List expenses |
| POST | /api/v1/expenses | Create expense |

### 6.8 HR & Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/employees | List employees |
| POST | /api/v1/employees | Create employee |
| GET | /api/v1/attendance | Get attendance |
| POST | /api/v1/attendance/check-in | Check in |
| POST | /api/v1/attendance/check-out | Check out |
| GET | /api/v1/leave-requests | List leave requests |
| POST | /api/v1/leave-requests | Submit leave request |
| GET | /api/v1/time-logs | Get time logs |
| POST | /api/v1/time-logs | Log time |

---

## 7. FRONTEND ROUTING STRUCTURE

### 7.1 Super Admin Routes
```
/app/superadmin/
├── dashboard
├── companies
├── packages
├── users
├── billing
├── offline-requests
├── settings
└── pwa-settings
```

### 7.2 Admin Routes
```
/app/admin/
├── dashboard
├── leads
├── clients
├── projects
├── tasks
├── invoices
├── payments
├── estimates
├── proposals
├── expenses
├── contracts
├── employees
├── attendance
├── leave-requests
├── time-tracking
├── calendar
├── messages
├── tickets
├── reports
├── documents
├── settings
└── audit-logs
```

### 7.3 Employee Routes
```
/app/employee/
├── dashboard
├── my-tasks
├── my-projects
├── time-tracking
├── calendar
├── my-profile
├── my-documents
├── attendance
├── leave-requests
├── messages
└── tickets
```

### 7.4 Client Routes
```
/app/client/
├── dashboard
├── projects
├── proposals
├── store
├── files
├── invoices
├── payments
├── subscriptions
├── orders
├── notes
├── contracts
├── tickets
└── messages
```

---

## 8. DATABASE TABLE COUNT BY MODULE

| Module | Tables |
|--------|--------|
| Core | companies, users, employees, departments, positions |
| CRM | leads, lead_labels, lead_status_history, clients, client_contacts, client_labels, contacts |
| Projects | projects, project_members, project_labels, tasks, task_assignees, task_comments, task_files |
| Finance | invoices, invoice_items, payments, estimates, estimate_items, expenses, expense_items, contracts |
| HR | attendance, attendance_settings, leave_requests, leave_types, time_logs, shifts |
| Communication | messages, message_recipients, tickets, ticket_comments, notifications |
| System | settings, system_settings, roles, permissions, role_permissions, audit_logs |

**Total Tables: 75+**

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Authentication
- JWT-based authentication
- Token expiry: 24 hours
- Refresh token support

### 9.2 Authorization
- Role-based access control (SUPERADMIN, ADMIN, EMPLOYEE, CLIENT)
- Company-level data isolation (multi-tenant)
- Route-level middleware protection

### 9.3 Data Protection
- Password hashing with bcrypt
- SQL injection prevention via parameterized queries
- Input validation on all endpoints

---

**Flow Logic Documentation Complete**
