# PRD – Implementation Guide

## 1. Application Type
Single React application containing:
- Public marketing website
- Authentication layer
- Protected role-based SaaS app

## 2. Core Architecture
- React Router controls layout switching
- Layout rendered based on route group
- Auth Guard protects /app routes

## 3. Layout Rules
| Route Type | Layout |
|-----------|--------|
| /         | WebsiteLayout |
| /login   | AuthLayout |
| /signup  | AuthLayout |
| /app/*   | AppLayout |

## 4. Role Based Control
- User object contains role
- Role decides:
  - Sidebar menus
  - Default redirect
  - Page access

## 5. UI Consistency
- Same Tailwind theme across website & app
- Shared components for:
  - Buttons
  - Cards
  - Modals
  - Inputs

## 6. Responsiveness
- Mobile-first design
- Sidebar collapses under md
- Navbar toggle visible on mobile

## 7. Modal System
Reusable Modal component supporting:
- View
- Edit
- Create

## 8. State Management
- Auth state stored in Context
- Token stored in localStorage

## 9. Logout Flow
Logout clears:
- Token
- User state
Redirect → /login
