# Architecture & Trade-offs

## Architectural Decisions
- **Monorepo-style structure**: The application is split into a `frontend` (Next.js) and `backend` (Express/Node) folder but housed in a single repository. This allows easy full-stack assessment grading.
- **Unified Environment Configuration**: A single root `.env` file feeds both the frontend and backend to streamline deployment and local development setup.
- **Database**: SQLite was chosen as the relational database. It satisfies the "Relational database" constraint perfectly while significantly reducing the infrastructure overhead required for the reviewer to run the application (no need to install or configure PostgreSQL or MySQL).
- **Authentication**: Stateless JWTs with short expiration times and refresh tokens. This eliminates the need for a Redis cache to manage session state.

## UI/UX & Product Trade-offs
- **Premium Aesthetics vs Native HTML Constraints**: Standard HTML5 `type="number"` inputs often introduce un-stylable browser elements (spinners) and inconsistent validation behavior across browsers. We traded native number inputs for standard `type="text"` with strict regex filtering (`replace(/\D/g, '')`) combined with React state to enforce cleaner UI constraints and custom validation flows.
- **Client-side PDF Generation**: Payslips are generated natively in the browser using `html2canvas` and `jsPDF`. This shifts the compute load to the client and saves the backend from heavy binary PDF generation (which would have required tools like Puppeteer), significantly improving server scalability when dealing with a 10,000 employee company.

## Scaling to 10,000 Employees
- **Pagination**: Implemented cursor/offset pagination to ensure the UI remains extremely fast even when scanning the 10,000 employee records. The frontend avoids rendering 10k DOM nodes.
- **Bulk Database Seeding**: The seeding script uses SQLite transactions (`BEGIN TRANSACTION` and `COMMIT`) to insert all 10,000 employees asynchronously in bulk. This drops seed time from minutes to milliseconds compared to individual insert queries.
