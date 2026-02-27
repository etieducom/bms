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
- **NEW: Counsellor Incentive System for International Exams**

## User Personas
1. **Super Admin**: Full access to all branches and system settings
2. **Branch Admin**: Full access to their branch, financial stats, trainer management, incentive oversight
3. **Counsellor**: Lead management, follow-ups, conversions, **earns 10% incentive on international exams**
4. **Front Desk Executive (FDE)**: Enrollments, payments, student management
5. **Certificate Manager**: Certificate requests and processing
6. **Trainer**: Batch management, attendance, course completion
7. **Academic Controller**: Quiz exam creation and curriculum management

## Core Features Implemented

### Session: December 2024 - Role-Based Access & Financial Stats

#### Completed Features

**1. Trainer Role Restrictions**
- Sidebar shows only "My Dashboard" and "Curriculum"
- Auto-redirect to `/trainer` on login
- Fixed-time batches auto-created for new trainers

**2. Academic Controller Role**
- Sidebar shows only "Quiz Exams" and "Curriculum"
- Auto-redirect to `/curriculum` on login
- Restricted quiz exam creation

**3. Branch Admin Financial Stats**
- Financial Overview with 6 metrics (Collection, Pending, Revenue, Exam Revenue, Expenses, Net)
- Trainer-wise Student Count
- Monthly Income & Expenses chart

**4. AI-Powered Analytics (MOCKED)**
- Health score, insights, and recommendations
- Note: Uses pre-calculated analytics

**5. Counsellor Incentive System (NEW)**
- **10% incentive on international exam fees when status = "Completed"**
- Counsellor Dashboard shows:
  - Earned Incentive (completed exams)
  - Pending Incentive (booked but not completed)
  - Cancelled/Refunds (cancelled exams)
  - Recent earned bookings list
  - Pending bookings list
- Branch Admin Dashboard shows:
  - Total earned/pending incentives
  - Completed/cancelled exam counts
  - Counsellor-wise breakdown table
- Manage Exams page shows:
  - Incentive/Refund column
  - Refund status for cancelled exams
  - "Mark Refunded" button for Branch Admin

**6. Lead Form Enhancements**
- "Lead Date" field
- "Discount Amount (₹)" field

**7. Aadhar Card Upload Enhancement**
- Multiple files support (images and PDF)

## Architecture

### Backend (FastAPI)
- Single monolithic `server.py` (5800+ lines - NEEDS REFACTORING)
- MongoDB for data storage
- JWT authentication
- Key new endpoints:
  - `/api/counsellor/incentives` - Counsellor's incentive data
  - `/api/branch-admin/incentive-stats` - Branch-wide incentive stats
  - `/api/exam-bookings/{id}/refund` - Mark refund as processed

### Frontend (React)
- Role-based routing in `App.js`
- Role-based sidebar in `Layout.js`
- Updated pages:
  - `Dashboard.js` - Counsellor & Branch Admin incentive sections
  - `ManageExamsPage.js` - Incentive/Refund column

## Database Schema

### Updated Collections
- `exam_bookings`:
  - Added: `counsellor_incentive` (float) - 10% of exam_price
  - Added: `incentive_status` (string) - Pending/Earned/Cancelled
  - Added: `refund_status` (string) - None/Pending/Processed
  - Added: `refund_amount` (float)
  - Added: `completed_at`, `cancelled_at` timestamps

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

## Remaining P2 Tasks
1. Trainer Attendance & Course Completion functionality
2. Report Data Fixes
3. Single consolidated Payment Receipt
4. WhatsApp Fee Reminders Automation
5. Birthday Wishes Automation

## Known Issues
- AI Insights uses MOCKED data (not real LLM)
- Payment partial payment marks entire installment as "Paid"
