# ETI Educom Branch Management System - PRD

## Original Problem Statement
ETI Educom requires a comprehensive institute management system with:
- Multi-role access control (Super Admin, Branch Admin, Counsellor, FDE, Certificate Manager, Trainer, Academic Controller)
- Lead & Enrollment management with status workflows
- Advanced payment system with installment plans
- Certificate & Exam management
- Batch & Trainer management
- AI Analytics for lead insights
- WhatsApp automations for reminders
- Counsellor Incentive System for International Exams
- **NEW: Campaign Management for Branch Admin**

## User Personas & Permissions

### 1. Super Admin
- Full access to all branches and system settings

### 2. Branch Admin
- Full access to their branch
- Financial stats (Collection, Pending, Revenue, Exam Revenue, Expenses, Net)
- Campaign Management (create, edit, delete campaigns with analytics)
- Counsellor incentive oversight
- Can edit all student details

### 3. Counsellor
- Lead management, follow-ups, conversions
- Earns 10% incentive on international exams
- **Reports**: Leads reports only

### 4. Front Desk Executive (FDE)
- Enrollments, payments, student management
- Can edit student details EXCEPT name, phone, financial info
- **Reports**: Leads, Income, Enrollments, Pending Payments (NO expenses)
- **Dashboard**: NO Income & Expense chart

### 5. Certificate Manager
- Certificate requests and processing only

### 6. Trainer
- Batch management, attendance, course completion
- Sidebar: Only "My Dashboard" and "Curriculum"

### 7. Academic Controller
- Quiz exam creation and curriculum management
- Sidebar: Only "Quiz Exams" and "Curriculum"

## Features Implemented

### Session: December 2024

#### Bug Fixes (P0)
- ✅ **Exam Revenue Bug**: Fixed field name (amount → exam_price) - Now shows ₹4,000 correctly
- ✅ **Academic Controller Quiz Creation**: Fixed permission check - Now shows "Create Quiz" button

#### Features (P1)
- ✅ **Removed Analytics Tab**: No longer in sidebar (was showing nothing)
- ✅ **Campaign Management**: New page for Branch Admin
  - Create/Edit/Delete campaigns (Google/Meta/etc.)
  - Fields: Campaign Name, Platform, Link, Start/End Date, Spend, Leads, Messages
  - Campaign Analytics: Leads acquired, Cost per lead, Conversion rate, ROI indicator
- ✅ **Edit Student in Students Tab**: 
  - Edit button with photo upload
  - FDE restricted from editing name/phone/financial info
- ✅ **Reports Access Control**:
  - Counsellor: Leads reports only
  - FDE: Leads, Enrollments, Income, Pending Payments
  - Branch Admin: All reports
- ✅ **FDE Dashboard Restriction**: Income & Expense chart hidden

#### Previously Implemented
- Trainer role restrictions (sidebar: My Dashboard + Curriculum)
- Academic Controller role (Quiz Exams + Curriculum creation)
- Branch Admin Financial Stats (6 metrics + trainer-wise breakdown)
- AI-Powered Lead Insights (MOCKED)
- Counsellor Incentive System (10% on international exams)
- Lead form enhancements (Lead Date, Discount Amount)
- Multiple Aadhar document upload

## Architecture

### Backend (FastAPI)
- `server.py` (6000+ lines - NEEDS REFACTORING)
- Key new endpoints:
  - `/api/campaigns` - CRUD for campaigns
  - `/api/campaigns/{id}/analytics` - Campaign analytics
  - `/api/students/{id}/update` - Update student with FDE restrictions

### Frontend (React)
- Key pages:
  - `CampaignManagement.js` - NEW
  - `StudentsPage.js` - Enhanced with Edit dialog
  - `ReportsPage.js` - Role-based filtering
  - `Dashboard.js` - FDE chart restriction

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@etieducom.com | admin@123 |
| Branch Admin | branchadmin@etieducom.com | admin@123 |
| Trainer | trainer@etieducom.com | password |
| Academic Controller | academic@etieducom.com | password |
| Counsellor | counsellor@etieducom.com | password |
| FDE | fde@etieducom.com | password |

## Technical Debt (HIGH PRIORITY)
1. **Refactor `server.py`** - Split into modular API routers (6000+ lines)
2. **Refactor `AdminPanel.js`** - Break into role-specific components
3. **Refactor `Layout.js`** - Simplify role-based logic

## Remaining Tasks

### P2 (Next)
1. Trainer Attendance & Course Completion functionality
2. Report Data Fixes
3. Single consolidated Payment Receipt
4. Public certificate request link

### Backlog
- WhatsApp Fee Reminders Automation (7,5,3,1 days)
- Birthday Wishes Automation
- Real LLM integration for AI Insights

## Known Issues
- AI Insights uses MOCKED data (not real LLM)
- Payment partial payment marks entire installment as "Paid"
