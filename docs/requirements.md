# ACME Salary Sync - Product Requirements Document

## 1. Goal
To build a web-based employee salary management software that empowers ACME's HR Manager to efficiently manage, view, and analyze salary data for 10,000 employees globally. It replaces tedious Excel-based workflows with a centralized, performant, and queryable system.

## 2. Persona
**Primary User:** HR Manager at ACME Org.
- Needs a bird's-eye view of total compensation across the organization.
- Needs to look up individual employee salary details quickly.
- Needs to filter and analyze salary distributions (e.g., by country, department).

## 3. Scope & Features

### In Scope
1. **Dashboard & Analytics:** 
   - High-level metrics: Total Payroll, Average Salary, Employee Count.
   - Breakdown of salary by Country and Department.
2. **Employee Directory & Salary Table:**
   - Paginated list of 10,000 employees.
   - Search by name or email.
   - Filter by Country and Department.
   - Sort by Salary, Name, or Date Joined.
3. **Employee Detail View:**
   - View individual employee information and compensation details.
4. **Data Seeding:**
   - Script to populate 10,000 realistic employee records with salary data into a relational database.

### Out of Scope & Reasoning
1. **Authentication/Authorization:** *Reasoning:* To focus on core product functionality and engineering fundamentals (database querying, pagination, API design, UI performance with large datasets) within the time constraints. We assume the system is accessed securely behind a VPN for this MVP.
2. **Editing/Updating Salaries:** *Reasoning:* While crucial for a full product, read-heavy operations with 10k records (filtering, sorting, aggregations) are better suited to demonstrate architectural decisions and performance optimizations first. Read-only covers the immediate "answer questions" requirement.
3. **Historical Salary Data / Promotions:** *Reasoning:* Adds significant database complexity (temporal tables or audit logs). We will store current active salaries only to keep the schema simple and focused.
4. **Multi-currency Conversion:** *Reasoning:* For simplicity, we will assume all salaries are normalized to USD in the database or ignore currency exchange rate complexities for the MVP.

## 4. Technical Constraints & Architecture
- **Backend:** Node.js with Express.
- **Database:** SQLite (Relational, easy to set up, sufficient for 10k read-heavy workload).
- **Frontend:** Next.js (React) with Tailwind CSS and shadcn/ui (or standard UI components) for a premium, fast interface.
- **Testing:** Jest/Supertest for backend unit/integration tests, React Testing Library for frontend component tests.
