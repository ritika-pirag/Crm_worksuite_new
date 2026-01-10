---
description: Complete CRM UI/UX rebuild following RiceCRM patterns
---

# RiceCRM UI/UX Rebuild Implementation Plan

## Phase 1: Core UI Standardization (Priority: HIGH)
// turbo-all

### 1.1 Establish Design System Updates
- Update CSS variables in `index.css` for consistent spacing and colors
- Create reusable component patterns for box-based layouts
- Standardize modal/popup widths and centering
- Update notification system to use centered modals instead of top alerts

### 1.2 Filter Panel Component
- Create expandable filter panel component
- Support multi-select filters
- Include date range filters
- Employee-based filters
- "Clear All Filters" option

### 1.3 Unique ID System
- Add auto-generated unique IDs for:
  - Leads (e.g., LEAD-001)
  - Clients (e.g., CLT-001)
  - Projects (e.g., PRJ-001)
  - Tasks (e.g., TSK-001)
  - Invoices (e.g., INV-001)

## Phase 2: Leads Module (Priority: HIGH)

### 2.1 Lead View Redesign
- Left panel: Main lead information
- Right panel: Related activities (tasks, notes, follow-ups)
- Rename "Lead Call" → "Follow-ups"
- Show only lead-specific events in calendar
- Make "Add Notes" button prominently visible

### 2.2 Leads Table Enhancement
- Add unique auto-generated Lead ID column
- Add Bulk Update button
- Implement comprehensive filter system:
  - Status filter
  - Source filter
  - Assigned Employee filter
  - Created Date filter
  - Multiple simultaneous filters
- Add "Clear All Filters" option

## Phase 3: Clients Module (Priority: HIGH)

### 3.1 Client List Cleanup
- Remove experimental views
- Maintain ONE clean default view
- Add auto-generated unique Client ID
- Clean, RiceCRM-style layout

### 3.2 Client Detail View
- Projects section
- Tasks section
- Invoices section
- Payments section
- Notes section
- Clear separation between sections

## Phase 4: Projects Module (Priority: HIGH)

### 4.1 Project Creation
- Auto-attach client name when creating project inside client
- Reflect project globally in Projects section
- Increase popup width
- Avoid congested fields

### 4.2 Project Detail View
- Tasks section
- Notes section
- Invoices section
- Status tracking

## Phase 5: Tasks & Recurring Tasks (Priority: HIGH)

### 5.1 Recurring Task Feature
- Add recurring options: Daily / Weekly / Monthly
- Auto-generate future recurring tasks
- Show future tasks immediately

### 5.2 Task Timer Enhancement
- Only assigned users can start/stop timer
- Timer play icon visible in task list
- Timer data reflects in Work/Timesheet

## Phase 6: Finance & Templates (Priority: MEDIUM)

### 6.1 Invoice/Proposal/Contract Templates
- Add Settings for templates
- Simple text editor (Word-like)
- Copy-paste from Word support
- Placeholder text support

## Phase 7: Custom Fields (Priority: MEDIUM)

### 7.1 Custom Fields System
- Allow custom fields for Leads, Clients, Projects
- Options to show in table
- Export with data
- Data-driven architecture

## Phase 8: Integrations (Priority: LOW)

### 8.1 Integration Slots
- Zoho integration slot
- QuickBooks integration slot
- WhatsApp (Official API) integration slot
- API Key based configuration

## Implementation Commands

### Start Development Server
```bash
cd c:\Users\Administrator\Desktop\data\crm-worksuite\crm-worksuite-frontend
npm run dev
```

### Start Backend Server
```bash
cd c:\Users\Administrator\Desktop\data\crm-worksuite\crm-worksuite-backend
npm run dev
```
