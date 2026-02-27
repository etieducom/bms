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

## User Personas
1. **Super Admin**: Full access to all branches and system settings
2. **Branch Admin**: Full access to their branch, financial stats, trainer management
3. **Counsellor**: Lead management, follow-ups, conversions
4. **Front Desk Executive (FDE)**: Enrollments, payments, student management
5. **Certificate Manager**: Certificate requests and processing
6. **Trainer**: Batch management, attendance, course completion
7. **Academic Controller**: Quiz exam creation and curriculum management

## Core Features Implemented

### Session: December 2024 - Role-Based Access & Financial Stats

#### P0 Features (Completed)
1. **Trainer Role Restrictions**
   - Sidebar shows only "My Dashboard" and "Curriculum"
   - Auto-redirect to `/trainer` on login
   - Fixed-time batches auto-created for new trainers
   - TrainerDashboard.js with stats and batch management

2. **Academic Controller Role**
   - Sidebar shows only "Quiz Exams" and "Curriculum"
   - Auto-redirect to `/curriculum` on login
   - Restricted quiz exam creation to this role only

3. **Lead Management Improvements**
   - Added "Lead Date" field to lead creation form
   - Added "Discount Amount (₹)" field as alternative to percentage discount
   - Default filter hides "Converted" leads
   - Pagination (10 items per page)

4. **AI-Powered Analytics (MOCKED)**
   - AI Leads Insights component on Counsellor/Branch Admin dashboards
   - Health score, insights, and recommendations
   - Note: Uses pre-calculated analytics, not real LLM integration

#### P1 Features (Completed)
1. **Branch Admin Financial Stats**
   - Financial Overview card with 6 metrics:
     - Total Collection
     - Pending Amount
     - Monthly Revenue
     - Exam Revenue
     - Total Expenses
     - Net Revenue
   - Trainer-wise Student Count section
   - Monthly Income & Expenses chart

2. **Aadhar Card Upload Enhancement**
   - Support for multiple files (images and PDF)
   - `aadhar_documents[]` array field
   - Preview with remove functionality

## Architecture

### Backend (FastAPI)
- Single monolithic `server.py` (5749 lines - NEEDS REFACTORING)
- MongoDB for data storage
- JWT authentication
- Key endpoints:
  - `/api/branch-admin/financial-stats` - Financial statistics
  - `/api/leads/ai-insights` - AI analytics (mocked)
  - `/api/trainer/dashboard` - Trainer stats
  - `/api/curricula` - Curriculum management

### Frontend (React)
- Role-based routing in `App.js`
- Role-based sidebar in `Layout.js`
- Key pages:
  - `Dashboard.js` - Role-specific dashboards
  - `TrainerDashboard.js` - Trainer-specific view
  - `CurriculumPage.js` - Curriculum management
  - `LeadsPage.js` - Lead management
  - `EnrollmentsPage.js` - Student enrollment

## Database Schema

### Collections
- `users` - User accounts with roles
- `branches` - Branch information
- `leads` - Lead tracking with new `lead_date` field
- `enrollments` - Student enrollments with `discount_amount`
- `payments` - Payment records
- `batches` - Training batches
- `curricula` - Course curricula
- `attendances` - Student attendance

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@etieducom.com | admin@123 |
| Branch Admin | branchadmin@etieducom.com | admin@123 |
| Trainer | trainer@etieducom.com | password |
| Academic Controller | academic@etieducom.com | password |
| Counsellor | counsellor@etieducom.com | password |

## Technical Debt (High Priority)
1. **Refactor `server.py`** - Split into modular API routers
2. **Refactor `AdminPanel.js`** - Break into role-specific components
3. **Refactor `Layout.js`** - Simplify role-based logic

## Upcoming Tasks (P2)
1. Trainer Attendance & Course Completion functionality
2. Report Data Fixes
3. Single consolidated Payment Receipt
4. WhatsApp Fee Reminders Automation (7,5,3,1 days)
5. Birthday Wishes Automation

## Known Issues
- AI Insights uses MOCKED data (not real LLM)
- Payment partial payment marks entire installment as "Paid"
