# ACME Salary Sync

Enterprise Salary Management Software built for ACME Corp's HR team.

## Overview
This application provides an intuitive, high-performance web interface to manage and analyze salary data for 10,000 employees globally.

## Tech Stack
- **Backend:** Node.js, Express, SQLite
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
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

Seed the database with 10,000 employee records:
```bash
npm run seed
```

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
