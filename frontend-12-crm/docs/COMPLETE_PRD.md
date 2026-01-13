# 📋 Complete Product Requirements Document (PRD)
## Multi-Company SaaS CRM System
### Inspired by RISE CRM + Worksuite CRM + Perfex CRM

**Version:** 1.0  
**Date:** 2024  
**Status:** Ready for Development

---

## 🎯 Executive Summary

This document outlines the complete requirements for building a modern, multi-company SaaS CRM system that combines the best features from RISE CRM, Worksuite CRM, and Perfex CRM. The system will support three user roles (Super Admin, Employee, Client) with a minimalist UI inspired by Monday.com, full PWA support, and comprehensive business management features.

### Key Objectives
- **Multi-Company Management:** Super Admin can manage multiple companies/branches
- **Modern UI/UX:** Clean, minimalist design inspired by Monday.com and RISE CRM
- **PWA Support:** Fully installable, offline-capable Progressive Web App
- **Comprehensive Features:** Leads, Clients, Projects, Tasks, Finance, HR, and more
- **Advanced Functionality:** Custom fields, bulk operations, email templates, integrations

---

## 👥 User Roles & Personas

### 1. Super Admin (Platform Administrator)
**Responsibilities:**
- Manage entire SaaS platform
- Oversee all companies and users
- Configure system settings, licenses, integrations
- Monitor system health and updates

**Key Features:**
- Multi-company dashboard
- Company & package management
- User & role management
- License & security management
- System integrations
- Updates & maintenance

### 2. Employee (Staff Member)
**Responsibilities:**
- Work within assigned company
- Manage leads, clients, projects, tasks
- Handle finance operations (invoices, expenses)
- Collaborate with team members

**Key Features:**
- Personal dashboard
- Projects & tasks management
- Leads & clients management
- Finance operations
- HR & communication tools
- Reports & analytics

### 3. Client (Customer Portal)
**Responsibilities:**
- View invoices and payments
- Manage contracts and proposals
- Submit support tickets
- Access company announcements

**Key Features:**
- Client dashboard
- Invoice management & payment
- Proposal & estimate viewing
- Contract management
- Support tickets
- Profile management

---

## 🎨 UI/UX Design Guidelines

### Design Principles
1. **Minimalist Design**
   - Ample white space
   - Clean lines and modern aesthetic
   - No visual clutter
   - Card-based layouts

2. **Icon-Driven Navigation**
   - Intuitive icons replace lengthy text labels
   - Consistent iconography (Lucide React / Heroicons)
   - Icon-first approach for quick recognition

3. **Color Scheme**
   - Primary: `#217E45` (Green)
   - Secondary: `#76AF88` (Light Green)
   - Background: `#F0F1F1` (Light Gray)
   - Text: `#102D2C` (Dark Teal)
   - Accents: Blue, Orange, Purple for different modules

4. **Typography**
   - Font: Inter / Poppins / Roboto (System Sans-serif)
   - Headings: Bold, clear hierarchy
   - Body: 14-16px for readability

5. **Responsive Design**
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
   - Touch-friendly buttons (min 44x44px)
   - Collapsible sidebar on mobile

6. **Interactions**
   - Smooth transitions (200-300ms)
   - Hover effects on interactive elements
   - Loading states for async operations
   - Success/error feedback (toasts)

---

## 📱 PWA Requirements

### Core PWA Features
1. **Manifest File**
   - App name, icons, theme colors
   - Display mode: standalone
   - Start URL, scope

2. **Service Worker**
   - Offline caching strategy
   - Background sync
   - Push notifications

3. **Offline Functionality**
   - View cached data offline
   - Queue actions for sync
   - Offline indicator

4. **Installation**
   - Install prompt
   - Add to home screen
   - App-like experience

---

## 🏗️ Module Specifications

### 1. Dashboard Module

#### 1.1 Super Admin Dashboard
**Location:** `/app/admin/dashboard`

**Components:**
- **Top Metrics Bar (4 Cards)**
  - Total Companies (with Active/Expired breakdown)
  - Total Revenue (with MoM trend)
  - Outstanding Invoices (total amount)
  - Recent Activity (last 5 entries)

- **Revenue Chart**
  - Last 30 days bar chart
  - Interactive tooltips
  - Export option

- **Quick Actions**
  - Add New Company
  - Manage Companies
  - View Audit Log

- **Recent Activity Log**
  - Last 5-10 activities
  - Filter by type
  - Link to full audit log

**Cursor AI Prompt:**
```
Create a Super Admin Dashboard (React + Tailwind CSS) with:
- 4 metric cards showing: Total Companies (28, with "12 Active • 3 Expired"), Total Revenue ($12,450 with "+12% MoM ▲"), Outstanding Invoices ($3,200, "7 unpaid"), Recent Activity (5, "Last 24 hours")
- Revenue bar chart for last 30 days (use Recharts)
- Quick action buttons: "Add New Company", "Manage Companies", "View Audit Log"
- Recent activity list showing last 5 log entries with timestamps
- Clean, minimalist design with white cards, subtle shadows, rounded corners
- Fully responsive (mobile-first)
- Use icons from react-icons/io5
```

#### 1.2 Employee Dashboard
**Location:** `/app/employee/dashboard`

**Components:**
- **Today's Tasks** (max 5)
  - Checkboxes for completion
  - Priority badges
  - Due times
  - Project association

- **Upcoming Events** (next 3)
  - Title, time, location
  - Quick view calendar

- **Recent Notifications** (3 items)
  - Task assignments
  - Invoice updates
  - Messages

- **Personal Goal Progress**
  - Circular progress indicator
  - Goal label and percentage
  - Progress bar

**Cursor AI Prompt:**
```
Create an Employee Dashboard (React + Tailwind CSS) with:
- Today's Tasks section: List of 5 tasks with checkboxes, priority badges (High/Medium/Low), due times, project names, status badges
- Upcoming Events section: Next 3 events with title, time, location
- Recent Notifications: 3 notification items with message and timestamp
- Personal Goal Progress: Circular progress indicator (75% of Q4 target) with progress bar
- Clean card-based layout, minimalist design
- Fully responsive
```

#### 1.3 Client Dashboard
**Location:** `/app/client/dashboard`

**Components:**
- **Branded Welcome Banner**
  - Client name
  - Company logo placeholder
  - Gradient background

- **Summary Cards (4)**
  - Open Invoices (count + total)
  - Upcoming Payments (count + total)
  - Recent Activity
  - Announcements

- **Quick Actions**
  - Pay Invoice
  - Submit Ticket
  - View Contracts

- **Open Invoices List**
  - Invoice number, amount, due date
  - Status badges
  - Pay Now button

- **Announcements**
  - Company announcements
  - Expandable cards

**Cursor AI Prompt:**
```
Create a Client Dashboard (React + Tailwind CSS) with:
- Branded welcome banner with gradient background (primary-accent to secondary-accent)
- 4 summary cards: Open Invoices, Upcoming Payments, Recent Activity, Announcements
- Quick action buttons: Pay Invoice, Submit Ticket, View Contracts
- Open Invoices list with invoice details, status badges, Pay Now buttons
- Announcements section with expandable cards
- Clean, branded design suitable for customer portal
- Fully responsive
```

---

### 2. Companies Module

#### 2.1 Manage Companies
**Location:** `/app/admin/companies`

**Features:**
- **Table View**
  - Columns: Logo, Company Name, Status, Package, Created Date, Actions
  - Bulk selection checkbox
  - Column visibility toggle
  - Advanced filters (status, package, date range)
  - Search functionality

- **Actions**
  - View Details (eye icon)
  - Edit (pencil icon)
  - Impersonate (swap icon)
  - Delete (trash icon)

- **Add/Edit Modal**
  - Company name, industry, website
  - Address, notes
  - Package assignment
  - Status toggle

**Cursor AI Prompt:**
```
Create a Companies Management page (React + Tailwind CSS) with:
- DataTable component with columns: Logo (initials avatar), Company Name, Status badge (Active/Expired), Package badge with price, Created Date, Actions (View, Impersonate, Edit, Delete)
- Top bar: Search input, Filter button (collapsible panel), Column visibility toggle (gear icon), "Add New Company" button
- Right-side modal for Add/Edit with form fields: Name, Industry, Website, Address, Notes
- Impersonate button opens confirmation dialog
- Bulk actions support (checkbox column)
- Clean table design with hover effects
- Fully responsive
```

#### 2.2 Company Packages
**Location:** `/app/admin/company-packages`

**Features:**
- **Package Cards Overview**
  - Package name, price, billing cycle
  - Feature list (first 3)
  - Status badge
  - Companies assigned count

- **Package Table**
  - Columns: Name, Price, Features, Companies, Status
  - Actions: View, Edit, Delete

- **Add/Edit Modal**
  - Package name, price, billing cycle
  - Max companies, users, storage
  - Features list (add/remove)
  - Active/inactive toggle

**Cursor AI Prompt:**
```
Create a Company Packages page (React + Tailwind CSS) with:
- Package cards grid (3 columns): Each card shows package name, price/billing cycle, first 3 features with checkmark icons, status badge, companies assigned count
- DataTable below with columns: Package Name, Price, Features (badges), Companies assigned, Status
- Right-side modal for Add/Edit: Package name, price, billing cycle dropdown, max companies/users/storage inputs, features list (add/remove with badges), active toggle
- Clean card-based design
- Fully responsive
```

---

### 3. Leads Management Module

#### 3.1 Leads List & Pipeline
**Location:** `/app/admin/leads` & `/app/employee/leads`

**Features:**
- **Kanban Board View**
  - Columns: New → Contacted → Qualified → Proposal Sent → Won / Lost
  - Drag-and-drop cards
  - Card shows: Name, Company, Owner (avatar), Tags, Due Follow-up
  - Add Lead button in first column

- **List View**
  - Table with all lead columns
  - Filters and search
  - Bulk actions

- **Lead Card Actions**
  - Assign to team member
  - Add note
  - Convert to client
  - Send email
  - Create task
  - View history

- **Lead Source Tracking**
  - Source field (Web, Referral, Ad, etc.)
  - Source statistics

**Cursor AI Prompt:**
```
Create a Leads Management page (React + Tailwind CSS) with:
- Kanban board view: 6 columns (New, Contacted, Qualified, Proposal Sent, Won, Lost) with drag-and-drop cards
- Each card shows: Lead name, company, owner avatar, source tags, due follow-up date
- "Add Lead" button in first column
- List view toggle: Table with columns (Name, Company, Source, Status, Owner, Created Date, Actions)
- Lead detail modal: Full lead information, notes, activities, convert to client button
- Bulk email button (when multiple selected)
- Filters: Status, Source, Owner, Date range
- Use react-beautiful-dnd or dnd-kit for drag-and-drop
- Clean, minimalist design
- Fully responsive (mobile: swipe to move cards)
```

#### 3.2 Bulk Email to Leads
**Location:** Modal triggered from Leads table

**Features:**
- **Email Composer**
  - Recipients (auto-filled from selection, editable)
  - Template dropdown (pre-built templates)
  - Rich text editor (formatting, links, images)
  - Attachment upload (drag & drop)
  - Email preview (side-by-side or tabbed)
  - Send button with confirmation

**Cursor AI Prompt:**
```
Create a Bulk Email Composer modal (React + Tailwind CSS) with:
- Recipients input (auto-filled, editable, shows count)
- Template dropdown with pre-built templates
- Rich text editor (use react-quill or similar) with formatting toolbar
- Attachment zone: Drag & drop area + file list with remove buttons
- Email preview toggle: Side-by-side or tabbed view
- Send button: Opens confirmation dialog, shows success message
- Clean modal design with light background
- Fully responsive
```

---

### 4. Clients Management Module

#### 4.1 Clients List
**Location:** `/app/admin/clients` & `/app/employee/clients`

**Features:**
- **Table View**
  - Columns: Logo, Company Name, Contact Person, Email, Phone, Status, Actions
  - Select All checkbox
  - Bulk email button (when multiple selected)
  - Advanced filters
  - Column visibility toggle

- **Client Actions**
  - View Details
  - Edit
  - Send Email
  - Delete
  - View History

- **Multiple Contact Persons**
  - Contact persons list in client detail
  - Add/Edit/Delete contacts
  - Primary contact indicator

**Cursor AI Prompt:**
```
Create a Clients Management page (React + Tailwind CSS) with:
- DataTable with columns: Logo (initials), Company Name, Contact Person, Email, Phone, Status badge, Actions
- "Select All" checkbox in header
- Bulk Email button (appears when multiple selected)
- Filters: Status, Industry, Date added, Custom fields
- Client detail modal: Company info, multiple contact persons list (with add/edit/delete), client history, quick actions
- Email composer: Rich text editor, attachment support, preview
- Clean table design
- Fully responsive
```

#### 4.2 Client Email Composer
**Location:** Modal from Client profile

**Features:**
- **Email Form**
  - To: Client email + all contact emails (checkboxes)
  - CC/BCC fields
  - Subject
  - Rich text editor
  - Attachments
  - Email preview
  - Send/Save Draft buttons

**Cursor AI Prompt:**
```
Create a Client Email Composer modal (React + Tailwind CSS) with:
- To field: Shows client email + all contact emails with checkboxes
- CC/BCC fields (expandable)
- Subject input
- Rich text editor (react-quill) with full formatting toolbar
- Attachment upload: Drag & drop zone + file list
- Email preview toggle: Live preview of formatted email
- Send button: Confirmation + success message
- Save Draft button
- Gmail-style clean design
- Fully responsive
```

---

### 5. Projects & Tasks Module

#### 5.1 Projects List
**Location:** `/app/admin/projects` & `/app/employee/my-projects`

**Features:**
- **Project Cards/Table**
  - Project name, client, status, progress
  - Team members (avatars)
  - Due date, milestones
  - Quick actions

- **Project Views**
  - List view
  - Card view
  - Gantt chart view (optional)

- **Project Detail**
  - Overview tab
  - Tasks tab
  - Files tab
  - Notes tab
  - Time tracking tab
  - Team members tab

**Cursor AI Prompt:**
```
Create a Projects Management page (React + Tailwind CSS) with:
- View toggle: List view / Card view
- List view: Table with columns (Name, Client, Status, Progress bar, Team avatars, Due Date, Actions)
- Card view: Grid of project cards showing name, client, progress bar, status badge, team avatars
- Project detail modal/tabs: Overview, Tasks, Files, Notes, Time Tracking, Team
- Add Project button: Multi-step form
- Filters: Status, Client, Team member, Date range
- Clean, modern design
- Fully responsive
```

#### 5.2 Tasks Management
**Location:** `/app/admin/tasks` & `/app/employee/my-tasks`

**Features:**
- **Task List**
  - Columns: Checkbox, Task Name, Project, Assignee, Priority, Status, Due Date, Actions
  - Filters: Status, Priority, Assignee, Project, Due Date
  - Bulk actions

- **Task Features**
  - Recurring tasks (schedule setup)
  - Time tracking (start/stop timer)
  - Followers (add team members)
  - Comments/Notes
  - Attachments
  - Task dependencies
  - Subtasks

- **Task Views**
  - List view
  - Kanban view (by status)
  - Calendar view

**Cursor AI Prompt:**
```
Create a Tasks Management page (React + Tailwind CSS) with:
- View toggle: List / Kanban / Calendar
- List view: Table with checkbox, Task name, Project, Assignee avatar, Priority badge, Status badge, Due date, Actions
- Task detail modal: Full task info, description, assignee, followers (add/remove), priority, status, due date, recurring settings, time tracker (start/stop), comments section, attachments, dependencies, subtasks
- Add Task button: Form with all fields
- Filters: Status, Priority, Assignee, Project, Due date range
- Bulk actions: Change status, assign, delete
- Clean, task-focused design
- Fully responsive
```

#### 5.3 Milestones
**Location:** `/app/admin/milestones` & `/app/employee/milestones`

**Features:**
- **Milestone List**
  - Milestone name, project, due date, progress
  - Status (Upcoming, In Progress, Completed)
  - Associated tasks count

**Cursor AI Prompt:**
```
Create a Milestones page (React + Tailwind CSS) with:
- Milestone cards/list: Name, project, due date, progress bar, status badge, tasks count
- Add Milestone button: Form with name, project, due date, description
- Filters: Project, Status, Date range
- Clean design
- Fully responsive
```

#### 5.4 Recurring Tasks
**Location:** `/app/admin/recurring-tasks` & `/app/employee/recurring-tasks`

**Features:**
- **Recurring Tasks List**
  - Task template name
  - Recurrence pattern (Daily, Weekly, Monthly, Custom)
  - Next creation date
  - Status (Active/Inactive)

**Cursor AI Prompt:**
```
Create a Recurring Tasks page (React + Tailwind CSS) with:
- Table/list: Task template name, recurrence pattern badge, next creation date, status toggle
- Add Recurring Task button: Form with task details, recurrence pattern selector (Daily/Weekly/Monthly/Custom), start date, end date (optional)
- Edit/Delete actions
- Clean design
- Fully responsive
```

---

### 6. Finance Module

#### 6.1 Invoices
**Location:** `/app/admin/invoices` & `/app/employee/invoices` & `/app/client/invoices`

**Features:**
- **Invoice List**
  - Columns: Invoice #, Client, Amount, Due Date, Status, Actions
  - Status badges: Draft, Sent, Paid, Overdue
  - Filters: Status, Client, Date range
  - Bulk actions

- **Invoice Detail**
  - Invoice items table
  - Tax calculations
  - Totals
  - Payment history
  - Send email button
  - Download PDF button
  - Mark as paid button

- **Create Invoice**
  - Client selection
  - Invoice items (add/remove)
  - Tax settings
  - Payment terms
  - Notes
  - Template selection

- **Recurring Invoices**
  - Setup recurrence pattern
  - Auto-send option

**Cursor AI Prompt:**
```
Create an Invoices Management page (React + Tailwind CSS) with:
- DataTable: Invoice #, Client, Amount, Due Date, Status badge (Draft/Sent/Paid/Overdue), Actions
- Filters: Status, Client, Date range, Amount range
- Add Invoice button: Multi-step form (Client → Items → Tax → Payment Terms → Review)
- Invoice detail modal: Full invoice view with items table, tax breakdown, totals, payment history, Send Email, Download PDF, Mark as Paid buttons
- Recurring Invoices section: List of recurring invoices with pattern, next date, status
- Professional invoice design
- Fully responsive
```

#### 6.2 Estimates & Proposals
**Location:** `/app/admin/estimates` & `/app/employee/estimates` & `/app/client/estimates`

**Features:**
- **Estimates List**
  - Estimate #, Client, Amount, Status, Expiry Date
  - Status: Draft, Sent, Accepted, Declined, Expired
  - Convert to Invoice button

- **Proposals List**
  - Similar to estimates
  - Additional: Proposal template

- **Create Estimate/Proposal**
  - Client selection
  - Items table
  - Terms & conditions
  - Template selection
  - Expiry date
  - Auto-convert to invoice on acceptance

**Cursor AI Prompt:**
```
Create an Estimates & Proposals page (React + Tailwind CSS) with:
- Tabs: Estimates / Proposals
- DataTable: Estimate/Proposal #, Client, Amount, Status badge, Expiry Date, Actions
- Add Estimate/Proposal button: Form similar to invoice creation
- Detail view: Full estimate/proposal with items, terms, Accept/Decline buttons (for clients)
- Convert to Invoice button (for accepted estimates)
- Template selector: Choose from pre-built templates
- Professional design
- Fully responsive
```

#### 6.3 Expenses
**Location:** `/app/admin/expenses` & `/app/employee/expenses`

**Features:**
- **Expenses List**
  - Date, Category, Description, Amount, Client/Project, Status, Actions
  - Filters: Category, Client, Project, Date range
  - Bulk actions

- **Add Expense**
  - Date, Category, Description
  - Amount, Tax
  - Link to Client/Project
  - Receipt upload
  - Recurring option

**Cursor AI Prompt:**
```
Create an Expenses Management page (React + Tailwind CSS) with:
- DataTable: Date, Category badge, Description, Amount, Client/Project link, Status badge, Actions
- Filters: Category, Client, Project, Date range, Status
- Add Expense button: Form with date picker, category dropdown, description, amount, tax, client/project selector, receipt upload, recurring toggle
- Expense detail: Full expense info with receipt preview
- Clean design
- Fully responsive
```

#### 6.4 Contracts
**Location:** `/app/admin/contracts` & `/app/employee/contracts` & `/app/client/contracts`

**Features:**
- **Contracts List**
  - Contract #, Client, Type, Start Date, End Date, Status, Actions
  - Status: Draft, Active, Expiring Soon, Expired
  - Expiry reminders

- **Contract Detail**
  - Full contract text
  - Signatures section
  - Renewal options
  - Download PDF

**Cursor AI Prompt:**
```
Create a Contracts Management page (React + Tailwind CSS) with:
- DataTable: Contract #, Client, Type badge, Start Date, End Date, Status badge (with expiry warnings), Actions
- Filters: Status, Client, Type, Date range
- Add Contract button: Form with client, type, dates, contract text (rich editor), template selector
- Contract detail: Full contract view, signatures section, renewal button, Download PDF, Set Reminder
- Expiry warnings for contracts expiring within 30 days
- Professional design
- Fully responsive
```

---

### 7. Email Templates Module

#### 7.1 Email Templates
**Location:** `/app/admin/email-templates`

**Features:**
- **Templates List**
  - Template name, Type, Subject, Last Modified, Actions
  - Types: Lead, Client, Invoice, Proposal, General

- **Template Editor**
  - Template name, Type
  - Subject line
  - Rich text body editor
  - Merge tags dropdown ({{client.name}}, {{invoice.due_date}}, etc.)
  - Attachment zone
  - Live preview
  - Save/Cancel buttons

**Cursor AI Prompt:**
```
Create an Email Templates Management page (React + Tailwind CSS) with:
- DataTable: Template Name, Type badge, Subject, Last Modified, Actions (Edit, Delete, Duplicate)
- Add Template button: Opens template editor
- Template Editor modal: Name input, Type dropdown, Subject input, Rich text editor with merge tags dropdown ({{client.name}}, {{invoice.amount}}, etc.), Attachment zone, Live preview pane (toggle side-by-side or tabbed), Save/Cancel buttons
- Preview shows formatted email with merge tags replaced
- Clean editor design
- Fully responsive
```

---

### 8. Events & Messages Module

#### 8.1 Events/Calendar
**Location:** `/app/admin/calendar` & `/app/employee/calendar`

**Features:**
- **Calendar View**
  - Month/Week/Day views
  - Event types: Meeting, Call, Reminder
  - Color coding by type
  - Drag to reschedule

- **Event List**
  - Upcoming events
  - Past events
  - Filters

- **Add Event**
  - Title, Type, Date/Time
  - Location/Virtual link
  - Attendees
  - Description
  - Reminder settings
  - Public/Private toggle

**Cursor AI Prompt:**
```
Create an Events/Calendar page (React + Tailwind CSS) with:
- Calendar component (use react-calendar or fullcalendar): Month/Week/Day view toggle
- Events displayed on calendar with color coding by type (Meeting/Call/Reminder)
- Event list sidebar: Upcoming events, Past events
- Add Event button: Form with title, type dropdown, date/time picker, location/virtual link, attendees selector, description, reminder settings, public/private toggle
- Event detail: Full event info, edit/delete buttons
- Drag to reschedule functionality
- Clean calendar design
- Fully responsive
```

#### 8.2 Messages & Notice Board
**Location:** `/app/admin/messages` & `/app/employee/messages`

**Features:**
- **Messages List**
  - Inbox, Sent, Drafts, Archived
  - Unread count badges
  - Search functionality

- **Message Composer**
  - To: User/Team selector
  - Subject
  - Rich text body
  - Attachments
  - Send/Save Draft

- **Notice Board**
  - Company announcements
  - Create/Edit/Delete (admin only)
  - Pinned announcements

**Cursor AI Prompt:**
```
Create a Messages & Notice Board page (React + Tailwind CSS) with:
- Tabs: Messages / Notice Board
- Messages: Inbox list with unread badges, message preview, search
- Message detail: Full conversation view, reply button
- Compose Message: To selector (users/teams), Subject, Rich text editor, Attachments, Send/Save Draft
- Notice Board: List of announcements (pinned at top), Create Announcement button (admin only), announcement cards with title, content, date, edit/delete
- Clean messaging interface
- Fully responsive
```

---

### 9. Tables - Advanced Filters & Column Control

#### 9.1 Reusable Table Component
**Location:** Used across all list pages

**Features:**
- **Column Visibility Toggle**
  - Gear icon dropdown
  - Checkbox list of all columns
  - Save preferences

- **Advanced Filters**
  - Collapsible filter panel
  - Date range picker
  - Status dropdowns
  - Custom field filters
  - Saved filters dropdown
  - Apply/Reset buttons

- **Bulk Actions**
  - Select All checkbox
  - Action dropdown (Delete, Change Status, Assign, etc.)
  - Selected count display

- **Table Features**
  - Sortable columns
  - Sticky header
  - Pagination
  - Search bar
  - Export CSV/Excel

**Cursor AI Prompt:**
```
Create a reusable DataTable component (React + Tailwind CSS) with:
- Sticky header with: Search input, Filter button (opens collapsible panel), Column visibility toggle (gear icon → checkbox list), Export button
- Filter panel: Dynamic fields based on table type, date range picker, status dropdowns, custom field filters, saved filters dropdown, Apply/Reset buttons
- Table: Sortable columns, Select All checkbox, row checkboxes, bulk actions dropdown (appears when rows selected), pagination, responsive horizontal scroll on mobile
- Column visibility: User preferences saved to localStorage
- Clean, professional table design
- Fully responsive
```

---

### 10. Custom Fields Module

#### 10.1 Custom Fields Builder
**Location:** Modal/Page for configuring custom fields

**Features:**
- **Field Configuration**
  - Field Name
  - Field Type (Text, Dropdown, Date, Number, Checkbox, Textarea)
  - Options (for Dropdown)
  - Visibility: Show in Table, Use in Filters
  - Required toggle
  - Default value

- **Field Management**
  - Add/Edit/Delete fields
  - Reorder fields
  - Field groups

- **Apply To**
  - Leads, Clients, Projects, Tasks, Invoices, etc.

**Cursor AI Prompt:**
```
Create a Custom Fields Builder modal/page (React + Tailwind CSS) with:
- Field list: Shows all custom fields with name, type, visibility indicators
- Add Field button: Form with Field Name, Field Type dropdown (Text/Dropdown/Date/Number/Checkbox/Textarea), Options input (for dropdown), Visibility checkboxes (Show in Table, Use in Filters), Required toggle, Default value
- Field preview: Shows how field renders in form/table
- Apply To selector: Checkboxes for Leads, Clients, Projects, Tasks, Invoices, etc.
- Reorder: Drag handles to reorder fields
- Clean form design
- Fully responsive
```

---

### 11. HR & Communication Module

#### 11.1 Personal Todo
**Location:** `/app/employee/personal-todo`

**Features:**
- **Todo List**
  - Add/Edit/Delete todos
  - Checkbox for completion
  - Priority levels
  - Due dates
  - Categories/Tags

**Cursor AI Prompt:**
```
Create a Personal Todo page (React + Tailwind CSS) with:
- Todo list: Checkbox, Todo text, Priority badge, Due date, Category tag, Actions (Edit, Delete)
- Add Todo button: Quick add input or modal form
- Filters: All, Active, Completed, By Priority, By Category
- Clean, simple design
- Fully responsive
```

#### 11.2 Surveys
**Location:** `/app/employee/surveys`

**Features:**
- **Surveys List**
  - Survey name, Status, Due Date, Actions
  - Take Survey button

- **Survey Form**
  - Questions with different types
  - Submit button

**Cursor AI Prompt:**
```
Create a Surveys page (React + Tailwind CSS) with:
- Survey cards/list: Survey name, description, status badge, due date, "Take Survey" button
- Survey form: Questions with different types (Multiple choice, Text, Rating, etc.), Submit button
- Survey results (for admins): View responses, export data
- Clean form design
- Fully responsive
```

#### 11.3 Tickets
**Location:** `/app/admin/tickets` & `/app/employee/tickets` & `/app/client/tickets`

**Features:**
- **Tickets List**
  - Ticket #, Subject, Status, Priority, Assignee, Created Date
  - Status: Open, In Progress, Resolved, Closed
  - Filters

- **Ticket Detail**
  - Full ticket info
  - Comments/Updates
  - Attachments
  - Status change
  - Assign to user

**Cursor AI Prompt:**
```
Create a Tickets Management page (React + Tailwind CSS) with:
- DataTable: Ticket #, Subject, Status badge, Priority badge, Assignee avatar, Created Date, Actions
- Filters: Status, Priority, Assignee, Date range
- Add Ticket button: Form with subject, description, priority, category, attachments
- Ticket detail: Full ticket info, comments section (add comment), attachments, status change dropdown, assign to user dropdown
- Clean ticket system design
- Fully responsive
```

---

### 12. Reports Module

#### 12.1 My Reports (Employee)
**Location:** `/app/employee/my-reports`

**Features:**
- **Report Types**
  - Tasks Completed
  - Hours Logged
  - Sales Made
  - Custom reports

- **Report Generator**
  - Date range selector
  - Metrics selection
  - Chart type selection
  - Export options

**Cursor AI Prompt:**
```
Create a My Reports page (React + Tailwind CSS) with:
- Report type cards: Tasks Completed, Hours Logged, Sales Made, Custom
- Report generator: Date range picker, metrics checkboxes, chart type selector (Bar/Line/Pie), Generate button
- Report display: Chart visualization (use Recharts), data table, Export buttons (PDF/CSV/Excel)
- Report history: List of saved reports
- Clean reporting interface
- Fully responsive
```

#### 12.2 Team Reports (Employee - if permitted)
**Location:** `/app/employee/team-reports`

**Features:**
- Similar to My Reports but for team
- Permission-based access

---

### 13. Settings Module

#### 13.1 My Profile
**Location:** `/app/employee/my-profile` & `/app/client/profile`

**Features:**
- **Profile Form**
  - Personal information
  - Contact details
  - Profile picture upload
  - Change password section

**Cursor AI Prompt:**
```
Create a My Profile page (React + Tailwind CSS) with:
- Profile picture: Upload/change with preview
- Form sections: Personal Info (Name, Email, Phone), Contact Details (Address), Change Password (Current, New, Confirm)
- Save button: Shows success message
- Clean form design
- Fully responsive
```

#### 13.2 Preferences
**Location:** `/app/employee/preferences`

**Features:**
- **Notification Preferences**
  - Email notifications toggle
  - Push notifications toggle
  - Notification types checkboxes

- **Calendar Preferences**
  - Default view
  - Week start day
  - Time zone

- **Template Preferences**
  - Default email template
  - Default invoice template

**Cursor AI Prompt:**
```
Create a Preferences page (React + Tailwind CSS) with:
- Notification Preferences: Toggles for email/push notifications, checkboxes for notification types
- Calendar Preferences: Default view dropdown, week start day, timezone selector
- Template Preferences: Default email template dropdown, default invoice template dropdown
- Save button
- Clean settings design
- Fully responsive
```

#### 13.3 Media Library
**Location:** `/app/employee/media-library`

**Features:**
- **File Browser**
  - Grid/List view
  - File upload (drag & drop)
  - File preview
  - Delete files
  - Folder organization

**Cursor AI Prompt:**
```
Create a Media Library page (React + Tailwind CSS) with:
- View toggle: Grid / List
- File upload: Drag & drop zone, file picker button
- File grid/list: Thumbnails for images, icons for other files, file name, size, date, delete button
- File preview modal: Image preview or download link
- Folder organization: Create folders, move files
- Clean file browser design
- Fully responsive
```

---

## 🔧 Technical Requirements

### Frontend Stack
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** react-icons (io5, fa)
- **Charts:** Recharts
- **Forms:** React Hook Form (optional)
- **Rich Text:** react-quill or similar
- **Drag & Drop:** react-beautiful-dnd or @dnd-kit/core
- **Date Picker:** react-datepicker or similar
- **Tables:** Custom DataTable component

### PWA Requirements
- **Manifest:** `manifest.json` with app details
- **Service Worker:** Workbox for caching
- **Icons:** Multiple sizes (192x192, 512x512)
- **Offline Support:** Cache API responses

### State Management
- **Context API:** For auth and global state
- **Local Storage:** For user preferences
- **React Query (optional):** For server state

### API Integration (Future)
- RESTful API endpoints
- Authentication (JWT)
- File upload endpoints
- Real-time updates (WebSocket)

---

## 📊 Database Schema (Reference)

### Core Tables
- `companies` - Company information
- `users` - User accounts
- `roles` - User roles
- `permissions` - Role permissions
- `leads` - Lead records
- `clients` - Client records
- `projects` - Project records
- `tasks` - Task records
- `invoices` - Invoice records
- `estimates` - Estimate records
- `expenses` - Expense records
- `contracts` - Contract records
- `email_templates` - Email templates
- `custom_fields` - Custom field definitions
- `custom_field_values` - Custom field values
- `events` - Calendar events
- `messages` - Internal messages
- `tickets` - Support tickets
- `audit_logs` - Activity logs

---

## 🚀 Implementation Priority

### Phase 1: Core Foundation
1. ✅ Admin Dashboard
2. ✅ Employee Dashboard
3. ✅ Client Dashboard
4. ✅ Companies Management
5. ✅ Company Packages
6. ✅ License Management

### Phase 2: Core Modules
1. Leads Management (Kanban + List)
2. Clients Management (with bulk email)
3. Projects & Tasks
4. Basic Finance (Invoices, Estimates)

### Phase 3: Advanced Features
1. Custom Fields
2. Email Templates
3. Advanced Filters & Column Control
4. Bulk Operations

### Phase 4: Additional Modules
1. Events & Calendar
2. Messages & Notice Board
3. HR Modules (Surveys, Tickets)
4. Reports

### Phase 5: PWA & Polish
1. PWA Implementation
2. Offline Support
3. Performance Optimization
4. Final Testing

---

## 📝 Cursor AI Usage Guide

### How to Use This PRD with Cursor AI

1. **Copy the specific module's Cursor AI Prompt**
2. **Paste into Cursor AI chat**
3. **Cursor AI will generate the component code**
4. **Review and refine as needed**

### Example Workflow:
```
1. Open Cursor AI
2. Navigate to the module you want to build
3. Copy the "Cursor AI Prompt" section
4. Paste and let Cursor AI generate
5. Review generated code
6. Test and iterate
```

---

## ✅ Success Criteria

### Functional Requirements
- ✅ All three user roles have complete dashboards
- ✅ All modules are fully functional
- ✅ Custom fields work across all modules
- ✅ Bulk operations work correctly
- ✅ Email templates are usable
- ✅ PWA is installable and works offline

### Non-Functional Requirements
- ✅ Responsive on all devices
- ✅ Fast load times (< 3s initial load)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Cross-browser compatible
- ✅ SEO-friendly (for marketing pages)

---

## 📞 Support & Documentation

### Additional Resources Needed
- API Documentation
- User Guides (per role)
- Admin Guide
- Developer Documentation
- Video Tutorials (optional)

---

**End of PRD Document**

*This PRD is a living document and should be updated as requirements evolve.*

