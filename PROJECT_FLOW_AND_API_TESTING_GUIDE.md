# CRM Worksuite - Project Flow & API Testing Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [User Roles](#user-roles)
3. [SuperAdmin Flow & APIs](#superadmin-flow--apis)
4. [Admin Flow & APIs](#admin-flow--apis)
5. [Client Flow & APIs](#client-flow--apis)
6. [Employee Flow & APIs](#employee-flow--apis)
7. [API Testing Guide](#api-testing-guide)
8. [Common API Endpoints](#common-api-endpoints)

---

## 🎯 Project Overview

**CRM Worksuite** एक comprehensive CRM system है जो 4 main user roles support करता है:
- **SuperAdmin**: System-wide management
- **Admin**: Company-level management
- **Client**: Customer portal
- **Employee**: Staff management

**Base URL**: `http://localhost:5000/api/v1`

---

## 👥 User Roles

### 1. **SUPERADMIN**
- System-wide control
- Multiple companies manage कर सकता है
- Packages, billing, users manage करता है

### 2. **ADMIN**
- Company-level control
- Projects, tasks, invoices, employees manage करता है
- Full company operations

### 3. **CLIENT**
- Customer portal access
- अपने projects, invoices, orders देख सकता है
- Store से items order कर सकता है

### 4. **EMPLOYEE**
- Staff access
- Tasks, projects, attendance manage कर सकता है
- Time tracking कर सकता है

---

## 🔐 SuperAdmin Flow & APIs

### **Menus & Routes:**

1. **Dashboard** - `/app/superadmin/dashboard`
2. **Packages** - `/app/superadmin/packages`
3. **Companies** - `/app/superadmin/companies`
4. **Billing** - `/app/superadmin/billing`
5. **Users** - `/app/superadmin/users`
6. **Website requests** - `/app/superadmin/offline-requests`
7. **Settings** - `/app/superadmin/settings`

### **API Endpoints:**

#### 1. Dashboard
```http
GET /api/v1/superadmin/stats
Query Params: None
Response: { success: true, data: { totals: {...}, revenue: {...}, ... } }
```

#### 2. Packages
```http
# Get all packages
GET /api/v1/packages
Query Params: None

# Create package
POST /api/v1/packages
Body: { name, price, features, duration, ... }

# Update package
PUT /api/v1/packages/:id
Body: { name, price, features, ... }

# Delete package
DELETE /api/v1/packages/:id
```

#### 3. Companies
```http
# Get all companies
GET /api/v1/companies
Query Params: None

# Get company by ID
GET /api/v1/companies/:id

# Create company
POST /api/v1/companies
Body: { name, email, phone, address, ... }

# Update company
PUT /api/v1/companies/:id
Body: { name, email, ... }

# Delete company
DELETE /api/v1/companies/:id
```

#### 4. Billing
```http
# Get billing records
GET /api/v1/billing
Query Params: company_id, status, ...

# Create billing record
POST /api/v1/billing
Body: { company_id, package_id, amount, ... }
```

#### 5. Users
```http
# Get all users
GET /api/v1/users
Query Params: role, company_id, ...

# Create user
POST /api/v1/users
Body: { name, email, password, role, company_id, ... }

# Update user
PUT /api/v1/users/:id
Body: { name, email, ... }

# Delete user
DELETE /api/v1/users/:id
```

#### 6. Offline Requests
```http
# Get offline requests
GET /api/v1/offline-requests
Query Params: status, ...

# Update request status
PUT /api/v1/offline-requests/:id
Body: { status, ... }
```

---

## 👨‍💼 Admin Flow & APIs

### **Menus & Routes:**

#### **CRM & Sales:**
1. **Leads** - `/app/admin/leads`
2. **Clients** - `/app/admin/clients`

#### **Work:**
3. **Projects** - `/app/admin/projects`
4. **Tasks** - `/app/admin/tasks`

#### **Finance:**
5. **Proposal** - `/app/admin/proposals`
6. **Estimates** - `/app/admin/estimates`
7. **Invoices** - `/app/admin/invoices`
8. **Payments** - `/app/admin/payments`
9. **Credit Note** - `/app/admin/credit-notes`
10. **Expenses** - `/app/admin/expenses`
11. **Bank Account** - `/app/admin/bank-accounts`
12. **Items** - `/app/admin/items`
13. **Store** - `/app/admin/store`
14. **Contracts** - `/app/admin/contracts`
15. **Orders** - `/app/admin/orders`

#### **Team & Operations:**
16. **Employees** - `/app/admin/employees`
17. **Attendance** - `/app/admin/attendance`
18. **Time Tracking** - `/app/admin/time-tracking`
19. **Event** - `/app/admin/calendar`
20. **Departments** - `/app/admin/departments`
21. **Positions** - `/app/admin/positions`

#### **Communication:**
22. **Messages** - `/app/admin/messages`
23. **Tickets** - `/app/admin/tickets`

#### **Tools & Utilities:**
24. **Reports** - `/app/admin/reports`
25. **Documents** - `/app/admin/documents`
26. **Custom Fields** - `/app/admin/custom-fields`

#### **Integrations:**
27. **Integrations** - `/app/admin/integrations`
28. **Zoho Books** - `/app/admin/integrations/zoho-books`
29. **QuickBooks** - `/app/admin/integrations/quickbooks`
30. **Payment Gateways** - `/app/admin/integrations/payment-gateways`

#### **System & Settings:**
31. **System Settings** - `/app/admin/settings`
32. **Audit Log** - `/app/admin/audit-logs`

### **API Endpoints:**

#### 1. Dashboard
```http
GET /api/v1/dashboard
Query Params: company_id, user_id
Response: { success: true, data: { summary: {...}, projectsOverview: {...}, ... } }
```

#### 2. Leads
```http
# Get all leads
GET /api/v1/leads?company_id=1
Query Params: company_id, status, search, ...

# Create lead
POST /api/v1/leads
Body: { company_id, name, email, phone, status, ... }

# Update lead
PUT /api/v1/leads/:id
Body: { name, email, status, ... }

# Delete lead
DELETE /api/v1/leads/:id?company_id=1
```

#### 3. Clients
```http
# Get all clients
GET /api/v1/clients?company_id=1
Query Params: company_id, search, ...

# Create client
POST /api/v1/clients
Body: { company_id, name, email, phone, address, ... }

# Update client
PUT /api/v1/clients/:id
Body: { name, email, ... }

# Delete client
DELETE /api/v1/clients/:id?company_id=1
```

#### 4. Projects
```http
# Get all projects
GET /api/v1/projects?company_id=1
Query Params: company_id, status, client_id, ...

# Create project
POST /api/v1/projects
Body: { company_id, name, client_id, start_date, deadline, ... }

# Update project
PUT /api/v1/projects/:id
Body: { name, status, ... }

# Delete project
DELETE /api/v1/projects/:id?company_id=1

# Upload file to project
POST /api/v1/projects/:id/upload?company_id=1
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

#### 5. Tasks
```http
# Get all tasks
GET /api/v1/tasks?company_id=1&project_id=1
Query Params: company_id, project_id, status, ...

# Create task
POST /api/v1/tasks
Body: { company_id, project_id, title, description, status, ... }

# Update task
PUT /api/v1/tasks/:id
Body: { title, status, ... }

# Delete task
DELETE /api/v1/tasks/:id?company_id=1
```

#### 6. Invoices
```http
# Get all invoices
GET /api/v1/invoices?company_id=1
Query Params: company_id, client_id, status, ...

# Create invoice
POST /api/v1/invoices
Body: { company_id, client_id, items: [...], total, ... }

# Update invoice
PUT /api/v1/invoices/:id
Body: { status, ... }

# Delete invoice
DELETE /api/v1/invoices/:id?company_id=1

# Generate PDF
GET /api/v1/invoices/:id/pdf?company_id=1
```

#### 7. Payments
```http
# Get all payments
GET /api/v1/payments?company_id=1
Query Params: company_id, invoice_id, ...

# Create payment
POST /api/v1/payments
Body: { company_id, invoice_id, amount, payment_method, ... }
```

#### 8. Estimates
```http
# Get all estimates
GET /api/v1/estimates?company_id=1
Query Params: company_id, client_id, ...

# Create estimate
POST /api/v1/estimates
Body: { company_id, client_id, items: [...], total, ... }

# Get PDF
GET /api/v1/estimates/:id/pdf?company_id=1
```

#### 9. Orders
```http
# Get all orders
GET /api/v1/orders?company_id=1
Query Params: company_id, client_id, status, ...

# Create order
POST /api/v1/orders
Body: { company_id, client_id, items: [...], total, ... }

# Update order
PUT /api/v1/orders/:id
Body: { status, ... }
```

#### 10. Items (Store Products)
```http
# Get all items
GET /api/v1/items?company_id=1
Query Params: company_id, category, search, ...

# Create item
POST /api/v1/items
Body: { company_id, name, price, description, category, ... }

# Update item
PUT /api/v1/items/:id
Body: { name, price, ... }

# Delete item
DELETE /api/v1/items/:id?company_id=1
```

#### 11. Employees
```http
# Get all employees
GET /api/v1/employees?company_id=1
Query Params: company_id, department_id, ...

# Create employee
POST /api/v1/employees
Body: { company_id, user_id, department_id, position_id, ... }
```

#### 12. Attendance
```http
# Get attendance records
GET /api/v1/attendance?company_id=1
Query Params: company_id, user_id, date, ...

# Check in
POST /api/v1/attendance/check-in
Body: { company_id }

# Check out
POST /api/v1/attendance/check-out
Body: { company_id }
```

#### 13. Time Tracking
```http
# Get time logs
GET /api/v1/time-logs?company_id=1&project_id=1
Query Params: company_id, project_id, user_id, ...

# Create time log
POST /api/v1/time-logs
Body: { company_id, project_id, user_id, hours, date, ... }
```

#### 14. Events/Calendar
```http
# Get events
GET /api/v1/events?company_id=1
Query Params: company_id, start_date, end_date, ...

# Create event
POST /api/v1/events
Body: { company_id, title, start_date, end_date, ... }
```

---

## 👤 Client Flow & APIs

### **Menus & Routes:**

1. **Dashboard** - `/app/client/dashboard`
2. **Projects** - `/app/client/projects`
3. **Proposals** - `/app/client/proposals`
4. **Store** - `/app/client/store`
5. **Files** - `/app/client/files`
6. **Billing:**
   - **Invoices** - `/app/client/invoices`
   - **Payments** - `/app/client/payments`
   - **Subscriptions** - `/app/client/subscriptions`
   - **Orders** - `/app/client/orders`
7. **Notes** - `/app/client/notes`
8. **Contracts** - `/app/client/contracts`
9. **Tickets** - `/app/client/tickets`

### **API Endpoints:**

#### 1. Client Dashboard
```http
GET /api/v1/dashboard
Query Params: company_id, user_id (client's user_id)
Response: Client-specific dashboard data
```

#### 2. Client Projects
```http
# Get client's projects
GET /api/v1/projects?company_id=1&client_id=12
Query Params: company_id, client_id

# Create project (if allowed)
POST /api/v1/projects
Body: { company_id, client_id, name, ... }
```

#### 3. Client Store
```http
# Get store items
GET /api/v1/items?company_id=1&category=...
Query Params: company_id, category

# Add to cart (frontend only)
# Checkout - Create order
POST /api/v1/orders
Body: { company_id, client_id, items: [{ item_id, quantity, price }], total, ... }
```

#### 4. Client Orders
```http
# Get client's orders
GET /api/v1/orders?company_id=1&client_id=12
Query Params: company_id, client_id

# View order
GET /api/v1/orders/:id?company_id=1

# Generate invoice from order
POST /api/v1/invoices
Body: { company_id, client_id, order_id, items: [...], ... }
```

#### 5. Client Invoices
```http
# Get client's invoices
GET /api/v1/invoices?company_id=1&client_id=12
Query Params: company_id, client_id, status

# View invoice
GET /api/v1/invoices/:id?company_id=1
```

#### 6. Client Payments
```http
# Get client's payments
GET /api/v1/payments?company_id=1&client_id=12
Query Params: company_id, client_id
```

#### 7. Client Contracts
```http
# Get client's contracts
GET /api/v1/contracts?company_id=1&client_id=12
Query Params: company_id, client_id
```

#### 8. Client Tickets
```http
# Get client's tickets
GET /api/v1/tickets?company_id=1&client_id=12
Query Params: company_id, client_id

# Create ticket
POST /api/v1/tickets
Body: { company_id, client_id, subject, description, ... }
```

---

## 👷 Employee Flow & APIs

### **Menus & Routes:**

#### **Work:**
1. **My Tasks** - `/app/employee/my-tasks`
2. **My Projects** - `/app/employee/my-projects`
3. **Time Tracking** - `/app/employee/time-tracking`
4. **Event** - `/app/employee/calendar`

#### **HR & Profile:**
5. **My Profile** - `/app/employee/my-profile`
6. **My Documents** - `/app/employee/my-documents`
7. **Attendance** - `/app/employee/attendance`
8. **Leave Requests** - `/app/employee/leave-requests`

#### **Communication:**
9. **Messages** - `/app/employee/messages`

### **API Endpoints:**

#### 1. Employee Dashboard
```http
GET /api/v1/dashboard
Query Params: company_id, user_id (employee's user_id)
Response: Employee-specific dashboard data
```

#### 2. My Tasks
```http
# Get employee's tasks
GET /api/v1/tasks?company_id=1&assigned_to=USER_ID
Query Params: company_id, assigned_to (user_id)

# Update task status
PUT /api/v1/tasks/:id
Body: { status: 'in progress', ... }
```

#### 3. My Projects
```http
# Get employee's projects
GET /api/v1/projects?company_id=1&member_id=USER_ID
Query Params: company_id, member_id (user_id)
```

#### 4. Time Tracking
```http
# Get employee's time logs
GET /api/v1/time-logs?company_id=1&user_id=USER_ID
Query Params: company_id, user_id

# Create time log
POST /api/v1/time-logs
Body: { company_id, project_id, user_id, hours, date, description, ... }
```

#### 5. Attendance
```http
# Get attendance records
GET /api/v1/attendance?company_id=1&user_id=USER_ID
Query Params: company_id, user_id

# Check in
POST /api/v1/attendance/check-in
Body: { company_id }

# Check out
POST /api/v1/attendance/check-out
Body: { company_id }
```

#### 6. Leave Requests
```http
# Get leave requests
GET /api/v1/leave-requests?company_id=1&user_id=USER_ID
Query Params: company_id, user_id

# Create leave request
POST /api/v1/leave-requests
Body: { company_id, user_id, start_date, end_date, reason, ... }
```

#### 7. Messages
```http
# Get messages
GET /api/v1/messages?company_id=1&user_id=USER_ID
Query Params: company_id, user_id

# Send message
POST /api/v1/messages
Body: { company_id, from_user_id, to_user_id, message, ... }
```

---

## 🧪 API Testing Guide

### **Testing Tools:**
- **Postman**
- **Thunder Client (VS Code)**
- **Browser DevTools (Network Tab)**
- **curl**

### **Authentication:**
```http
# Login first
POST /api/v1/auth/login
Body: { email, password }
Response: { success: true, data: { token, user: {...} } }

# Use token in headers
Authorization: Bearer YOUR_TOKEN_HERE
```

### **Common Query Parameters:**
- `company_id`: Required for most endpoints
- `user_id`: For user-specific data
- `client_id`: For client-specific data
- `project_id`: For project-related data
- `status`: Filter by status
- `search`: Search term
- `page`: Pagination page number
- `limit`: Items per page

### **Testing Checklist:**

#### ✅ **SuperAdmin Testing:**
1. ✅ Login as SuperAdmin
2. ✅ View dashboard stats
3. ✅ Create/Update/Delete package
4. ✅ Create/Update/Delete company
5. ✅ View billing records
6. ✅ Manage users

#### ✅ **Admin Testing:**
1. ✅ Login as Admin
2. ✅ View dashboard
3. ✅ Create/Update/Delete lead
4. ✅ Create/Update/Delete client
5. ✅ Create/Update/Delete project
6. ✅ Create/Update/Delete task
7. ✅ Create invoice
8. ✅ Create order
9. ✅ Upload file to project
10. ✅ Manage employees
11. ✅ View attendance
12. ✅ Create time log

#### ✅ **Client Testing:**
1. ✅ Login as Client
2. ✅ View dashboard
3. ✅ View projects
4. ✅ Browse store
5. ✅ Add items to cart
6. ✅ Checkout (create order)
7. ✅ View orders
8. ✅ Generate invoice from order
9. ✅ View invoices
10. ✅ View payments
11. ✅ Create ticket

#### ✅ **Employee Testing:**
1. ✅ Login as Employee
2. ✅ View dashboard
3. ✅ View my tasks
4. ✅ Update task status
5. ✅ View my projects
6. ✅ Create time log
7. ✅ Check in/Check out
8. ✅ Create leave request
9. ✅ Send message

---

## 📝 Common API Endpoints

### **Authentication:**
```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### **Dashboard:**
```http
GET /api/v1/dashboard?company_id=1&user_id=1
```

### **File Upload:**
```http
POST /api/v1/projects/:id/upload?company_id=1
Content-Type: multipart/form-data
Body: FormData { file: File, title?: string, description?: string }
```

### **PDF Generation:**
```http
GET /api/v1/invoices/:id/pdf?company_id=1
GET /api/v1/estimates/:id/pdf?company_id=1
```

---

## 🔄 Typical Workflows

### **1. Client Order Flow:**
```
Client → Store → Add to Cart → Checkout → Create Order → Generate Invoice → Payment
```

### **2. Project Management Flow:**
```
Admin → Create Project → Add Tasks → Assign to Employee → Employee Updates → Complete
```

### **3. Invoice Flow:**
```
Admin → Create Invoice → Send to Client → Client Views → Payment → Mark Paid
```

### **4. Time Tracking Flow:**
```
Employee → Select Project → Log Time → Submit → Admin Reviews → Approve
```

---

## 📌 Important Notes

1. **Always include `company_id`** in query params for most endpoints
2. **Authentication token** required in headers for protected routes
3. **File uploads** use `multipart/form-data`
4. **Date formats**: Use ISO 8601 format (YYYY-MM-DD)
5. **Currency**: Store as decimal/float, display with formatting
6. **Pagination**: Use `page` and `limit` query params
7. **Search**: Use `search` query param for text search
8. **Filtering**: Use status, date ranges, etc. in query params

---

## 🐛 Common Issues & Solutions

### **Issue 1: "company_id is required"**
**Solution**: Always include `company_id` in query params or request body

### **Issue 2: "File is required" (file upload)**
**Solution**: Ensure file is properly appended to FormData with field name 'file'

### **Issue 3: Foreign key constraint errors**
**Solution**: Ensure referenced IDs (client_id, project_id, etc.) exist in database

### **Issue 4: Unauthorized (401)**
**Solution**: Check if token is valid and included in Authorization header

### **Issue 5: Data not displaying**
**Solution**: Check if API returns data, verify filters (company_id, client_id, etc.)

---

## 📞 Support

For API issues or questions:
1. Check browser console for errors
2. Check Network tab for API responses
3. Verify request payload and query params
4. Check backend logs for server errors

---

**Last Updated**: 2025-01-01
**Version**: 1.0.0

