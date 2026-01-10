# 🚀 Cursor AI Prompts - Quick Reference Guide

This document contains ready-to-use Cursor AI prompts for each module. Simply copy and paste into Cursor AI to generate the UI components.

---

## 📋 Table of Contents

1. [Dashboards](#dashboards)
2. [Companies Module](#companies-module)
3. [Leads Management](#leads-management)
4. [Clients Management](#clients-management)
5. [Projects & Tasks](#projects--tasks)
6. [Finance Module](#finance-module)
7. [Email Templates](#email-templates)
8. [Events & Messages](#events--messages)
9. [Custom Fields](#custom-fields)
10. [HR & Communication](#hr--communication)
11. [Reports](#reports)
12. [Settings](#settings)

---

## 🏠 Dashboards

### Super Admin Dashboard

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

### Employee Dashboard

```
Create an Employee Dashboard (React + Tailwind CSS) with:
- Today's Tasks section: List of 5 tasks with checkboxes, priority badges (High/Medium/Low), due times, project names, status badges
- Upcoming Events section: Next 3 events with title, time, location
- Recent Notifications: 3 notification items with message and timestamp
- Personal Goal Progress: Circular progress indicator (75% of Q4 target) with progress bar
- Clean card-based layout, minimalist design
- Fully responsive
```

### Client Dashboard

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

## 🏢 Companies Module

### Manage Companies

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

### Company Packages

```
Create a Company Packages page (React + Tailwind CSS) with:
- Package cards grid (3 columns): Each card shows package name, price/billing cycle, first 3 features with checkmark icons, status badge, companies assigned count
- DataTable below with columns: Package Name, Price, Features (badges), Companies assigned, Status
- Right-side modal for Add/Edit: Package name, price, billing cycle dropdown, max companies/users/storage inputs, features list (add/remove with badges), active toggle
- Clean card-based design
- Fully responsive
```

---

## 📊 Leads Management

### Leads Kanban & List

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

### Bulk Email to Leads

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

## 👥 Clients Management

### Clients List

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

### Client Email Composer

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

## 📁 Projects & Tasks

### Projects List

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

### Tasks Management

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

---

## 💰 Finance Module

### Invoices

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

### Estimates & Proposals

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

### Expenses

```
Create an Expenses Management page (React + Tailwind CSS) with:
- DataTable: Date, Category badge, Description, Amount, Client/Project link, Status badge, Actions
- Filters: Category, Client, Project, Date range, Status
- Add Expense button: Form with date picker, category dropdown, description, amount, tax, client/project selector, receipt upload, recurring toggle
- Expense detail: Full expense info with receipt preview
- Clean design
- Fully responsive
```

---

## 📧 Email Templates

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

## 📅 Events & Messages

### Calendar/Events

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

### Messages & Notice Board

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

## 🧩 Custom Fields

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

## 🎯 HR & Communication

### Personal Todo

```
Create a Personal Todo page (React + Tailwind CSS) with:
- Todo list: Checkbox, Todo text, Priority badge, Due date, Category tag, Actions (Edit, Delete)
- Add Todo button: Quick add input or modal form
- Filters: All, Active, Completed, By Priority, By Category
- Clean, simple design
- Fully responsive
```

### Tickets

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

## 📊 Reports

```
Create a My Reports page (React + Tailwind CSS) with:
- Report type cards: Tasks Completed, Hours Logged, Sales Made, Custom
- Report generator: Date range picker, metrics checkboxes, chart type selector (Bar/Line/Pie), Generate button
- Report display: Chart visualization (use Recharts), data table, Export buttons (PDF/CSV/Excel)
- Report history: List of saved reports
- Clean reporting interface
- Fully responsive
```

---

## ⚙️ Settings

### My Profile

```
Create a My Profile page (React + Tailwind CSS) with:
- Profile picture: Upload/change with preview
- Form sections: Personal Info (Name, Email, Phone), Contact Details (Address), Change Password (Current, New, Confirm)
- Save button: Shows success message
- Clean form design
- Fully responsive
```

### Preferences

```
Create a Preferences page (React + Tailwind CSS) with:
- Notification Preferences: Toggles for email/push notifications, checkboxes for notification types
- Calendar Preferences: Default view dropdown, week start day, timezone selector
- Template Preferences: Default email template dropdown, default invoice template dropdown
- Save button
- Clean settings design
- Fully responsive
```

### Media Library

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

## 🔧 Reusable Components

### Advanced DataTable

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

## 📝 Usage Instructions

1. **Copy the prompt** for the module you want to build
2. **Paste into Cursor AI** chat
3. **Let Cursor AI generate** the component
4. **Review and refine** as needed
5. **Test the component** in your application

---

**Note:** All prompts assume you're using:
- React 18+
- Tailwind CSS
- react-icons/io5 for icons
- Recharts for charts
- Modern React patterns (hooks, functional components)

---

**Happy Coding! 🚀**

