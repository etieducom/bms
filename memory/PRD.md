# ETI Educom Branch Management System - PRD

## Original Problem Statement
ETI Educom requires a comprehensive institute management system with:
- Multi-role access control (Super Admin, Branch Admin, Counsellor, FDE, Certificate Manager, Trainer, Academic Controller)
- Lead & Enrollment management with status workflows
- Advanced payment system with installment plans
- Certificate & Exam management with public request portal
- Batch & Trainer management with attendance tracking
- AI Analytics for lead insights
- WhatsApp automations for reminders
- Counsellor Incentive System for International Exams
- Campaign Management for Branch Admin

## User Personas & Permissions

### 1. Super Admin
- Full access to all branches and system settings

### 2. Branch Admin
- Full access to their branch
- Financial stats (Collection, Pending, Revenue, Exam Revenue, Expenses, Net)
- Campaign Management with analytics
- Counsellor incentive oversight
- All reports access

### 3. Counsellor
- Lead management, follow-ups, conversions
- Earns 10% incentive on international exams
- Reports: Leads reports only

### 4. Front Desk Executive (FDE)
- Enrollments, payments, student management
- Edit student details EXCEPT name, phone, financial info
- Reports: Leads, Income, Enrollments, Pending Payments
- Dashboard: NO Income & Expense chart

### 5. Certificate Manager
- Certificate requests and processing only

### 6. Trainer
- Batch management with 6 auto-created fixed-time batches
- Mark student attendance
- Mark course completion
- View all curricula
- Sidebar: Only "My Dashboard" and "Curriculum"

### 7. Academic Controller
- Quiz exam creation and curriculum management
- Sidebar: Only "Quiz Exams" and "Curriculum"

## Features Implemented

### P0 - Bug Fixes (Complete)
- ✅ Exam Revenue showing ₹0 → Fixed
- ✅ Academic Controller quiz creation → Fixed

### P1 - Features (Complete)
- ✅ Removed Analytics tab (unused)
- ✅ Campaign Management for Branch Admin
- ✅ Edit Student in Students tab with role restrictions
- ✅ Reports access control by role
- ✅ FDE dashboard restrictions

### P2 - Features (Complete)
- ✅ **Trainer Attendance & Course Completion**
  - 6 fixed-time batches auto-created for trainers
  - Mark attendance (single and bulk)
  - Mark course completion
  - Validates trainer assignment
- ✅ **Report Data Fixes**
  - Payment model now includes student_name and program_name
  - All payment records include student information for reports
- ✅ **Single Consolidated Payment Receipt**
  - Already implemented with professional layout
  - Shows: Total Fee, Amount Paid, Total Paid (Till Date), Balance
  - Includes student info, course, payment mode, terms
- ✅ **Public Certificate Request Link**
  - Accessible at `/certificate-request` without login
  - Students enter enrollment number to request certificate

### Previous Features (Complete)
- Trainer role restrictions
- Academic Controller role
- Branch Admin Financial Stats (6 metrics)
- AI-Powered Lead Insights (MOCKED)
- Counsellor Incentive System (10% on exams)
- Lead form enhancements (Lead Date, Discount Amount)
- Multiple Aadhar document upload

## Architecture

### Backend (FastAPI)
- `server.py` (6060+ lines - NEEDS REFACTORING)
- Key endpoints:
  - `/api/trainer/dashboard` - Trainer stats and batches
  - `/api/attendance` - Mark attendance
  - `/api/attendance/bulk` - Bulk attendance
  - `/api/course-completion` - Mark course complete
  - `/api/public/enrollment/{number}` - Public enrollment lookup
  - `/api/public/certificate-requests` - Public certificate submission
  - `/api/campaigns` - Campaign CRUD
  - `/api/campaigns/{id}/analytics` - Campaign analytics

### Frontend (React)
- `TrainerDashboard.js` - Trainer view with attendance
- `CampaignManagement.js` - Campaign tracking
- `CertificateRequestPage.js` - Public certificate request
- `StudentsPage.js` - Enhanced with Edit + Receipt

## Database Schema

### Key Collections
- `users` - Multi-role users
- `batches` - Auto-created for trainers (6 per trainer)
- `attendances` - Student attendance records
- `course_completions` - Course completion tracking
- `payments` - Now includes student_name, program_name
- `campaigns` - Marketing campaign tracking
- `exam_bookings` - With incentive tracking

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
1. **Refactor `server.py`** - Split into modular API routers (6060+ lines)
2. **Refactor `AdminPanel.js`** - Role-specific components
3. **Refactor `Layout.js`** - Simplify role-based logic

## Remaining Tasks (Backlog)
- WhatsApp Fee Reminders Automation (7,5,3,1 days before due)
- Birthday Wishes Automation
- Real LLM integration for AI Insights (currently mocked)

## Known Issues
- AI Insights uses MOCKED data (not real LLM)
- Payment partial payment marks entire installment as "Paid"

## Test Reports
- `/app/test_reports/iteration_15.json` - P2 Features (17/17 passed)
- `/app/test_reports/iteration_14.json` - P1 Features (10/10 passed)
- `/app/test_reports/iteration_13.json` - Incentive System (5/5 passed)
- `/app/test_reports/iteration_12.json` - Role features (9/9 passed)
