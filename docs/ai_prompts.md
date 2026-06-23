# AI Prompts & Usage

As requested in the assessment, this document outlines how AI tools were intentionally used to accelerate development while maintaining correctness and high engineering standards.

## Tool Used
- **Agentic AI Assistant**: DeepMind Antigravity (Agentic Coding AI)

## Intentional AI Usage Strategy
1. **Architectural Scaffolding**: AI was used to quickly scaffold the monorepo structure (Next.js + Node/Express) and wire up the basic SQLite database connection.
2. **UI Component Generation**: AI was instructed to create high-quality, glassmorphism-styled Tailwind components. The prompts emphasized strict aesthetics ("Use rich aesthetics", "avoid generic colors") to ensure the HR Manager persona received a premium web experience.
3. **Data Seeding**: AI was used to write the `faker` logic to generate 10,000 realistic employees. I intervened to ensure the AI used SQLite transactions (`BEGIN TRANSACTION`) to prevent the script from taking minutes to run.
4. **Testing**: AI was prompted to generate deterministic unit tests (`jest` and `supertest`) to cover core logic (e.g., currency formatting and endpoint data fetching).

## Example Prompts Used
- *"Create a React table component with pagination to handle 10,000 records smoothly. Do not render all records at once; use Next.js server/API offsets."*
- *"Implement a JWT auth flow with an Axios interceptor for refresh tokens. If a request returns 401 Unauthorized, automatically request a new token and retry the failed request."*
- *"Generate a script to seed 10,000 employees into SQLite. Ensure the salaries are strictly above 5,00,000 INR and experience ranges from 1-20 years."*

**Conclusion**: AI was treated as an advanced auto-complete and pair programmer. All AI-generated code was reviewed for security (e.g., preventing SQL injection by strictly using parameterized queries) and performance.
