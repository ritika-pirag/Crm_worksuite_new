# 📊 Data Flow Testing Priority Guide

## 🎯 Testing Order (सबसे पहले से शुरू करें)

यह guide आपको बताता है कि **किस order में menus test करें** ताकि data dependencies properly work करें।

---

## ✅ Phase 1: Foundation Setup (सबसे पहले)

### 1. **Authentication** 🔐
**Why First?** - बिना login के कुछ नहीं कर सकते

```http
POST /api/v1/auth/login
Body: { email, password }
```

**Test:**
- ✅ SuperAdmin login
- ✅ Admin login  
- ✅ Client login
- ✅ Employee login

**Next:** Login करने के बाद ही बाकी APIs work करेंगी

---

### 2. **Companies** (SuperAdmin) 🏢
**Why Second?** - सब कुछ company के अंदर होता है, company_id हर जगह required है

**Menu:** `/app/superadmin/companies`

```http
# Create Company (सबसे पहले)
POST /api/v1/companies
Body: {
  name: "Test Company",
  email: "company@test.com",
  phone: "1234567890",
  address: "Test Address"
}

# Get Company ID from response
Response: { success: true, data: { id: 1, ... } }
```

**Test:**
- ✅ Create company
- ✅ Get company list
- ✅ Update company
- ✅ View company details

**Important:** Company ID (जैसे `company_id = 1`) note कर लें, हर API में use होगा

---

### 3. **Users** 👥
**Why Third?** - Users बिना कुछ नहीं कर सकते, सभी operations users से जुड़े हैं

**Menu:** `/app/superadmin/users` या `/app/admin/employees`

```http
# Create Admin User (Company के लिए)
POST /api/v1/users
Body: {
  name: "Admin User",
  email: "admin@test.com",
  password: "password123",
  role: "ADMIN",
  company_id: 1  // Phase 2 से मिला company_id
}

# Create Client User
POST /api/v1/users
Body: {
  name: "Client User",
  email: "client@test.com",
  password: "password123",
  role: "CLIENT",
  company_id: 1
}

# Create Employee User
POST /api/v1/users
Body: {
  name: "Employee User",
  email: "employee@test.com",
  password: "password123",
  role: "EMPLOYEE",
  company_id: 1
}
```

**Test:**
- ✅ Create Admin user
- ✅ Create Client user
- ✅ Create Employee user
- ✅ Get users list
- ✅ Login with each user

**Important:** User IDs note कर लें, आगे use होंगे

---

## ✅ Phase 2: Core Data Setup

### 4. **Clients** 👤
**Why Fourth?** - Projects, Invoices, Orders सब clients से जुड़े हैं

**Menu:** `/app/admin/clients`

```http
# Create Client
POST /api/v1/clients
Body: {
  company_id: 1,
  name: "Test Client",
  email: "client@example.com",
  phone: "9876543210",
  address: "Client Address"
}

# Get Client ID from response
Response: { success: true, data: { id: 12, ... } }
```

**Test:**
- ✅ Create client
- ✅ Get clients list
- ✅ Update client
- ✅ View client details

**Important:** Client ID (जैसे `client_id = 12`) note कर लें

---

### 5. **Items (Store Products)** 🛍️
**Why Fifth?** - Store और Orders items के बिना नहीं चलेंगे

**Menu:** `/app/admin/items` या `/app/admin/store`

```http
# Create Item/Product
POST /api/v1/items
Body: {
  company_id: 1,
  name: "Web Development Service",
  price: 1000.00,
  description: "Full stack web development",
  category: "Services"
}

# Create more items
POST /api/v1/items
Body: {
  company_id: 1,
  name: "Mobile App Development",
  price: 2000.00,
  category: "Services"
}
```

**Test:**
- ✅ Create multiple items
- ✅ Get items list
- ✅ Update item
- ✅ Delete item

**Important:** Item IDs note कर लें, Store में use होंगे

---

## ✅ Phase 3: Work Management

### 6. **Projects** 📁
**Why Sixth?** - Tasks, Time Tracking, Expenses सब projects से जुड़े हैं

**Menu:** `/app/admin/projects`

```http
# Create Project
POST /api/v1/projects
Body: {
  company_id: 1,
  client_id: 12,  // Phase 2 से मिला
  name: "Website Development",
  start_date: "2025-01-01",
  deadline: "2025-02-01",
  status: "in progress"
}

# Get Project ID from response
Response: { success: true, data: { id: 15, ... } }
```

**Test:**
- ✅ Create project
- ✅ Get projects list
- ✅ Update project
- ✅ View project details
- ✅ Upload file to project

**Important:** Project ID (जैसे `project_id = 15`) note कर लें

---

### 7. **Tasks** ✅
**Why Seventh?** - Projects के अंदर tasks होते हैं

**Menu:** `/app/admin/tasks`

```http
# Create Task
POST /api/v1/tasks
Body: {
  company_id: 1,
  project_id: 15,  // Phase 3 से मिला
  title: "Design Homepage",
  description: "Create homepage design",
  status: "todo",  // or "To do", "Doing", "Done"
  priority: "High",  // "High", "Medium", "Low"
  assign_to: USER_ID,  // Employee user_id (single assignee)
  // OR use array for multiple assignees:
  assigned_to: [USER_ID, USER_ID_2],  // Array of user IDs
  // OR use collaborators:
  collaborators: [USER_ID_2, USER_ID_3]  // Additional collaborators
}
```

**Important Notes:**
- Use `assign_to` for single assignee (recommended)
- Use `assigned_to` array for multiple assignees
- Use `collaborators` array for additional team members
- Tasks are assigned through `task_assignees` table
- **Employee "My Projects" menu shows projects where employee has assigned tasks** (not project_members)

**Test:**
- ✅ Create task with assign_to
- ✅ Create task with assigned_to array
- ✅ Get tasks list (filter by project_id, assigned_to)
- ✅ Update task status
- ✅ Assign task to employee
- ✅ Verify employee sees project in "My Projects" after task assignment
- ✅ Delete task

---

## ✅ Phase 4: Financial Operations

### 8. **Orders** 🛒
**Why Eighth?** - Store checkout से orders बनते हैं, invoices orders से generate हो सकते हैं

**Menu:** `/app/admin/orders` या `/app/client/orders`

```http
# Create Order (from Store checkout)
POST /api/v1/orders
Body: {
  company_id: 1,
  client_id: 12,  // Phase 2 से
  items: [
    { item_id: 1, quantity: 2, price: 1000.00 },  // Phase 2 से item_id
    { item_id: 2, quantity: 1, price: 2000.00 }
  ],
  total: 4000.00,
  status: "pending"
}

# Get Order ID from response
Response: { success: true, data: { id: 5, ... } }
```

**Test:**
- ✅ Create order (multiple items के साथ)
- ✅ Get orders list
- ✅ View order details
- ✅ Update order status

**Important:** Order ID note कर लें, Invoice generate करने में use होगा

---

### 9. **Invoices** 💰
**Why Ninth?** - Orders से invoices generate होते हैं, Payments invoices से जुड़े हैं

**Menu:** `/app/admin/invoices` या `/app/client/invoices`

```http
# Create Invoice (from Order)
POST /api/v1/invoices
Body: {
  company_id: 1,
  client_id: 12,  // Phase 2 से
  order_id: 5,  // Phase 4 से (optional)
  items: [
    { item_id: 1, quantity: 2, price: 1000.00, total: 2000.00 },
    { item_id: 2, quantity: 1, price: 2000.00, total: 2000.00 }
  ],
  subtotal: 4000.00,
  tax: 0,
  total: 4000.00,
  status: "unpaid"
}

# Get Invoice ID from response
Response: { success: true, data: { id: 10, ... } }
```

**Test:**
- ✅ Create invoice
- ✅ Get invoices list
- ✅ View invoice details
- ✅ Generate invoice PDF
- ✅ Update invoice status

**Important:** Invoice ID note कर लें, Payment में use होगा

---

### 10. **Payments** 💳
**Why Tenth?** - Invoices के payments record करने के लिए

**Menu:** `/app/admin/payments` या `/app/client/payments`

```http
# Create Payment
POST /api/v1/payments
Body: {
  company_id: 1,
  invoice_id: 10,  // Phase 4 से
  amount: 4000.00,
  payment_method: "bank_transfer",
  payment_date: "2025-01-15",
  notes: "Payment received"
}
```

**Test:**
- ✅ Create payment
- ✅ Get payments list
- ✅ View payment details
- ✅ Link payment to invoice

---

## ✅ Phase 5: Employee Operations

### 11. **Time Tracking** ⏱️
**Why Eleventh?** - Projects पर time log करने के लिए

**Menu:** `/app/admin/time-tracking` या `/app/employee/time-tracking`

```http
# Create Time Log
POST /api/v1/time-logs
Body: {
  company_id: 1,
  project_id: 15,  // Phase 3 से
  user_id: EMPLOYEE_USER_ID,  // Phase 1 से
  hours: 8.5,
  date: "2025-01-15",
  description: "Worked on homepage design"
}
```

**Test:**
- ✅ Create time log
- ✅ Get time logs (filter by project_id, user_id)
- ✅ Update time log
- ✅ Delete time log

---

### 12. **Attendance** 📅
**Why Twelfth?** - Employee check-in/check-out के लिए

**Menu:** `/app/admin/attendance` या `/app/employee/attendance`

```http
# Check In
POST /api/v1/attendance/check-in
Body: { company_id: 1 }

# Check Out
POST /api/v1/attendance/check-out
Body: { company_id: 1 }

# Get Attendance Records
GET /api/v1/attendance?company_id=1&user_id=EMPLOYEE_USER_ID
```

**Test:**
- ✅ Check in
- ✅ Check out
- ✅ Get attendance records
- ✅ View attendance history

---

### **Employee "My Projects" Menu** 📁
**Important:** Employee dashboard "My Projects" (`/app/employee/my-projects`) shows projects where the employee has **assigned tasks**, not projects where they are team members.

**How it works:**
1. Employee gets tasks assigned (through `task_assignees` table)
2. Tasks have `project_id`
3. "My Projects" extracts unique `project_id` from assigned tasks
4. Shows only those projects

**To test:**
1. Create a project (Admin)
2. Create a task in that project and assign to employee (Admin)
3. Login as Employee
4. Go to "My Projects" - should see the project
5. Remove task assignment - project disappears from "My Projects"

---

## ✅ Phase 6: Additional Features

### 13. **Estimates** 📄
**Menu:** `/app/admin/estimates`

```http
POST /api/v1/estimates
Body: {
  company_id: 1,
  client_id: 12,
  items: [...],
  total: 5000.00
}
```

### 14. **Contracts** 📋
**Menu:** `/app/admin/contracts`

```http
POST /api/v1/contracts
Body: {
  company_id: 1,
  client_id: 12,
  title: "Service Agreement",
  ...
}
```

### 15. **Tickets** 🎫
**Menu:** `/app/admin/tickets` या `/app/client/tickets`

```http
POST /api/v1/tickets
Body: {
  company_id: 1,
  client_id: 12,
  subject: "Issue with invoice",
  description: "..."
}
```

---

## 📋 Quick Testing Checklist

### ✅ **Step-by-Step Testing Order:**

1. ✅ **Login** (सभी roles के साथ)
2. ✅ **Create Company** (SuperAdmin)
3. ✅ **Create Users** (Admin, Client, Employee)
4. ✅ **Create Client** (Admin)
5. ✅ **Create Items** (Admin - Store के लिए)
6. ✅ **Create Project** (Admin - Client के साथ)
7. ✅ **Create Task** (Admin - Project के अंदर)
8. ✅ **Create Order** (Client - Store से checkout)
9. ✅ **Create Invoice** (Admin - Order से)
10. ✅ **Create Payment** (Admin/Client - Invoice के लिए)
11. ✅ **Create Time Log** (Employee - Project पर)
12. ✅ **Check In/Out** (Employee)

---

## 🎯 Recommended First Menu to Test

### **Start with: Companies (SuperAdmin)**

**Why?**
- ✅ सबसे basic data है
- ✅ बिना company के कुछ नहीं कर सकते
- ✅ company_id हर API में required है
- ✅ Simple CRUD operations
- ✅ No dependencies (सबसे पहले create हो सकता है)

**Testing Steps:**
1. Login as SuperAdmin
2. Go to `/app/superadmin/companies`
3. Create a new company
4. Note the `company_id` (जैसे `1`)
5. Use this `company_id` in all future API calls

**Next Menu:** Users (क्योंकि users बिना operations नहीं चलेंगे)

---

## 💡 Pro Tips

1. **Always note IDs** - हर create operation के बाद ID note करें
2. **Use same company_id** - सभी tests में same company_id use करें
3. **Test in order** - Dependencies के अनुसार ही test करें
4. **Check responses** - हर API response check करें
5. **Use browser DevTools** - Network tab में API calls देखें

---

## 🔄 Complete Data Flow

```
SuperAdmin Login
    ↓
Create Company (company_id = 1)
    ↓
Create Users (Admin, Client, Employee)
    ↓
Admin Login
    ↓
Create Client (client_id = 12)
    ↓
Create Items (item_id = 1, 2)
    ↓
Create Project (project_id = 15, client_id = 12)
    ↓
Create Task (project_id = 15)
    ↓
Client Login
    ↓
Browse Store → Add to Cart → Checkout
    ↓
Create Order (order_id = 5, items: [1, 2])
    ↓
Admin → Generate Invoice (invoice_id = 10, order_id = 5)
    ↓
Client → Make Payment (invoice_id = 10)
    ↓
Employee Login
    ↓
Create Task (project_id = 15, assign_to: EMPLOYEE_USER_ID)
    ↓
Employee sees project in "My Projects" (based on task assignment)
    ↓
Log Time (project_id = 15)
    ↓
Check In/Out
```

**Note:** Employee "My Projects" and "Time Tracking" project dropdown show projects where employee has assigned tasks.

---

**Last Updated:** 2025-01-01
**Version:** 1.0.0

