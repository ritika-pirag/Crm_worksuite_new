# CRM WORKSUITE - COMPLETE TESTING FLOW GUIDE
## Comprehensive Testing Report for All User Roles

---

## TABLE OF CONTENTS
1. [Testing Overview](#testing-overview)
2. [Environment Setup](#environment-setup)
3. [Super Admin Testing Flow](#super-admin-testing-flow)
4. [Admin Testing Flow](#admin-testing-flow)
5. [Employee Testing Flow](#employee-testing-flow)
6. [Client Testing Flow](#client-testing-flow)
7. [Integration Testing](#integration-testing)
8. [API Testing Checklist](#api-testing-checklist)
9. [Common Test Scenarios](#common-test-scenarios)

---

## TESTING OVERVIEW

### System Architecture
- **Backend**: Node.js + Express + MySQL
- **Frontend**: React + Vite + TailwindCSS
- **Authentication**: JWT-based (Bearer Token)

### User Roles (4 Types)
1. **SUPERADMIN** - System-level management
2. **ADMIN** - Company-level management
3. **EMPLOYEE** - Team member
4. **CLIENT** - Customer

### Base URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## ENVIRONMENT SETUP

### Prerequisites Testing
```bash
# 1. Check Node.js installation
node --version  # Should be v14+ or v16+

# 2. Check MySQL connection
mysql -u root -p

# 3. Backend setup
cd crm-worksuite-backend
npm install
npm start  # Should run on port 5000

# 4. Frontend setup
cd crm-worksuite-frontend
npm install
npm run dev  # Should run on port 5173
```

### Database Verification
```sql
-- Check if database exists
SHOW DATABASES LIKE 'crm_worksuite';

-- Check main tables
USE crm_worksuite;
SHOW TABLES;

-- Verify sample data
SELECT * FROM users;
SELECT * FROM companies;
```

---

## SUPER ADMIN TESTING FLOW

### 1. AUTHENTICATION
**Test Case: Super Admin Login**
```
URL: http://localhost:5173/login
Credentials:
- Email: superadmin@example.com
- Password: [your_password]

Expected Result:
✓ Redirect to /app/superadmin/dashboard
✓ JWT token stored in localStorage
✓ User role = SUPERADMIN
```

### 2. DASHBOARD (Super Admin)
**URL**: `/app/superadmin/dashboard`

**Test Items:**
- [ ] System statistics display (Total Companies, Users, Revenue)
- [ ] Recent activities list
- [ ] Charts and graphs loading
- [ ] Quick action buttons

### 3. COMPANIES MANAGEMENT
**URL**: `/app/superadmin/companies`

**API Endpoints to Test:**
```javascript
// Get all companies
GET /api/superadmin/companies

// Get single company
GET /api/superadmin/companies/:id

// Create company
POST /api/superadmin/companies
Body: {
  "name": "Test Company",
  "email": "test@company.com",
  "phone": "1234567890",
  "address": "Test Address",
  "package_id": 1
}

// Update company
PUT /api/superadmin/companies/:id

// Delete company
DELETE /api/superadmin/companies/:id
```

**Test Scenarios:**
- [ ] Create new company
- [ ] View company details
- [ ] Edit company information
- [ ] Delete company
- [ ] Search/filter companies
- [ ] Pagination working
- [ ] Assign package to company

### 4. PACKAGES MANAGEMENT
**URL**: `/app/superadmin/packages`

**API Endpoints:**
```javascript
// Get all packages
GET /api/superadmin/packages

// Create package
POST /api/superadmin/packages
Body: {
  "name": "Premium",
  "price": 99.99,
  "max_employees": 50,
  "max_clients": 100,
  "features": ["Feature 1", "Feature 2"]
}

// Update package
PUT /api/superadmin/packages/:id

// Delete package
DELETE /api/superadmin/packages/:id
```

**Test Scenarios:**
- [ ] Create new package (Basic, Premium, Enterprise)
- [ ] Edit package features and pricing
- [ ] Delete package
- [ ] View packages list
- [ ] Assign package to company

### 5. USERS MANAGEMENT (All Companies)
**URL**: `/app/superadmin/users`

**API Endpoints:**
```javascript
// Get all users (across all companies)
GET /api/superadmin/users

// Create user
POST /api/superadmin/users
Body: {
  "name": "Test User",
  "email": "user@test.com",
  "password": "password123",
  "role": "ADMIN",
  "company_id": 1
}

// Update user
PUT /api/superadmin/users/:id

// Delete user
DELETE /api/superadmin/users/:id
```

**Test Scenarios:**
- [ ] View all users from all companies
- [ ] Create user for specific company
- [ ] Edit user details
- [ ] Delete user
- [ ] Filter users by company
- [ ] Filter users by role

### 6. OFFLINE REQUESTS
**URL**: `/app/superadmin/offline-requests`

**API Endpoints:**
```javascript
// Get offline requests
GET /api/superadmin/offline-requests

// Accept request
POST /api/superadmin/offline-requests/:id/accept

// Reject request
POST /api/superadmin/offline-requests/:id/reject
```

**Test Scenarios:**
- [ ] View pending offline requests
- [ ] Accept company registration request
- [ ] Reject company registration request
- [ ] View request details

### 7. BILLING & SYSTEM STATS
**URL**: `/app/superadmin/billing`

**API Endpoints:**
```javascript
// Get billing info
GET /api/superadmin/billing

// Get system statistics
GET /api/superadmin/stats
```

**Test Scenarios:**
- [ ] View total revenue
- [ ] View company subscriptions
- [ ] View payment history
- [ ] Export billing reports

### 8. SUPPORT TICKETS (Super Admin)
**URL**: `/app/superadmin/support-tickets`

**API Endpoints:**
```javascript
GET /api/superadmin/support-tickets
```

**Test Scenarios:**
- [ ] View all support tickets from all companies
- [ ] Filter by status/priority
- [ ] Respond to tickets

### 9. SYSTEM SETTINGS
**URL**: `/app/superadmin/settings`

**API Endpoints:**
```javascript
GET /api/superadmin/settings
PUT /api/superadmin/settings
```

**Test Scenarios:**
- [ ] Update system-wide settings
- [ ] Configure email settings
- [ ] Set default configurations

---

## ADMIN TESTING FLOW

### 1. AUTHENTICATION
**Test Case: Admin Login**
```
URL: http://localhost:5173/login
Credentials:
- Email: admin@company.com
- Password: [your_password]

Expected Result:
✓ Redirect to /app/admin/dashboard
✓ JWT token stored
✓ User role = ADMIN
✓ company_id associated
```

### 2. DASHBOARD (Admin)
**URL**: `/app/admin/dashboard`

**API Endpoints:**
```javascript
GET /api/dashboard/stats
```

**Test Scenarios:**
- [ ] View company dashboard
- [ ] Total leads, clients, projects count
- [ ] Revenue statistics
- [ ] Recent activities
- [ ] Upcoming tasks
- [ ] Team performance metrics

### 3. LEADS MANAGEMENT
**URL**: `/app/admin/leads`

**API Endpoints:**
```javascript
// Get all leads
GET /api/leads?company_id=1

// Get lead overview
GET /api/leads/overview

// Get single lead
GET /api/leads/:id

// Create lead
POST /api/leads
Body: {
  "company_id": 1,
  "company_name": "ABC Corp",
  "website": "https://abc.com",
  "mobile": "9876543210",
  "email": "contact@abc.com",
  "source": "Website",
  "status": "New"
}

// Update lead
PUT /api/leads/:id

// Delete lead
DELETE /api/leads/:id

// Convert to client
POST /api/leads/:id/convert-to-client

// Update status
PUT /api/leads/:id/update-status
Body: { "status": "Qualified" }

// Bulk actions
POST /api/leads/bulk-action
Body: {
  "action": "delete",
  "lead_ids": [1, 2, 3]
}

// Labels
GET /api/leads/labels
POST /api/leads/labels
PUT /api/leads/:id/labels
DELETE /api/leads/labels/:label

// Contacts
GET /api/leads/contacts
POST /api/leads/contacts
PUT /api/leads/contacts/:id
DELETE /api/leads/contacts/:id
```

**Test Scenarios:**
- [ ] Create new lead
- [ ] View leads list
- [ ] Search/filter leads (by status, source, etc.)
- [ ] Edit lead details
- [ ] Add notes to lead
- [ ] Add tasks to lead
- [ ] Upload documents
- [ ] Convert lead to client
- [ ] Bulk delete leads
- [ ] Assign labels to leads
- [ ] Add contact persons to lead
- [ ] Update lead status (New → Qualified → Lost/Won)

### 4. CLIENTS MANAGEMENT
**URL**: `/app/admin/clients`

**API Endpoints:**
```javascript
// Get all clients
GET /api/clients?company_id=1

// Get overview
GET /api/clients/overview

// Get single client
GET /api/clients/:id

// Create client
POST /api/clients
Body: {
  "company_id": 1,
  "company_name": "XYZ Ltd",
  "email": "info@xyz.com",
  "mobile": "9876543210",
  "category": "Enterprise",
  "website": "https://xyz.com"
}

// Update client
PUT /api/clients/:id

// Delete client
DELETE /api/clients/:id

// Client contacts
POST /api/clients/:id/contacts
GET /api/clients/:id/contacts
PUT /api/clients/:id/contacts/:contactId
DELETE /api/clients/:id/contacts/:contactId
```

**Test Scenarios:**
- [ ] Create new client
- [ ] View clients list
- [ ] Search/filter clients
- [ ] Edit client details
- [ ] View client dashboard
- [ ] Add contact persons
- [ ] View client projects
- [ ] View client invoices
- [ ] View client payments
- [ ] View client documents
- [ ] Delete client

### 5. PROJECTS MANAGEMENT
**URL**: `/app/admin/projects`

**API Endpoints:**
```javascript
// Get all projects
GET /api/projects?company_id=1

// Get filters
GET /api/projects/filters

// Get single project
GET /api/projects/:id

// Create project
POST /api/projects
Body: {
  "company_id": 1,
  "client_id": 1,
  "project_name": "Website Development",
  "start_date": "2024-01-01",
  "deadline": "2024-06-01",
  "project_budget": 50000,
  "status": "In Progress",
  "project_summary": "E-commerce website"
}

// Update project
PUT /api/projects/:id

// Delete project
DELETE /api/projects/:id

// Get project members
GET /api/projects/:id/members

// Get project tasks
GET /api/projects/:id/tasks

// Upload files
POST /api/projects/:id/upload

// Get project files
GET /api/projects/:id/files
```

**Test Scenarios:**
- [ ] Create new project
- [ ] View projects list (All, In Progress, Completed)
- [ ] Filter by client, status, date
- [ ] Edit project details
- [ ] Assign team members
- [ ] Create project tasks
- [ ] Upload project files
- [ ] Track project progress
- [ ] Update project status
- [ ] View project timeline
- [ ] Delete project

### 6. TASKS MANAGEMENT
**URL**: `/app/admin/tasks`

**API Endpoints:**
```javascript
// Get all tasks
GET /api/tasks?company_id=1

// Get single task
GET /api/tasks/:id

// Create task
POST /api/tasks
Body: {
  "company_id": 1,
  "heading": "Design Homepage",
  "project_id": 1,
  "assigned_to": 2,
  "start_date": "2024-01-15",
  "due_date": "2024-01-20",
  "priority": "High",
  "status": "To Do"
}

// Update task
PUT /api/tasks/:id

// Delete task
DELETE /api/tasks/:id

// Task comments
GET /api/tasks/:id/comments
POST /api/tasks/:id/comments

// Task files
GET /api/tasks/:id/files
POST /api/tasks/:id/files
```

**Test Scenarios:**
- [ ] Create new task
- [ ] Assign task to employee
- [ ] Set task priority (Low, Medium, High)
- [ ] Set due date
- [ ] Add task description
- [ ] Upload task files
- [ ] Add comments to task
- [ ] Update task status (To Do → In Progress → Completed)
- [ ] View task details
- [ ] Filter tasks (My Tasks, All Tasks, By Status)
- [ ] Delete task

### 7. TIME TRACKING
**URL**: `/app/admin/time-tracking`

**API Endpoints:**
```javascript
// Get time logs
GET /api/time-tracking?company_id=1

// Create time log
POST /api/time-tracking
Body: {
  "company_id": 1,
  "project_id": 1,
  "task_id": 1,
  "user_id": 2,
  "start_time": "2024-01-15T09:00:00",
  "end_time": "2024-01-15T12:00:00",
  "memo": "Working on design"
}
```

**Test Scenarios:**
- [ ] View all time logs
- [ ] Create time entry
- [ ] Edit time entry
- [ ] Delete time entry
- [ ] Filter by employee, project, date
- [ ] Generate time reports
- [ ] Export timesheet

### 8. INVOICES
**URL**: `/app/admin/invoices`

**API Endpoints:**
```javascript
// Get all invoices
GET /api/invoices?company_id=1

// Get single invoice
GET /api/invoices/:id

// Create invoice
POST /api/invoices
Body: {
  "company_id": 1,
  "client_id": 1,
  "invoice_number": "INV-001",
  "issue_date": "2024-01-15",
  "due_date": "2024-02-15",
  "sub_total": 10000,
  "total": 11800,
  "currency": "INR",
  "items": [
    {
      "item_name": "Web Development",
      "quantity": 1,
      "unit_price": 10000,
      "amount": 10000
    }
  ]
}

// Update invoice
PUT /api/invoices/:id

// Delete invoice
DELETE /api/invoices/:id

// Send email
POST /api/invoices/:id/send-email

// Generate PDF
GET /api/invoices/:id/pdf

// Create from time logs
POST /api/invoices/create-from-time-logs

// Create recurring invoice
POST /api/invoices/create-recurring
```

**Test Scenarios:**
- [ ] Create new invoice
- [ ] Add invoice items
- [ ] Calculate tax automatically
- [ ] Preview invoice
- [ ] Send invoice via email
- [ ] Download invoice PDF
- [ ] Mark invoice as paid
- [ ] Create recurring invoice
- [ ] Create invoice from time logs
- [ ] Edit invoice
- [ ] Delete invoice
- [ ] Filter invoices (Paid, Unpaid, Overdue)

### 9. PAYMENTS
**URL**: `/app/admin/payments`

**API Endpoints:**
```javascript
// Get all payments
GET /api/payments?company_id=1

// Create payment
POST /api/payments
Body: {
  "company_id": 1,
  "invoice_id": 1,
  "amount": 11800,
  "payment_date": "2024-01-20",
  "payment_method": "Bank Transfer",
  "transaction_id": "TXN123456"
}
```

**Test Scenarios:**
- [ ] Record payment against invoice
- [ ] View payments list
- [ ] Filter by date, method, client
- [ ] View payment details
- [ ] Export payment reports

### 10. EXPENSES
**URL**: `/app/admin/expenses`

**API Endpoints:**
```javascript
// Get all expenses
GET /api/expenses?company_id=1

// Create expense
POST /api/expenses
Body: {
  "company_id": 1,
  "item_name": "Office Supplies",
  "purchase_date": "2024-01-15",
  "amount": 5000,
  "category": "Office",
  "user_id": 2
}
```

**Test Scenarios:**
- [ ] Create new expense
- [ ] Upload expense receipt
- [ ] Categorize expenses
- [ ] Approve/reject expenses
- [ ] View expense reports
- [ ] Filter by category, date, employee

### 11. PROPOSALS
**URL**: `/app/admin/proposals`

**API Endpoints:**
```javascript
GET /api/proposals?company_id=1
POST /api/proposals
PUT /api/proposals/:id
DELETE /api/proposals/:id
GET /api/proposals/:id
```

**Test Scenarios:**
- [ ] Create proposal
- [ ] Send to client
- [ ] Track proposal status
- [ ] Convert to project
- [ ] Download proposal PDF

### 12. ESTIMATES
**URL**: `/app/admin/estimates`

**API Endpoints:**
```javascript
GET /api/estimates?company_id=1
POST /api/estimates
PUT /api/estimates/:id
DELETE /api/estimates/:id
GET /api/estimates/:id
```

**Test Scenarios:**
- [ ] Create estimate
- [ ] Send to client
- [ ] Convert to invoice
- [ ] Track estimate status

### 13. EMPLOYEES MANAGEMENT
**URL**: `/app/admin/employees`

**API Endpoints:**
```javascript
// Get all employees
GET /api/employees?company_id=1

// Get employee dashboard
GET /api/employees/dashboard

// Get profile
GET /api/employees/profile

// Create employee
POST /api/employees
Body: {
  "company_id": 1,
  "name": "John Doe",
  "email": "john@company.com",
  "password": "password123",
  "mobile": "9876543210",
  "department_id": 1,
  "position_id": 1,
  "joining_date": "2024-01-01",
  "salary": 50000
}

// Update employee
PUT /api/employees/:id

// Delete employee
DELETE /api/employees/:id
```

**Test Scenarios:**
- [ ] Add new employee
- [ ] Edit employee details
- [ ] Assign department
- [ ] Assign position/designation
- [ ] Set salary
- [ ] Upload employee documents
- [ ] View employee list
- [ ] Delete employee

### 14. ATTENDANCE
**URL**: `/app/admin/attendance`

**API Endpoints:**
```javascript
// Get attendance
GET /api/attendance?company_id=1

// Get monthly calendar
GET /api/attendance/calendar

// Get attendance percentage
GET /api/attendance/percentage

// Get today status
GET /api/attendance/today

// Check-in
POST /api/attendance/check-in

// Check-out
POST /api/attendance/check-out
```

**Test Scenarios:**
- [ ] View attendance calendar
- [ ] Mark attendance manually
- [ ] View employee attendance reports
- [ ] Filter by date range
- [ ] Calculate attendance percentage
- [ ] Export attendance reports

### 15. DEPARTMENTS
**URL**: `/app/admin/departments`

**API Endpoints:**
```javascript
GET /api/departments?company_id=1
POST /api/departments
PUT /api/departments/:id
DELETE /api/departments/:id
```

**Test Scenarios:**
- [ ] Create department (IT, HR, Sales, etc.)
- [ ] Edit department
- [ ] View employees in department
- [ ] Delete department

### 16. POSITIONS
**URL**: `/app/admin/positions`

**API Endpoints:**
```javascript
GET /api/positions?company_id=1
POST /api/positions
PUT /api/positions/:id
DELETE /api/positions/:id
```

**Test Scenarios:**
- [ ] Create position/designation
- [ ] Edit position
- [ ] Delete position

### 17. TICKETS/SUPPORT
**URL**: `/app/admin/tickets`

**API Endpoints:**
```javascript
GET /api/tickets?company_id=1
POST /api/tickets
PUT /api/tickets/:id
DELETE /api/tickets/:id
POST /api/tickets/:id/comments
```

**Test Scenarios:**
- [ ] Create support ticket
- [ ] Assign to employee
- [ ] Update ticket status
- [ ] Add comments/replies
- [ ] Close ticket

### 18. MESSAGES
**URL**: `/app/admin/messages`

**API Endpoints:**
```javascript
GET /api/messages?company_id=1
POST /api/messages
```

**Test Scenarios:**
- [ ] Send message to employee
- [ ] Send message to client
- [ ] View message threads
- [ ] Mark as read/unread

### 19. DOCUMENTS
**URL**: `/app/admin/documents`

**API Endpoints:**
```javascript
GET /api/documents?company_id=1
POST /api/documents
DELETE /api/documents/:id
```

**Test Scenarios:**
- [ ] Upload document
- [ ] Categorize documents
- [ ] Share with team
- [ ] Download document
- [ ] Delete document

### 20. REPORTS
**URL**: `/app/admin/reports`

**API Endpoints:**
```javascript
GET /api/reports?company_id=1&type=sales
```

**Test Scenarios:**
- [ ] Generate sales report
- [ ] Generate expense report
- [ ] Generate time tracking report
- [ ] Generate project report
- [ ] Export reports (PDF, Excel)

### 21. SETTINGS
**URL**: `/app/admin/settings`

**API Endpoints:**
```javascript
GET /api/settings?company_id=1
PUT /api/settings
```

**Test Scenarios:**
- [ ] Update company profile
- [ ] Update company logo
- [ ] Configure email settings
- [ ] Configure notifications
- [ ] Set currency and timezone
- [ ] Configure invoice settings

### 22. EMAIL TEMPLATES
**URL**: `/app/admin/email-templates`

**API Endpoints:**
```javascript
GET /api/email-templates?company_id=1
POST /api/email-templates
PUT /api/email-templates/:id
DELETE /api/email-templates/:id
```

**Test Scenarios:**
- [ ] Create email template
- [ ] Edit template
- [ ] Use template variables
- [ ] Preview template

### 23. CUSTOM FIELDS
**URL**: `/app/admin/custom-fields`

**API Endpoints:**
```javascript
GET /api/custom-fields?company_id=1
POST /api/custom-fields
PUT /api/custom-fields/:id
DELETE /api/custom-fields/:id
```

**Test Scenarios:**
- [ ] Add custom field to leads
- [ ] Add custom field to clients
- [ ] Add custom field to projects
- [ ] Edit custom field
- [ ] Delete custom field

### 24. INTEGRATIONS
**URL**: `/app/admin/integrations`

**API Endpoints:**
```javascript
GET /api/social-media-integrations?company_id=1
POST /api/social-media-integrations
```

**Test Scenarios:**
- [ ] Connect social media accounts
- [ ] Import leads from Facebook
- [ ] Configure payment gateways
- [ ] Connect Zoho Books
- [ ] Connect QuickBooks

### 25. AUDIT LOGS
**URL**: `/app/admin/audit-logs`

**API Endpoints:**
```javascript
GET /api/audit-logs?company_id=1
```

**Test Scenarios:**
- [ ] View all activity logs
- [ ] Filter by user
- [ ] Filter by action type
- [ ] Export logs

---

## EMPLOYEE TESTING FLOW

### 1. AUTHENTICATION
**Test Case: Employee Login**
```
URL: http://localhost:5173/login
Credentials:
- Email: employee@company.com
- Password: [your_password]

Expected Result:
✓ Redirect to /app/employee/dashboard
✓ JWT token stored
✓ User role = EMPLOYEE
```

### 2. DASHBOARD (Employee)
**URL**: `/app/employee/dashboard`

**API Endpoints:**
```javascript
GET /api/employees/dashboard
```

**Test Scenarios:**
- [ ] View personal dashboard
- [ ] My tasks summary
- [ ] My projects
- [ ] Today's attendance status
- [ ] Upcoming deadlines
- [ ] Recent activities

### 3. MY TASKS
**URL**: `/app/employee/my-tasks`

**Test Scenarios:**
- [ ] View assigned tasks
- [ ] Update task status
- [ ] Add task comments
- [ ] Upload task files
- [ ] Start/stop timer on task
- [ ] Mark task as complete

### 4. MY PROJECTS
**URL**: `/app/employee/my-projects`

**Test Scenarios:**
- [ ] View assigned projects
- [ ] View project tasks
- [ ] View project files
- [ ] Add project updates

### 5. ATTENDANCE (Employee)
**URL**: `/app/employee/attendance`

**API Endpoints:**
```javascript
POST /api/attendance/check-in
POST /api/attendance/check-out
GET /api/attendance/today
GET /api/attendance/calendar
```

**Test Scenarios:**
- [ ] Check-in for the day
- [ ] View today's status
- [ ] Check-out
- [ ] View attendance history
- [ ] View attendance percentage

### 6. LEAVE REQUESTS
**URL**: `/app/employee/leave-requests`

**API Endpoints:**
```javascript
GET /api/leave-requests?user_id=X
POST /api/leave-requests
```

**Test Scenarios:**
- [ ] Apply for leave
- [ ] Select leave type (Sick, Casual, Paid)
- [ ] View leave balance
- [ ] View leave history
- [ ] Cancel leave request

### 7. TIME TRACKING (Employee)
**URL**: `/app/employee/time-tracking`

**Test Scenarios:**
- [ ] Start timer
- [ ] Stop timer
- [ ] View time logs
- [ ] Edit time entry
- [ ] View total hours worked

### 8. MY PROFILE
**URL**: `/app/employee/my-profile`

**API Endpoints:**
```javascript
GET /api/employees/profile
PUT /api/employees/profile
```

**Test Scenarios:**
- [ ] View profile details
- [ ] Update profile information
- [ ] Change password
- [ ] Upload profile picture
- [ ] View employment details

### 9. MY DOCUMENTS
**URL**: `/app/employee/my-documents`

**Test Scenarios:**
- [ ] View personal documents
- [ ] Download documents
- [ ] View company documents

### 10. MESSAGES (Employee)
**URL**: `/app/employee/messages`

**Test Scenarios:**
- [ ] View messages
- [ ] Reply to messages
- [ ] Send new message

### 11. CALENDAR
**URL**: `/app/employee/calendar`

**Test Scenarios:**
- [ ] View tasks on calendar
- [ ] View meetings
- [ ] View events

### 12. NOTIFICATIONS
**URL**: `/app/employee/notifications`

**API Endpoints:**
```javascript
GET /api/notifications?user_id=X
```

**Test Scenarios:**
- [ ] View all notifications
- [ ] Mark as read
- [ ] Delete notification

---

## CLIENT TESTING FLOW

### 1. AUTHENTICATION
**Test Case: Client Login**
```
URL: http://localhost:5173/login
Credentials:
- Email: client@example.com
- Password: [your_password]

Expected Result:
✓ Redirect to /app/client/dashboard
✓ JWT token stored
✓ User role = CLIENT
```

### 2. DASHBOARD (Client)
**URL**: `/app/client/dashboard`

**Test Scenarios:**
- [ ] View client dashboard
- [ ] Total projects
- [ ] Active invoices
- [ ] Pending payments
- [ ] Recent activities

### 3. PROJECTS (Client View)
**URL**: `/app/client/projects`

**Test Scenarios:**
- [ ] View all my projects
- [ ] View project details
- [ ] View project files
- [ ] View project progress
- [ ] Add project comments

### 4. INVOICES (Client View)
**URL**: `/app/client/invoices`

**Test Scenarios:**
- [ ] View all invoices
- [ ] View invoice details
- [ ] Download invoice PDF
- [ ] View payment status
- [ ] Filter invoices (Paid, Unpaid, Overdue)

### 5. PAYMENTS (Client)
**URL**: `/app/client/payments`

**Test Scenarios:**
- [ ] View payment history
- [ ] Make online payment (if integrated)
- [ ] Download payment receipt

### 6. ESTIMATES (Client View)
**URL**: `/app/client/estimates`

**Test Scenarios:**
- [ ] View estimates
- [ ] Accept estimate
- [ ] Decline estimate
- [ ] Download estimate PDF

### 7. PROPOSALS (Client View)
**URL**: `/app/client/proposals`

**Test Scenarios:**
- [ ] View proposals
- [ ] Accept proposal
- [ ] Decline proposal
- [ ] Download proposal PDF

### 8. TICKETS (Client)
**URL**: `/app/client/tickets`

**Test Scenarios:**
- [ ] Create support ticket
- [ ] View ticket status
- [ ] Reply to ticket
- [ ] View ticket history

### 9. CONTRACTS (Client)
**URL**: `/app/client/contracts`

**Test Scenarios:**
- [ ] View contracts
- [ ] Sign contract (if e-signature enabled)
- [ ] Download contract PDF

### 10. FILES (Client)
**URL**: `/app/client/files`

**Test Scenarios:**
- [ ] View shared files
- [ ] Download files
- [ ] Upload files

### 11. MESSAGES (Client)
**URL**: `/app/client/messages`

**Test Scenarios:**
- [ ] Send message to company
- [ ] View message threads
- [ ] Reply to messages

### 12. PROFILE (Client)
**URL**: `/app/client/profile`

**API Endpoints:**
```javascript
GET /api/auth/me
PUT /api/auth/me
```

**Test Scenarios:**
- [ ] View profile
- [ ] Update profile information
- [ ] Change password
- [ ] Update company details

### 13. SUBSCRIPTIONS (Client)
**URL**: `/app/client/subscriptions`

**Test Scenarios:**
- [ ] View active subscriptions
- [ ] Renew subscription
- [ ] View subscription history

### 14. ORDERS (Client)
**URL**: `/app/client/orders`

**Test Scenarios:**
- [ ] View orders
- [ ] View order details
- [ ] Track order status

### 15. CREDIT NOTES (Client)
**URL**: `/app/client/credit-notes`

**Test Scenarios:**
- [ ] View credit notes
- [ ] Download credit note

---

## INTEGRATION TESTING

### 1. Role-Based Access Control (RBAC)
```javascript
// Test unauthorized access
// Login as EMPLOYEE and try to access admin routes
GET /app/admin/dashboard
// Expected: Redirect to /app/employee/dashboard

// Login as CLIENT and try to access admin routes
GET /app/admin/leads
// Expected: Redirect to /app/client/dashboard
```

**Test Scenarios:**
- [ ] SUPERADMIN can access all routes
- [ ] ADMIN can access company-level routes only
- [ ] EMPLOYEE can access limited routes
- [ ] CLIENT can access client-specific routes only

### 2. Company Isolation
```javascript
// Login as Admin from Company 1
GET /api/leads?company_id=1
// Should return only Company 1 leads

// Try accessing Company 2 data
GET /api/leads?company_id=2
// Should return empty or error
```

**Test Scenarios:**
- [ ] Users can only see data from their company
- [ ] SUPERADMIN can see all company data
- [ ] Cross-company data access is blocked

### 3. Email Notifications
**Test Scenarios:**
- [ ] Invoice sent email
- [ ] Task assigned email
- [ ] Project created email
- [ ] Leave request email
- [ ] Password reset email

### 4. File Upload
**Test Scenarios:**
- [ ] Upload profile picture
- [ ] Upload project files
- [ ] Upload invoice attachments
- [ ] Upload documents
- [ ] File size validation
- [ ] File type validation

### 5. Search & Filters
**Test Scenarios:**
- [ ] Search leads by name/email
- [ ] Filter projects by status
- [ ] Filter invoices by date range
- [ ] Search employees
- [ ] Filter tasks by assigned user

### 6. Pagination
**Test Scenarios:**
- [ ] Leads pagination
- [ ] Clients pagination
- [ ] Projects pagination
- [ ] Invoices pagination
- [ ] Page size options (10, 25, 50, 100)

---

## API TESTING CHECKLIST

### Authentication APIs
```bash
# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}

# Expected Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "ADMIN",
    "company_id": 1
  }
}

# Get current user
GET http://localhost:5000/api/auth/me
Authorization: Bearer {token}

# Update current user
PUT http://localhost:5000/api/auth/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "mobile": "9876543210"
}

# Change password
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "old_password": "password123",
  "new_password": "newpassword123"
}

# Logout
POST http://localhost:5000/api/auth/logout
Authorization: Bearer {token}
```

### Testing with Postman/Thunder Client

**Setup:**
1. Create environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (set after login)

2. Test all endpoints with proper authorization header:
   ```
   Authorization: Bearer {{token}}
   ```

### Common HTTP Status Codes to Verify
- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## COMMON TEST SCENARIOS

### 1. Validation Testing
- [ ] Empty form submission
- [ ] Invalid email format
- [ ] Weak password validation
- [ ] Required field validation
- [ ] Date range validation
- [ ] Numeric field validation

### 2. Error Handling
- [ ] Database connection error
- [ ] Invalid API endpoint
- [ ] Expired JWT token
- [ ] Network timeout
- [ ] File upload errors

### 3. Performance Testing
- [ ] Load 1000+ records in list
- [ ] Multiple concurrent users
- [ ] Large file uploads
- [ ] Complex report generation
- [ ] Dashboard with multiple widgets

### 4. Security Testing
- [ ] SQL injection attempts
- [ ] XSS attacks
- [ ] CSRF protection
- [ ] Password encryption
- [ ] JWT token expiry
- [ ] Session management

### 5. Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 6. Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## TESTING WORKFLOW

### Daily Testing Routine
1. Start backend server
2. Start frontend server
3. Clear browser cache
4. Test new features
5. Regression testing on existing features
6. Document bugs

### Bug Reporting Format
```
Title: [Module] Brief description
Steps to Reproduce:
1. Go to...
2. Click on...
3. Enter...

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots:
[Attach if applicable]

Environment:
- Browser: Chrome 120
- OS: Windows 11
- User Role: ADMIN
```

---

## FINAL CHECKLIST

### Before Production Deployment

#### Backend
- [ ] Environment variables configured (.env)
- [ ] Database migrations completed
- [ ] Seed data created
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security headers set
- [ ] CORS configured

#### Frontend
- [ ] Environment variables set
- [ ] Build runs successfully (`npm run build`)
- [ ] All routes working
- [ ] Forms validated
- [ ] Loading states implemented
- [ ] Error messages displayed
- [ ] Responsive on all devices

#### Testing
- [ ] All user roles tested
- [ ] CRUD operations tested
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Reports generation working
- [ ] Export functionality working
- [ ] Search and filters working
- [ ] Pagination working

#### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images optimized
- [ ] Code minified
- [ ] Database indexed

#### Security
- [ ] Authentication working
- [ ] Authorization working
- [ ] Password encryption
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] HTTPS enabled

---

## CONCLUSION

Is comprehensive testing guide mein aapko har user role (SUPERADMIN, ADMIN, EMPLOYEE, CLIENT) ke liye complete testing flow mil gaya hai.

### Quick Start Testing:
1. **Start with Authentication** - Sabse pehle login test karo
2. **Role-wise Testing** - Ek ek role ko test karo
3. **Feature Testing** - Har feature ko individually test karo
4. **Integration Testing** - Sab features ko together test karo
5. **Bug Fixing** - Jo bhi issues mile unko fix karo

### Testing Priority:
1. **High Priority**: Authentication, CRUD operations, Payments
2. **Medium Priority**: Reports, Notifications, File uploads
3. **Low Priority**: UI/UX improvements, Additional features

Agar kisi specific module ya feature ko detail mein test karna ho toh mujhe batao, main aur detailed test cases provide karunga.

Happy Testing! 🚀
