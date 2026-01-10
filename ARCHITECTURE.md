# 🏗️ CRM WORKSUITE - ARCHITECTURE DOCUMENTATION
## Complete System Architecture, Flow Patterns, and Design Principles

**Document Version:** 1.0.0
**Last Updated:** January 3, 2026
**Purpose:** AI Brain File for Understanding Project Architecture

---

## 📋 TABLE OF CONTENTS

1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Architecture](#database-architecture)
5. [Authentication Logic](#authentication-logic)
6. [Authorization & Role-Based Access](#authorization--role-based-access)
7. [API Patterns & Conventions](#api-patterns--conventions)
8. [Request-Response Flow](#request-response-flow)
9. [Data Flow Patterns](#data-flow-patterns)
10. [Multi-Tenant Architecture](#multi-tenant-architecture)
11. [File Upload Architecture](#file-upload-architecture)
12. [Settings System Architecture](#settings-system-architecture)
13. [Security Architecture](#security-architecture)
14. [Error Handling Pattern](#error-handling-pattern)
15. [State Management Pattern](#state-management-pattern)
16. [Design Patterns Used](#design-patterns-used)
17. [Coding Conventions](#coding-conventions)
18. [Architecture Best Practices](#architecture-best-practices)

---

## 🎯 SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  (Web Browser - Chrome, Firefox, Safari, Edge)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS (Port 443) / HTTP (Port 80)
                           │ REST API Calls
                           │ JWT Token in Authorization Header
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     FRONTEND LAYER                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  React SPA (Single Page Application)                   │   │
│  │  - Vite Build Tool                                     │   │
│  │  - React Router (Client-side routing)                  │   │
│  │  - TailwindCSS (Styling)                              │   │
│  │  - Axios (HTTP Client)                                 │   │
│  │  - Context API (State Management)                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Responsibilities:                                              │
│  - UI Rendering                                                 │
│  - User Input Handling                                          │
│  - Client-side Validation                                       │
│  - State Management                                             │
│  - API Communication                                            │
│  - Token Storage (localStorage)                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP REST API
                           │ JSON Payload
                           │ Authorization: Bearer <JWT>
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND LAYER                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Node.js + Express Server                              │   │
│  │  - RESTful API Endpoints                               │   │
│  │  - JWT Authentication                                   │   │
│  │  - Role-based Authorization                            │   │
│  │  - Business Logic                                       │   │
│  │  - Data Validation                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Components:                                                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Routes    │→ │ Middleware   │→ │ Controllers  │         │
│  └─────────────┘  └──────────────┘  └──────┬───────┘         │
│                                              │                  │
│  ┌─────────────┐  ┌──────────────┐         │                  │
│  │  Services   │← │  Validators  │←────────┘                  │
│  └─────────────┘  └──────────────┘                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ MySQL Connection Pool
                           │ Parameterized Queries
                           │ Transaction Support
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     DATABASE LAYER                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  MySQL 8.0+ (Relational Database)                      │   │
│  │  - 50+ Tables                                           │   │
│  │  - Foreign Key Constraints                             │   │
│  │  - Indexes for Performance                             │   │
│  │  - Multi-tenant Design (company_id)                    │   │
│  │  - ACID Compliance                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Storage:                                                       │
│  - User Data                                                    │
│  - Business Data (Clients, Projects, Invoices)                 │
│  - Settings & Configuration                                     │
│  - File Metadata (actual files in /uploads)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### Technology Stack Diagram

```
Frontend Stack               Backend Stack               Database Stack
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│   React 18   │            │  Node.js 18+ │            │  MySQL 8.0+  │
└──────┬───────┘            └──────┬───────┘            └──────┬───────┘
       │                           │                           │
┌──────▼───────┐            ┌──────▼───────┐            ┌──────▼───────┐
│  Vite 5.x    │            │ Express 4.x  │            │   InnoDB     │
└──────┬───────┘            └──────┬───────┘            └──────┬───────┘
       │                           │                           │
┌──────▼───────┐            ┌──────▼───────┐            ┌──────▼───────┐
│ TailwindCSS  │            │   JWT 9.x    │            │ Foreign Keys │
└──────┬───────┘            └──────┬───────┘            └──────┬───────┘
       │                           │                           │
┌──────▼───────┐            ┌──────▼───────┐            ┌──────▼───────┐
│ React Router │            │  bcrypt 5.x  │            │   Indexes    │
└──────┬───────┘            └──────┬───────┘            └──────────────┘
       │                           │
┌──────▼───────┐            ┌──────▼───────┐
│   Axios 1.x  │            │  Multer 1.x  │
└──────┬───────┘            └──────────────┘
       │
┌──────▼───────┐
│  Recharts    │
└──────────────┘
```

---

## 🎨 FRONTEND ARCHITECTURE

### Component Hierarchy

```
App.jsx (Root)
├── ThemeProvider (Context)
│   └── AuthProvider (Context)
│       └── BrowserRouter
│           └── AppRoutes
│               ├── Public Routes
│               │   ├── WebsiteLayout
│               │   │   ├── WebsiteHeader
│               │   │   ├── Page Content
│               │   │   └── WebsiteFooter
│               │   └── AuthLayout
│               │       └── Auth Pages (Login, Signup, etc.)
│               │
│               └── Protected Routes
│                   └── AppLayout
│                       ├── TopBar (Header)
│                       │   ├── Logo
│                       │   ├── NotificationDropdown
│                       │   ├── MessagesPanel
│                       │   └── ProfileDropdown
│                       ├── Sidebar (Navigation)
│                       │   └── Menu Items (Role-based)
│                       └── Main Content (Outlet)
│                           └── Dashboard Pages
│                               ├── Admin Pages (60+)
│                               ├── Employee Pages (12)
│                               ├── Client Pages (18)
│                               └── SuperAdmin Pages (10)
```

---

### Frontend Directory Structure & Responsibilities

```
src/
├── main.jsx                    # Entry point, renders App
├── App.jsx                     # Root component, providers
├── index.css                   # Global styles, Tailwind imports
│
├── routes/
│   └── AppRoutes.jsx          # All route definitions
│       - Public routes (/, /pricing, /contact)
│       - Auth routes (/login, /signup)
│       - Protected routes (/app/*)
│       - Role-based redirects
│
├── layouts/                    # Page layouts
│   ├── WebsiteLayout.jsx      # For public pages
│   ├── AuthLayout.jsx         # For login/signup
│   └── AppLayout.jsx          # For dashboard pages
│
├── context/                    # React Context (Global State)
│   ├── AuthContext.jsx        # User auth state, login/logout
│   └── ThemeContext.jsx       # Theme settings (light/dark, colors)
│
├── api/                        # API Service Layer
│   ├── index.js               # Centralized exports
│   ├── axiosInstance.js       # Axios config, interceptors
│   ├── baseUrl.js             # API base URL
│   ├── auth.js                # Auth APIs
│   ├── dashboard.js           # Dashboard APIs
│   ├── leads.js               # Leads APIs
│   ├── clients.js             # Clients APIs
│   ├── projects.js            # Projects APIs
│   └── ... (40+ API modules)
│
├── app/                        # Dashboard Pages
│   ├── admin/                 # Admin role pages
│   │   └── pages/             # 60+ page components
│   ├── employee/              # Employee role pages
│   │   └── pages/             # 12 page components
│   ├── client/                # Client role pages
│   │   └── pages/             # 18 page components
│   └── superadmin/            # SuperAdmin role pages
│       └── pages/             # 10 page components
│
├── website/                    # Public Website
│   ├── pages/                 # Landing pages
│   └── components/            # Website-specific components
│
├── auth/                       # Authentication Pages
│   └── pages/
│       ├── LoginPage.jsx
│       ├── SignupPage.jsx
│       ├── ForgotPasswordPage.jsx
│       └── ResetPasswordPage.jsx
│
├── components/                 # Reusable Components
│   ├── ui/                    # UI Components
│   │   ├── Modal.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── DataTable.jsx
│   │   └── ...
│   ├── layout/                # Layout Components
│   │   ├── TopBar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── NotificationDropdown.jsx
│   │   └── MessagesPanel.jsx
│   └── charts/                # Chart Components
│       ├── BarChart.jsx
│       ├── DonutChart.jsx
│       └── LineChart.jsx
│
├── config/                     # Configuration Files
│   ├── adminSidebarData.jsx   # Admin menu items
│   ├── employeeSidebarData.jsx
│   ├── clientSidebarData.jsx
│   └── superAdminSidebarData.jsx
│
└── assets/                     # Static Assets
    ├── images/
    └── fonts/
```

---

### Frontend Component Pattern

**Example: Standard Page Component**

```jsx
// src/app/admin/pages/Clients.jsx

import { useState, useEffect } from 'react';
import { clientsAPI } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const Clients = () => {
  // 1. STATE MANAGEMENT
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // 2. CONTEXT
  const { user } = useAuth();

  // 3. DATA FETCHING
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAll();
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // 4. EVENT HANDLERS
  const handleAdd = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (selectedClient) {
        await clientsAPI.update(selectedClient.id, data);
      } else {
        await clientsAPI.create(data);
      }
      fetchClients();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  // 5. RENDER
  return (
    <div>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Clients</h1>
          <Button onClick={handleAdd}>Add Client</Button>
        </div>

        <DataTable
          data={clients}
          loading={loading}
          onEdit={handleEdit}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? 'Edit Client' : 'Add Client'}
      >
        {/* Form content */}
      </Modal>
    </div>
  );
};

export default Clients;
```

**Pattern Rules:**
1. **State first** - All useState at top
2. **Context second** - useAuth, useTheme, etc.
3. **Effects third** - useEffect for data fetching
4. **Handlers fourth** - All event handlers
5. **Render last** - JSX return statement

---

### Frontend API Call Pattern

```javascript
// src/api/clients.js

import axiosInstance from './axiosInstance';

export const clientsAPI = {
  // GET all clients
  getAll: (params) =>
    axiosInstance.get('/clients', { params }),

  // GET single client
  getById: (id) =>
    axiosInstance.get(`/clients/${id}`),

  // POST create client
  create: (data) =>
    axiosInstance.post('/clients', data),

  // PUT update client
  update: (id, data) =>
    axiosInstance.put(`/clients/${id}`, data),

  // DELETE client
  delete: (id) =>
    axiosInstance.delete(`/clients/${id}`),
};
```

**Pattern Rules:**
1. One file per resource (clients.js, projects.js, etc.)
2. Export object with CRUD methods
3. Use axiosInstance (not raw axios)
4. Method names: getAll, getById, create, update, delete
5. Parameters: (id, data, params)

---

## ⚙️ BACKEND ARCHITECTURE

### Backend Layer Diagram

```
Request Flow (Top to Bottom)
┌─────────────────────────────────────────────────────────┐
│                    HTTP REQUEST                         │
│  POST /api/v1/clients                                   │
│  Headers: { Authorization: Bearer <JWT> }               │
│  Body: { name, email, phone }                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    ROUTES LAYER                         │
│  routes/clientRoutes.js                                 │
│  - Define endpoint paths                                │
│  - Attach middleware                                    │
│  - Map to controller functions                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                       │
│  1. authenticate (verify JWT)                           │
│  2. authorize (check role)                              │
│  3. validate (check input)                              │
│  4. checkModuleAccess (if module enabled)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 CONTROLLERS LAYER                       │
│  controllers/clientController.js                        │
│  - Extract request data                                 │
│  - Call service layer (if exists)                       │
│  - Handle business logic                                │
│  - Return response                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                         │
│  services/clientService.js (optional)                   │
│  - Reusable business logic                              │
│  - Complex operations                                   │
│  - Data transformations                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                         │
│  config/db.js (MySQL connection pool)                   │
│  - Execute SQL queries                                  │
│  - Parameterized queries (SQL injection prevention)     │
│  - Transaction support                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    HTTP RESPONSE                        │
│  Status: 200 OK                                         │
│  Body: { success: true, data: {...} }                  │
└─────────────────────────────────────────────────────────┘
```

---

### Backend Directory Structure

```
crm-worksuite-backend/
├── server.js                   # Express server entry point
│   - Initialize Express app
│   - Apply middleware (cors, bodyParser, etc.)
│   - Mount routes
│   - Start server
│   - Error handling
│
├── config/
│   └── db.js                  # Database connection
│       - MySQL connection pool
│       - Auto-migrations (on startup)
│       - Connection testing
│
├── routes/                     # Route definitions (40+ files)
│   ├── authRoutes.js          # /api/v1/auth
│   ├── clientRoutes.js        # /api/v1/clients
│   ├── projectRoutes.js       # /api/v1/projects
│   ├── invoiceRoutes.js       # /api/v1/invoices
│   └── ...                    # (40+ route files)
│
├── controllers/                # Business logic (40+ files)
│   ├── authController.js      # Login, logout, profile
│   ├── clientController.js    # CRUD for clients
│   ├── projectController.js   # CRUD for projects
│   └── ...
│
├── middleware/                 # Middleware functions
│   ├── auth.js                # authenticate, authorize, optionalAuth
│   ├── checkModuleAccess.js   # Module access control
│   ├── upload.js              # File upload (Multer)
│   └── attachCompanyId.js     # Attach company_id to request
│
├── services/                   # Service layer (business logic)
│   └── settingsService.js     # Settings management logic
│
├── utils/                      # Utility functions
│   └── settingsValidator.js   # Settings validation
│
├── migrations/                 # Database migrations
│   └── 20260103_add_default_settings.js
│
├── uploads/                    # File storage
│   └── (uploaded files)
│
├── .env                        # Environment variables
├── package.json                # Dependencies
└── schema.sql                  # Database schema
```

---

### Backend Route Pattern

```javascript
// routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');
const { checkModuleAccess } = require('../middleware/checkModuleAccess');

// Pattern: HTTP Method + Path + Middleware + Controller

// GET all clients
router.get('/',
  authenticate,                      // 1. Check JWT token
  authorize('ADMIN', 'EMPLOYEE'),    // 2. Check role
  checkModuleAccess('clients'),      // 3. Check module enabled
  clientController.getAll            // 4. Execute controller
);

// GET single client
router.get('/:id',
  authenticate,
  authorize('ADMIN', 'EMPLOYEE'),
  checkModuleAccess('clients'),
  clientController.getById
);

// POST create client
router.post('/',
  authenticate,
  authorize('ADMIN'),                // Only admin can create
  checkModuleAccess('clients'),
  clientController.create
);

// PUT update client
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  checkModuleAccess('clients'),
  clientController.update
);

// DELETE client
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  checkModuleAccess('clients'),
  clientController.delete
);

module.exports = router;
```

**Pattern Rules:**
1. **Middleware order matters**: authenticate → authorize → checkModule → controller
2. **All protected routes** need `authenticate`
3. **Role-specific routes** need `authorize(...roles)`
4. **Module-based routes** need `checkModuleAccess(moduleName)`
5. **RESTful naming**: GET /, GET /:id, POST /, PUT /:id, DELETE /:id

---

### Backend Controller Pattern

```javascript
// controllers/clientController.js

const pool = require('../config/db');

/**
 * Get all clients
 * GET /api/v1/clients
 */
const getAll = async (req, res) => {
  try {
    // 1. Extract company_id from authenticated user
    const companyId = req.user.company_id;

    // 2. Query database (with company_id filter for multi-tenancy)
    const [clients] = await pool.execute(
      'SELECT * FROM clients WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );

    // 3. Return response
    res.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    // 4. Error handling
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch clients'
    });
  }
};

/**
 * Get single client
 * GET /api/v1/clients/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const [clients] = await pool.execute(
      'SELECT * FROM clients WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: clients[0]
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch client'
    });
  }
};

/**
 * Create client
 * POST /api/v1/clients
 */
const create = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const companyId = req.user.company_id;

    // Input validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Insert into database
    const [result] = await pool.execute(
      'INSERT INTO clients (company_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [companyId, name, email, phone, address]
    );

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        phone,
        address
      }
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create client'
    });
  }
};

/**
 * Update client
 * PUT /api/v1/clients/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const companyId = req.user.company_id;

    // Update database
    const [result] = await pool.execute(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ? AND company_id = ?',
      [name, email, phone, address, id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update client'
    });
  }
};

/**
 * Delete client
 * DELETE /api/v1/clients/:id
 */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const [result] = await pool.execute(
      'DELETE FROM clients WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete client'
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteClient
};
```

**Controller Pattern Rules:**
1. **Extract company_id** from `req.user.company_id` (set by auth middleware)
2. **Always filter by company_id** in queries (multi-tenancy)
3. **Validate input** before database operations
4. **Use parameterized queries** (prevents SQL injection)
5. **Consistent response format**: `{ success, data/error, message }`
6. **Try-catch** around all async operations
7. **Log errors** for debugging
8. **Return appropriate HTTP status codes** (200, 201, 400, 404, 500)

---

## 💾 DATABASE ARCHITECTURE

### Database Design Principles

```
1. Multi-Tenant Design
   - ALL tables (except users, companies) have company_id
   - All queries MUST filter by company_id
   - Data isolation between companies

2. Normalization
   - 3NF (Third Normal Form)
   - No redundant data
   - Use foreign keys for relationships

3. Indexing Strategy
   - Primary key (id) on all tables
   - Index on company_id (all tables)
   - Index on foreign keys
   - Composite indexes for common queries

4. Data Integrity
   - NOT NULL constraints on required fields
   - FOREIGN KEY constraints with CASCADE
   - UNIQUE constraints where needed
   - CHECK constraints for validation

5. Audit Trail
   - created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   - updated_at (TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
   - Optional: deleted_at for soft deletes
```

---

### Entity Relationship Diagram (Simplified)

```
┌─────────────┐
│  companies  │
└──────┬──────┘
       │ 1
       │
       │ many
       ├────────────────────────────────────────┐
       │                                        │
       ▼                                        ▼
┌─────────────┐                         ┌─────────────┐
│    users    │                         │   clients   │
└──────┬──────┘                         └──────┬──────┘
       │ 1                                     │ 1
       │                                        │
       │ many                                   │ many
       ▼                                        ├──────────┐
┌─────────────┐                                ▼          ▼
│    tasks    │                         ┌──────────┐ ┌──────────┐
│ (assigned)  │                         │ projects │ │ invoices │
└─────────────┘                         └────┬─────┘ └──────────┘
                                             │ 1
                                             │
                                             │ many
                                             ▼
                                      ┌─────────────┐
                                      │    tasks    │
                                      └─────────────┘
```

**Key Relationships:**
- Company → Users (1:many)
- Company → Clients (1:many)
- Company → Projects (1:many)
- Client → Projects (1:many)
- Client → Invoices (1:many)
- Project → Tasks (1:many)
- User → Tasks assigned (1:many)

---

### Database Table Pattern

```sql
-- Standard table structure

CREATE TABLE `clients` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,             -- Multi-tenancy
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_company_id` (`company_id`),          -- Performance
  INDEX `idx_email` (`email`)                     -- Common search
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Table Pattern Rules:**
1. **Auto-increment INT UNSIGNED** for `id`
2. **company_id INT UNSIGNED NOT NULL** (except companies, users tables)
3. **Foreign key to companies table** with CASCADE delete
4. **Index on company_id** for query performance
5. **created_at, updated_at** timestamps
6. **ENGINE=InnoDB** for transaction support
7. **CHARSET=utf8mb4** for full Unicode support

---

## 🔐 AUTHENTICATION LOGIC

### Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     USER LOGIN FLOW                          │
└──────────────────────────────────────────────────────────────┘

1. User enters email and password
   │
   ▼
┌─────────────────────────────────────┐
│  Frontend: LoginPage.jsx            │
│  POST /api/v1/auth/login            │
│  Body: {                            │
│    email: "admin@example.com",      │
│    password: "password123",         │
│    role: "ADMIN"                    │
│  }                                  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Backend: authController.login()    │
│  1. Find user by email              │
│  2. Check if user exists            │
│  3. Verify role matches             │
│  4. Compare password (bcrypt)       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Generate JWT Token                 │
│  Payload: {                         │
│    id: 1,                           │
│    email: "admin@example.com",      │
│    role: "ADMIN",                   │
│    company_id: 1                    │
│  }                                  │
│  Secret: process.env.JWT_SECRET     │
│  Expires: 24h                       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Return Response                    │
│  {                                  │
│    success: true,                   │
│    token: "eyJhbGc...",            │
│    user: {                          │
│      id, name, email, role,         │
│      company_id                     │
│    }                                │
│  }                                  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Frontend: AuthContext              │
│  1. Store token in localStorage     │
│  2. Store user data in localStorage │
│  3. Update auth state               │
│  4. Redirect to dashboard           │
└─────────────────────────────────────┘
```

---

### Authentication Implementation

**Backend: JWT Token Generation**

```javascript
// controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = users[0];

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Return token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};
```

**Middleware: JWT Verification**

```javascript
// middleware/auth.js

const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      company_id: decoded.company_id
    };

    // 4. Continue to next middleware/controller
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = { authenticate };
```

**Frontend: Token Storage & Usage**

```javascript
// context/AuthContext.jsx

import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await authAPI.login(email, password, role);

      if (response.data.success) {
        const { token, user } = response.data;

        // Store in state
        setToken(token);
        setUser(user);

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Axios Interceptor: Auto-attach Token**

```javascript
// api/axiosInstance.js

import axios from 'axios';
import baseUrl from './baseUrl';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add company_id for non-superadmin users
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'SUPERADMIN' && user.company_id) {
      config.params = {
        ...config.params,
        company_id: user.company_id
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 🛡️ AUTHORIZATION & ROLE-BASED ACCESS

### Role Hierarchy

```
SUPERADMIN (Highest Access)
    │
    ├── Access: ALL companies, ALL data
    ├── Cannot: Perform company-level operations (that's Admin)
    │
    ▼
ADMIN (Company-level Full Access)
    │
    ├── Access: Own company data only
    ├── Can: Manage employees, clients, projects, finances
    ├── Cannot: Access other companies
    │
    ▼
EMPLOYEE (Limited Access)
    │
    ├── Access: Assigned tasks, projects
    ├── Can: View/update own work, submit leave, clock in/out
    ├── Cannot: View other employees' data, financials, settings
    │
    ▼
CLIENT (External Access)
    │
    ├── Access: Own projects, invoices, files
    ├── Can: View invoices, make payments, create tickets
    ├── Cannot: See internal operations, other clients
```

---

### Authorization Middleware

```javascript
// middleware/auth.js

/**
 * Check if user has required role
 * Usage: authorize('ADMIN', 'SUPERADMIN')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
```

**Usage in Routes:**

```javascript
// routes/clientRoutes.js

// Only ADMIN can create clients
router.post('/',
  authenticate,
  authorize('ADMIN'),
  clientController.create
);

// ADMIN and EMPLOYEE can view clients
router.get('/',
  authenticate,
  authorize('ADMIN', 'EMPLOYEE'),
  clientController.getAll
);

// Only SUPERADMIN can access
router.get('/all-companies',
  authenticate,
  authorize('SUPERADMIN'),
  clientController.getAllAcrossCompanies
);
```

---

### Role-Based UI Rendering

**Frontend: Protected Routes**

```jsx
// routes/AppRoutes.jsx

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Usage
<Route path="/app/admin/*" element={
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

<Route path="/app/employee/*" element={
  <ProtectedRoute allowedRoles={['EMPLOYEE']}>
    <EmployeeDashboard />
  </ProtectedRoute>
} />
```

**Role-based Menu Items**

```jsx
// components/layout/Sidebar.jsx

const Sidebar = () => {
  const { user } = useAuth();

  // Load menu based on role
  const getMenuItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return adminSidebarData;
      case 'EMPLOYEE':
        return employeeSidebarData;
      case 'CLIENT':
        return clientSidebarData;
      case 'SUPERADMIN':
        return superAdminSidebarData;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
};
```

---

## 🔌 API PATTERNS & CONVENTIONS

### REST API Naming Conventions

```
Resource: clients

GET    /api/v1/clients           - Get all clients (list)
GET    /api/v1/clients/:id       - Get single client (detail)
POST   /api/v1/clients           - Create new client
PUT    /api/v1/clients/:id       - Update client (full update)
PATCH  /api/v1/clients/:id       - Update client (partial update)
DELETE /api/v1/clients/:id       - Delete client

Sub-resources:
GET    /api/v1/clients/:id/contacts       - Get client's contacts
POST   /api/v1/clients/:id/contacts       - Add contact to client
DELETE /api/v1/clients/:id/contacts/:cid  - Remove contact

Actions (non-CRUD):
POST   /api/v1/invoices/:id/send          - Send invoice via email
POST   /api/v1/invoices/:id/mark-paid     - Mark invoice as paid
POST   /api/v1/leads/:id/convert          - Convert lead to client
```

**Rules:**
1. Use plural nouns for resources (`/clients`, not `/client`)
2. Use `:id` for resource identifier
3. Sub-resources after parent ID
4. Actions use POST with descriptive path
5. Version API (`/api/v1/`)

---

### Request/Response Format

**Request Body (POST/PUT):**

```json
{
  "name": "Acme Corp",
  "email": "info@acme.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

**Success Response (200/201):**

```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": 123,
    "name": "Acme Corp",
    "email": "info@acme.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "Email is required",
    "Phone must be valid"
  ]
}
```

**List Response:**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Client 1" },
    { "id": 2, "name": "Client 2" }
  ],
  "count": 2,
  "page": 1,
  "totalPages": 5
}
```

**Pattern Rules:**
1. **Always** include `success` boolean
2. **Success** responses have `data` field
3. **Error** responses have `error` field (string) or `errors` field (array)
4. **List** responses include `count` and pagination info
5. **Consistent** field names (snake_case in DB, camelCase in frontend)

---

### HTTP Status Codes

```
200 OK               - Successful GET, PUT, PATCH, DELETE
201 Created          - Successful POST (resource created)
204 No Content       - Successful DELETE (no body)

400 Bad Request      - Validation error, malformed request
401 Unauthorized     - Missing/invalid token
403 Forbidden        - Valid token but insufficient permissions
404 Not Found        - Resource doesn't exist
409 Conflict         - Duplicate resource (e.g., email exists)

500 Internal Server Error - Unexpected server error
503 Service Unavailable   - Database down, maintenance
```

---

## 🔄 REQUEST-RESPONSE FLOW

### Complete Flow: Creating an Invoice

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: USER ACTION (Frontend)                              │
└──────────────────────────────────────────────────────────────┘

User clicks "Create Invoice" button
   │
   ▼
Fills form: Client, Items, Tax, Discount
   │
   ▼
Clicks "Save" button
   │
   ▼
handleSubmit() function called

┌──────────────────────────────────────────────────────────────┐
│  STEP 2: API CALL (Frontend)                                 │
└──────────────────────────────────────────────────────────────┘

const response = await invoicesAPI.create({
  client_id: 5,
  items: [
    { description: 'Web Development', qty: 10, rate: 100 },
    { description: 'SEO Services', qty: 5, rate: 50 }
  ],
  tax: 18,
  discount: 50
});

   │
   ▼
axiosInstance.post('/invoices', data)
   │
   ▼
Request Interceptor adds:
- Authorization: Bearer eyJhbGc...
- company_id: 1 (from user data)

┌──────────────────────────────────────────────────────────────┐
│  STEP 3: HTTP REQUEST                                        │
└──────────────────────────────────────────────────────────────┘

POST http://localhost:5000/api/v1/invoices
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
Body:
  {
    "client_id": 5,
    "items": [...],
    "tax": 18,
    "discount": 50
  }
Query Params:
  company_id=1

┌──────────────────────────────────────────────────────────────┐
│  STEP 4: EXPRESS ROUTING                                     │
└──────────────────────────────────────────────────────────────┘

server.js receives request
   │
   ▼
Matches route: POST /api/v1/invoices
   │
   ▼
routes/invoiceRoutes.js
router.post('/', authenticate, authorize('ADMIN'), invoiceController.create)

┌──────────────────────────────────────────────────────────────┐
│  STEP 5: MIDDLEWARE EXECUTION                                │
└──────────────────────────────────────────────────────────────┘

1. authenticate middleware:
   - Extract token from Authorization header
   - Verify JWT token with JWT_SECRET
   - Decode payload: { id: 1, role: 'ADMIN', company_id: 1 }
   - Attach to req.user
   - next()

2. authorize('ADMIN') middleware:
   - Check req.user.role === 'ADMIN'
   - If yes: next()
   - If no: return 403 Forbidden

┌──────────────────────────────────────────────────────────────┐
│  STEP 6: CONTROLLER EXECUTION                                │
└──────────────────────────────────────────────────────────────┘

invoiceController.create() called

const create = async (req, res) => {
  const { client_id, items, tax, discount } = req.body;
  const company_id = req.user.company_id; // = 1

  // Calculate totals
  const subtotal = items.reduce((sum, item) =>
    sum + (item.qty * item.rate), 0
  ); // = 1000 + 250 = 1250

  const taxAmount = (subtotal * tax) / 100; // = 225
  const total = subtotal + taxAmount - discount; // = 1425

  // Insert invoice
  const [result] = await pool.execute(
    'INSERT INTO invoices (company_id, client_id, total, tax, discount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [company_id, client_id, total, tax, discount, 'Draft']
  );

  const invoiceId = result.insertId; // = 123

  // Insert invoice items
  for (const item of items) {
    await pool.execute(
      'INSERT INTO invoice_items (invoice_id, description, qty, rate, amount) VALUES (?, ?, ?, ?, ?)',
      [invoiceId, item.description, item.qty, item.rate, item.qty * item.rate]
    );
  }

  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: { id: invoiceId, total }
  });
};

┌──────────────────────────────────────────────────────────────┐
│  STEP 7: DATABASE EXECUTION                                  │
└──────────────────────────────────────────────────────────────┘

MySQL executes queries:

1. INSERT INTO invoices ...
   - Returns insertId: 123

2. INSERT INTO invoice_items ... (first item)
   - invoice_id: 123, description: 'Web Development', qty: 10, rate: 100, amount: 1000

3. INSERT INTO invoice_items ... (second item)
   - invoice_id: 123, description: 'SEO Services', qty: 5, rate: 50, amount: 250

┌──────────────────────────────────────────────────────────────┐
│  STEP 8: HTTP RESPONSE                                       │
└──────────────────────────────────────────────────────────────┘

Status: 201 Created
Body:
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": 123,
    "total": 1425
  }
}

┌──────────────────────────────────────────────────────────────┐
│  STEP 9: FRONTEND RESPONSE HANDLING                          │
└──────────────────────────────────────────────────────────────┘

if (response.data.success) {
  // Show success message
  alert('Invoice created successfully!');

  // Navigate to invoice detail page
  navigate(`/app/admin/invoices/${response.data.data.id}`);

  // Or refresh invoice list
  fetchInvoices();
}

┌──────────────────────────────────────────────────────────────┐
│  STEP 10: UI UPDATE                                          │
└──────────────────────────────────────────────────────────────┘

React component re-renders with new data
User sees invoice in the list or is redirected to invoice detail page
```

---

## 📊 DATA FLOW PATTERNS

### Pattern 1: List Page (GET All)

```
User opens Clients page
   ↓
useEffect(() => fetchClients(), [])
   ↓
clientsAPI.getAll() → GET /api/v1/clients?company_id=1
   ↓
authenticate → authorize → controller
   ↓
SELECT * FROM clients WHERE company_id = 1
   ↓
{ success: true, data: [...], count: 25 }
   ↓
setClients(response.data.data)
   ↓
<DataTable data={clients} />
   ↓
User sees list of clients
```

---

### Pattern 2: Detail Page (GET Single)

```
User clicks "View" on Client #5
   ↓
navigate('/app/admin/clients/5')
   ↓
useEffect(() => fetchClient(5), [id])
   ↓
clientsAPI.getById(5) → GET /api/v1/clients/5?company_id=1
   ↓
authenticate → authorize → controller
   ↓
SELECT * FROM clients WHERE id = 5 AND company_id = 1
   ↓
{ success: true, data: {...} }
   ↓
setClient(response.data.data)
   ↓
Display client details
```

---

### Pattern 3: Create (POST)

```
User clicks "Add Client"
   ↓
Opens modal/form
   ↓
User fills form and clicks "Save"
   ↓
handleSubmit(formData)
   ↓
clientsAPI.create(formData) → POST /api/v1/clients
   ↓
authenticate → authorize → validate → controller
   ↓
INSERT INTO clients (...) VALUES (...)
   ↓
{ success: true, message: "Created", data: { id: 26 } }
   ↓
closeModal() + fetchClients() (refresh list)
   ↓
User sees new client in list
```

---

### Pattern 4: Update (PUT)

```
User clicks "Edit" on Client #5
   ↓
Opens modal with client data prefilled
   ↓
User modifies data and clicks "Save"
   ↓
handleUpdate(5, formData)
   ↓
clientsAPI.update(5, formData) → PUT /api/v1/clients/5
   ↓
authenticate → authorize → validate → controller
   ↓
UPDATE clients SET ... WHERE id = 5 AND company_id = 1
   ↓
{ success: true, message: "Updated" }
   ↓
closeModal() + fetchClients() (refresh list)
   ↓
User sees updated client in list
```

---

### Pattern 5: Delete

```
User clicks "Delete" on Client #5
   ↓
Confirm dialog: "Are you sure?"
   ↓
User clicks "Yes"
   ↓
handleDelete(5)
   ↓
clientsAPI.delete(5) → DELETE /api/v1/clients/5
   ↓
authenticate → authorize → controller
   ↓
DELETE FROM clients WHERE id = 5 AND company_id = 1
   ↓
{ success: true, message: "Deleted" }
   ↓
fetchClients() (refresh list)
   ↓
User sees client removed from list
```

---

## 🏢 MULTI-TENANT ARCHITECTURE

### Multi-Tenancy Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     SINGLE DATABASE                         │
│                                                             │
│  companies table                                            │
│  ┌────┬───────────────┬─────────────┐                     │
│  │ id │ name          │ package_id  │                     │
│  ├────┼───────────────┼─────────────┤                     │
│  │ 1  │ Company A     │ 2           │ ◄──┐                │
│  │ 2  │ Company B     │ 1           │ ◄──┼──┐             │
│  │ 3  │ Company C     │ 3           │ ◄──┼──┼──┐          │
│  └────┴───────────────┴─────────────┘    │  │  │          │
│                                           │  │  │          │
│  clients table                            │  │  │          │
│  ┌────┬────────────┬──────────────┐       │  │  │          │
│  │ id │ company_id │ name         │       │  │  │          │
│  ├────┼────────────┼──────────────┤       │  │  │          │
│  │ 1  │ 1          │ Client A1    │───────┘  │  │          │
│  │ 2  │ 1          │ Client A2    │──────────┘  │          │
│  │ 3  │ 2          │ Client B1    │─────────────┘          │
│  │ 4  │ 3          │ Client C1    │────────────────────────┘
│  └────┴────────────┴──────────────┘                        │
│                                                             │
│  invoices, projects, tasks... (all have company_id)        │
└─────────────────────────────────────────────────────────────┘

Key Rules:
1. Every query filters by company_id
2. company_id comes from JWT token (req.user.company_id)
3. SuperAdmin can bypass company_id filter
4. Frontend automatically adds company_id to requests
```

---

### Multi-Tenant Query Pattern

```javascript
// ❌ WRONG - No company_id filter
const [clients] = await pool.execute(
  'SELECT * FROM clients'
);

// ✅ CORRECT - Filtered by company_id
const [clients] = await pool.execute(
  'SELECT * FROM clients WHERE company_id = ?',
  [req.user.company_id]
);

// ✅ CORRECT - Get single resource with company_id check
const [clients] = await pool.execute(
  'SELECT * FROM clients WHERE id = ? AND company_id = ?',
  [id, req.user.company_id]
);

// ✅ SUPERADMIN can see all companies
const [clients] = req.user.role === 'SUPERADMIN'
  ? await pool.execute('SELECT * FROM clients')
  : await pool.execute('SELECT * FROM clients WHERE company_id = ?', [req.user.company_id]);
```

---

## 📁 FILE UPLOAD ARCHITECTURE

### File Upload Flow

```
User selects file
   ↓
Frontend creates FormData
const formData = new FormData();
formData.append('logo', file);
   ↓
POST /api/v1/settings (multipart/form-data)
   ↓
Multer middleware intercepts
   ↓
Validates file (type, size)
   ↓
Saves to /uploads directory
   ↓
req.file = {
  filename: 'logo-1234567890.png',
  path: '/uploads/logo-1234567890.png',
  size: 51234
}
   ↓
Controller receives req.file
   ↓
Saves file path to database
   ↓
Returns { success: true, file_path: '/uploads/...' }
   ↓
Frontend displays uploaded file
```

---

## ⚙️ SETTINGS SYSTEM ARCHITECTURE

### Settings Storage Pattern

```
Database: system_settings table
┌────┬────────────┬──────────────┬────────────────┐
│ id │ company_id │ setting_key  │ setting_value  │
├────┼────────────┼──────────────┼────────────────┤
│ 1  │ 1          │ company_name │ Acme Corp      │
│ 2  │ 1          │ theme_mode   │ dark           │
│ 3  │ 1          │ module_leads │ true           │
│ 4  │ 2          │ company_name │ XYZ Inc        │
└────┴────────────┴──────────────┴────────────────┘

Unique constraint: (company_id, setting_key)
```

### Settings Update Flow

```
Admin changes "theme_mode" from "light" to "dark"
   ↓
PUT /api/v1/settings/bulk
{
  settings: [
    { setting_key: "theme_mode", setting_value: "dark" }
  ]
}
   ↓
settingsValidator.js validates value
   ↓
settingsService.js updates database
   ↓
INSERT ... ON DUPLICATE KEY UPDATE
   ↓
applySettingChange("theme_mode", "dark", company_id)
   ↓
updateTheme({ mode: "dark" })
   ↓
Frontend ThemeContext updates
   ↓
UI re-renders with dark theme
   ↓
No page reload needed!
```

---

## 🔒 SECURITY ARCHITECTURE

### Security Layers

```
1. Input Validation
   - Frontend: React form validation
   - Backend: express-validator, custom validators

2. Authentication
   - JWT tokens (httpOnly in production)
   - Token expiration (24h)
   - Password hashing (bcrypt)

3. Authorization
   - Role-based access control
   - Route-level permissions
   - Data-level filtering (company_id)

4. SQL Injection Prevention
   - Parameterized queries (pool.execute)
   - Never concatenate SQL strings

5. XSS Prevention
   - React escapes output by default
   - DOMPurify for rich text

6. CSRF Protection
   - CSRF tokens (to be implemented)
   - SameSite cookies

7. Rate Limiting
   - express-rate-limit (to be implemented)
   - Prevent brute force attacks

8. HTTPS
   - SSL/TLS encryption in production
   - Secure cookies
```

---

## ❌ ERROR HANDLING PATTERN

### Backend Error Handling

```javascript
const controller = async (req, res) => {
  try {
    // Business logic
    const result = await someOperation();

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);

    // Specific error handling
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Resource already exists'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: error.message || 'Operation failed'
    });
  }
};
```

### Frontend Error Handling

```javascript
const handleSubmit = async () => {
  try {
    const response = await clientsAPI.create(formData);

    if (response.data.success) {
      alert('Success!');
      navigate('/clients');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Something went wrong';
    alert(errorMessage);
  }
};
```

---

## 📝 STATE MANAGEMENT PATTERN

### React State Management

```jsx
// 1. Local State (useState)
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

// 2. Context API (Global State)
const { user } = useAuth();
const { theme } = useTheme();

// 3. URL State (React Router)
const { id } = useParams();
const [searchParams] = useSearchParams();

// 4. Server State (useEffect + API)
useEffect(() => {
  fetchData();
}, []);
```

---

## 🎨 DESIGN PATTERNS USED

### 1. MVC Pattern (Backend)
- **Models:** Database tables
- **Views:** JSON responses
- **Controllers:** Business logic

### 2. Repository Pattern
- Services abstract database access
- Controllers don't directly query DB

### 3. Middleware Pattern
- Authenticate → Authorize → Validate → Controller

### 4. Factory Pattern
- axiosInstance factory for API calls

### 5. Provider Pattern (Frontend)
- AuthProvider, ThemeProvider

### 6. Container/Presentational Pattern
- Smart components (data) vs Dumb components (UI)

---

## 📏 CODING CONVENTIONS

### Backend Conventions
- camelCase for variables and functions
- PascalCase for classes
- UPPER_SNAKE_CASE for constants
- Async/await (not .then())
- Try-catch around all async operations

### Frontend Conventions
- PascalCase for components
- camelCase for variables and functions
- Props destructuring
- useState before useEffect
- Export default at bottom

### Database Conventions
- snake_case for table and column names
- Plural for table names (`clients`, not `client`)
- `id` as primary key
- `created_at`, `updated_at` timestamps

---

## ✅ ARCHITECTURE BEST PRACTICES

### DO's ✅
1. Always filter by `company_id` in queries
2. Use parameterized queries
3. Validate input before database operations
4. Return consistent response format
5. Use try-catch for error handling
6. Add indexes on frequently queried columns
7. Use middleware for cross-cutting concerns
8. Keep controllers thin, use services for complex logic
9. Use Context API for global state
10. Keep components focused (single responsibility)

### DON'Ts ❌
1. Never concatenate SQL strings
2. Never trust user input without validation
3. Never return database errors to frontend
4. Never query without company_id filter (except SuperAdmin)
5. Never store passwords in plain text
6. Never use var (use const/let)
7. Never mutate state directly
8. Never skip authentication/authorization checks
9. Never commit .env file
10. Never use console.log in production (use proper logging)

---

**END OF ARCHITECTURE DOCUMENTATION**

*This file provides complete architectural understanding for AI assistants and developers.*

*Last Updated: January 3, 2026*
*Version: 1.0.0*
