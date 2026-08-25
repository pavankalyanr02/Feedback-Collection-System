# Feedback Collection System

A full-stack web application designed for organizations to build feedback forms, distribute them to users via public links, collect structured responses, and analyze metrics through interactive dashboards.

The platform allows team members to create custom forms with multiple question types, manage workspace access using role-based access control, collect both anonymous and authenticated feedback, and view response trends through visual charts and data tables.

Built with React, TypeScript, Tailwind CSS, Express.js, Prisma ORM, and SQLite for local development (with PostgreSQL support for production deployments).

## Features

* User registration and authentication
* Role-based access control (Admin, Manager, Member, Respondent)
* Workspace and organization management
* Feedback form builder supporting 10 question types
* Form status management (Draft, Published, Closed)
* Public feedback submission endpoints
* Anonymous and authenticated feedback submission
* Response rate-limiting and duplicate submission prevention
* Analytics dashboard with chart visualizations
* Response management with search, filtering, and pagination
* CSV export for response data
* System audit logs
* Interactive API documentation via Swagger UI
* Dark and light theme support

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Styling | Tailwind CSS, Lucide Icons |
| State & Fetching | TanStack React Query v5, React Hook Form, Zod, Axios |
| Data Visualization | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| ORM & Database | Prisma ORM 5, SQLite (development) / PostgreSQL (production) |
| Authentication | JWT (Access and Refresh tokens), bcryptjs |
| Security | Helmet, CORS, Express Rate Limit |
| API Documentation | Swagger UI, swagger-jsdoc |
| Logging | Pino |
| Testing | Jest, Supertest |
| Containerization & CI | Docker, Docker Compose, GitHub Actions |

## Project Structure

```
feedback-collection-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── swagger/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   └── api.test.ts
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

### Key Directories

* `backend/src/controllers`: Request handling and HTTP response formatting.
* `backend/src/services`: Core business logic layer.
* `backend/src/middlewares`: Authentication, RBAC, request validation, rate limiting, and error handling.
* `backend/prisma`: Database schema definitions and seed data.
* `frontend/src/pages`: Main application views including Dashboard, Form Builder, Analytics, and Public Submissions.
* `frontend/src/components`: UI components, navigation, and layout structures.

## Architecture

The system uses a client-server architecture:

```
Frontend (React + Vite)
  ↓ HTTP / REST API
Express Backend (Node.js + TypeScript)
  ↓ Controller Layer
Service Layer
  ↓ Data Access Layer
Prisma ORM
  ↓ Database (SQLite / PostgreSQL)
```

The backend is structured around a Controller-Service pattern. Routes forward requests to controllers, which validate input and delegate execution to service modules. Services interact with the database through Prisma ORM.

## Database

The database model contains 11 main entities: `User`, `Organization`, `OrganizationMember`, `FeedbackForm`, `FormQuestion`, `QuestionOption`, `FeedbackResponse`, `FeedbackAnswer`, `FormShare`, `AuditLog`, and `Notification`.

```mermaid
erDiagram
    User ||--o{ OrganizationMember : "belongs to"
    Organization ||--o{ OrganizationMember : "has members"
    Organization ||--o{ FeedbackForm : "owns"
    User ||--o{ FeedbackForm : "creates"
    FeedbackForm ||--o{ FormQuestion : "contains"
    FormQuestion ||--o{ QuestionOption : "has options"
    FeedbackForm ||--o{ FeedbackResponse : "receives"
    FeedbackResponse ||--o{ FeedbackAnswer : "contains answers"
    FormQuestion ||--o{ FeedbackAnswer : "answered by"
    Organization ||--o{ AuditLog : "records"
    User ||--o{ Notification : "receives"
```

## API

Interactive API documentation is available at `http://localhost:5000/api-docs` when the backend is running.

### Authentication

* `POST /api/v1/auth/register`: Register new user and workspace
* `POST /api/v1/auth/login`: Authenticate user credentials and return JWT tokens
* `POST /api/v1/auth/refresh`: Issue new access token from refresh token
* `POST /api/v1/auth/logout`: Log out user
* `GET /api/v1/auth/me`: Get current authenticated user profile

### Organizations

* `GET /api/v1/organizations`: List organizations for authenticated user
* `POST /api/v1/organizations`: Create new workspace
* `GET /api/v1/organizations/:orgId/members`: List workspace members
* `POST /api/v1/organizations/:orgId/members`: Add member to workspace

### Forms

* `GET /api/v1/forms`: Fetch paginated forms with status and search filters
* `POST /api/v1/forms`: Create new feedback form with questions
* `GET /api/v1/forms/:id`: Fetch form details and questions
* `PUT /api/v1/forms/:id`: Update form configuration or questions
* `DELETE /api/v1/forms/:id`: Delete feedback form
* `POST /api/v1/forms/:id/publish`: Publish feedback form
* `POST /api/v1/forms/:id/duplicate`: Duplicate existing form structure

### Public Feedback

* `GET /api/v1/public/forms/:publicId`: Fetch public form for respondent view
* `POST /api/v1/public/forms/:publicId/responses`: Submit feedback answers

### Responses

* `GET /api/v1/forms/:id/responses`: Fetch paginated form responses
* `DELETE /api/v1/forms/:id/responses/:responseId`: Delete feedback response

### Analytics

* `GET /api/v1/analytics/dashboard`: Fetch workspace analytics summary
* `GET /api/v1/forms/:id/analytics`: Fetch question-by-question statistical breakdown

## Local Development

### Prerequisites

* Node.js v20.0.0 or higher
* npm v10.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pavankalyanr02/Feedback-Collection-System.git
   cd Feedback-Collection-System
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Configure environment variables:
   ```bash
   cp .env.example backend/.env
   ```

5. Initialize the database schema and seed data:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   cd ..
   ```

6. Start development servers:

   Backend server (Port 5000):
   ```bash
   cd backend
   npm run dev
   ```

   Frontend server (Port 5173):
   ```bash
   cd frontend
   npm run dev
   ```

   Alternatively, start both concurrently from the root directory:
   ```bash
   npm run dev
   ```

## Environment Variables

Copy `.env.example` to `backend/.env` to configure local settings:

* `PORT`: Backend server port (default: 5000)
* `DATABASE_URL`: Prisma connection string (`file:./dev.db` for local SQLite)
* `JWT_SECRET`: Secret key used to sign access tokens
* `JWT_REFRESH_SECRET`: Secret key used to sign refresh tokens
* `FRONTEND_URL`: URL of the frontend application for CORS policy
* `CORS_ORIGIN`: Allowed CORS origin

Do not commit real production secrets or credentials to version control.

## Demo Accounts

The database seed script creates the following development accounts:

* Admin: `admin@feedback.com` / `Password123!`
* Manager: `manager@feedback.com` / `Password123!`
* Member: `member@feedback.com` / `Password123!`

These credentials are intended for local development and testing only.

## Docker

To start the application stack using Docker Compose:

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, the Node.js backend, and the Nginx frontend container.

Services will be accessible at:
* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:5000`
* Swagger API Docs: `http://localhost:5000/api-docs`

To stop containers:
```bash
docker compose down
```

## Testing

### Backend Integration Tests

Run the integration test suite using Jest and Supertest:

```bash
cd backend
npm test
```

### Frontend Build Verification

Verify frontend TypeScript types and production build:

```bash
cd frontend
npm run build
```

GitHub Actions executes automated integration tests and production builds on push and pull requests to main branches.

## CI/CD

Automated CI workflows are defined in `.github/workflows/ci.yml`.

On push or pull request to `main` or `master`:
1. Dependencies are installed using `npm ci`.
2. Prisma client code is generated.
3. A test database is created and seeded.
4. Backend code is built with `npm run build`.
5. Integration tests are run with `npm test`.
6. Frontend application is built with `npm run build`.

## Security

Security measures implemented in the application include:

* Password Hashing: Password hashing using bcryptjs with 10 salt rounds.
* Authentication: JWT access and refresh token authentication flow.
* Authorization: Middleware enforcing Role-Based Access Control on protected routes.
* Input Validation: Request body, parameter, and query string validation using Zod.
* Security Headers: HTTP security header protection via Helmet middleware.
* Rate Limiting: IP-based rate limiting on sensitive endpoints via Express Rate Limit.
* Parameterized Queries: SQL injection mitigation via Prisma ORM.
* CORS Restrictions: Configured cross-origin resource sharing policy.

## Production Deployment

This project is configured for cloud production deployment using:
* **Frontend:** Vercel
* **Backend:** Render
* **Database:** PostgreSQL (Neon / Supabase / Render PostgreSQL)
* **Source Control:** GitHub (`main` branch)

### 1. Database Setup (Neon / Supabase / Render Postgres)

1. Provision a PostgreSQL database instance on Neon, Supabase, or Render.
2. Obtain your PostgreSQL connection string (`DATABASE_URL`), formatted like:
   ```env
   DATABASE_URL=postgresql://user:password@ep-sample-12345.us-east-1.aws.neon.tech/feedback_db?sslmode=require
   ```

### 2. Render Backend Deployment

1. Create a new **Web Service** on Render connected to your GitHub repository.
2. Set **Root Directory** to `backend`.
3. Set **Environment** to `Node`.
4. Set **Build Command**:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
5. Set **Start Command**:
   ```bash
   npm start
   ```
6. Add the following **Environment Variables** in Render:
   | Variable | Example / Purpose |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default set by Render) |
   | `DATABASE_URL` | `postgresql://user:password@host/dbname?sslmode=require` |
   | `JWT_SECRET` | Strong random 64-character string |
   | `JWT_REFRESH_SECRET` | Strong random 64-character string |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` |

7. Render Health Check Path: `/health`

### 3. Vercel Frontend Deployment

1. Import your GitHub repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add the following **Environment Variable** in Vercel:
   | Variable | Example / Purpose |
   | --- | --- |
   | `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` |

8. Deploy application. All API calls will route directly to your Render backend.

## Production Verification & Health Endpoint

The backend provides a dedicated health check endpoint at `GET /health` to verify server uptime and PostgreSQL database connectivity.

Example response:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production",
  "uptime": 3600.42,
  "timestamp": "2026-08-25T13:15:00.000Z"
}
```

## Future Improvements

* Email notification delivery for response alerts
* Background job queue architecture using BullMQ and Redis
* Advanced analytical filters and trend export options
* Multi-language feedback form internationalization
* Form custom branding and domain mapping

## License

This project is licensed under the MIT License.
