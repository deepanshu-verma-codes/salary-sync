# ACME Salary Sync

Enterprise Salary Management Software built for ACME Corp's HR team.

## Overview
This application provides an intuitive, high-performance web interface to manage and analyze salary data for 10,000 employees globally. It features a premium, modern design aesthetic, Role-Based Access Control (RBAC), and full PDF payslip generation capabilities.

### Key Features
- **Authentication & Security:** Secure JWT-based login with auto-refreshing access tokens.
- **Role-Based Access Control (RBAC):**
  - **Admin (Founder/CEO):** Full control over the system, can grant Subadmin roles, edit user credentials, and manage all payslips.
  - **Subadmin (HR):** Can manage employees, issue payslips, and generate PDFs.
  - **User (Employee):** Can only view and download their own payslips.
- **Employee Management:** Complete CRUD interface for managing employee records, salaries, and department info.
- **Payroll & Payslips:** Issue, edit, and delete payslips with dynamic net pay calculation. Employees can download beautiful, auto-generated PDF payslips.
- **Premium UI/UX:** Built with a glassmorphism aesthetic, subtle micro-animations, and responsive tooltips.

## Tech Stack
- **Backend:** Node.js, Express, SQLite, jsonwebtoken
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, html2canvas, jsPDF
- **Testing:** Jest, Supertest, React Testing Library

## Prerequisites
- Node.js (v18+)

## Getting Started

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Configure environment variables by copying the example file:
```bash
cp .env.example .env
```
*(Update `.env` with your secure JWT secrets if running in production)*

Seed the database with 10,000 employee records (Default Admin credentials will be generated here):
```bash
npm run seed
```
*(Default Admin: `iAmAdmin@yopmail.com` / `Admin@123456`)*

Start the backend server (runs on port 3001):
```bash
npm run dev
```

### 2. Frontend Setup
In a new terminal window, navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Configure environment variables:
```bash
cp .env.example .env
```

Start the frontend development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing
To run backend tests:
```bash
cd backend
npm run test
```

To run frontend tests:
```bash
cd frontend
npm run test
```

## Architecture & Product Decisions
Please see the [Product Requirements Document](docs/requirements.md) for detailed reasoning on scope, architecture, and tradeoffs.
