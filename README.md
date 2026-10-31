# Grow Backend - Final Project

## Project Overview

Grow is a comprehensive **discussion forum and community platform** built with TypeScript, Express, and PostgreSQL.

### Key Features

- **Multi-Company Architecture**: Platform supports multiple companies with company-specific discussions and comments
- **Authentication**: JWT-based authentication with:
  - Email/Password login
  - Google OAuth 2.0 integration
- **Roles & Permissions**:
  - **Admin**: Full system access
  - **Owner**: Company owner with CRUD operations on company and discussions
  - **Mentor**: Subject matter experts providing mentorship sessions
  - **User**: Regular users (formerly referred to as Members)
- **Discussion System**:
  - Public and private discussions per company
  - Rich text content with markdown support
  - Comment threading and replies
- **Mentorship & Video Sessions**:
  - Mentor profiles with expertise and availability
  - Real-time video sessions powered by LiveKit
  - Booking system for mentorship sessions
- **Search & Filtering**: Advanced search and filtering across discussions and comments
- **Admin Dashboard**:
  - User management (ban, activate, deactivate)
  - Company verification and management
  - System analytics

## Tech Stack

- **Core**: TypeScript, Node.js 20.x
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma 6.x (with Prisma Client generation on build)
- **Authentication**: JWT, bcrypt, Passport.js (Google OAuth)
- **Validation**: Zod
- **Testing**: Vitest
- **Containerization**: Docker

## Prisma Setup

The project uses Prisma for ORM. Prisma client is generated automatically on build and in Docker build.

### Prisma commands

```bash
# Generate Prisma client (in Docker builds)
npx prisma generate --schema=./prisma/schema/schema.prisma

# Migrate database (development)
npx prisma migrate dev --schema=./prisma/schema/schema.prisma

# Generate Prisma client (local development)
npm run postinstall
```

### Database Schema

The database schema is located at [prisma/schema/schema.prisma](./prisma/schema/schema.prisma).

## Project Structure

```
grow-backend/
├── src/
│   ├── app/                  # Application code
│   │   ├── modules/          # Feature modules
│   │   │   ├── admin/        # Admin features
│   │   │   ├── auth/         # Authentication
│   │   │   ├── company/      # Company management
│   │   │   └── discussion/   # Discussions and comments
│   │   ├── middleware/       # Custom middleware
│   │   ├── routes/           # API routes
│   │   └── server.ts         # Express app entry point
│   ├── config/               # Configuration
│   ├── shared/               # Shared utilities (QueryBuilder, etc.)
│   └── utils/                # Utility functions
├── prisma/                   # Prisma configuration
│   └── schema/               # Prisma schema files
├── dist/                     # Compiled TypeScript
├── .env                      # Environment variables (not in git)
└── Dockerfile                # Docker build configuration
```

## Google Sign-In (Frontend Integration)

The Google sign-in flow uses a short-lived, single-use authorization code. The backend exchanges that code for HttpOnly authentication cookies; the frontend should not store JWTs in local storage.

1. Redirect the browser to `GET /api/v1/auth/google?redirect=/login/google-callback`. The `redirect` value must be a path on the configured frontend origin.
2. After Google authentication, the backend redirects to that frontend path with `?code=...`.
3. Read the `code` query parameter and immediately remove it from the address bar. Exchange it with:

   ```http
   POST /api/v1/auth/google/exchange
   Content-Type: application/json
   ```

   ```json
   { "code": "one-time-code-from-the-redirect" }
   ```

   Include credentials in browser requests (`credentials: "include"` for `fetch`, or `withCredentials: true` for Axios). On success, the response is:

   ```json
   {
     "success": true,
     "message": "Google authentication code exchanged",
     "data": null
   }
   ```

   The response sets `accessToken` and `refreshToken` as HttpOnly cookies. The code expires after 60 seconds and can only be exchanged once. Missing or expired codes return `401`.
4. Load the signed-in user from `GET /api/v1/user/me`, also including credentials. Authentication cookies are sent automatically.
5. To refresh the access cookie, call `POST /api/v1/auth/refresh-token` with credentials and no request body. The response includes a new `data.accessToken` and updates the HttpOnly access cookie.
6. To sign out, call `POST /api/v1/auth/logout` with credentials.

The backend permits credentialed requests only from the configured `FRONTEND_URL`. The callback destination is restricted to that same origin.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grow"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/v1/auth/google/callback"

JWT_ACCESS_SECRET="your_jwt_access_secret"
JWT_REFRESH_SECRET="your_jwt_refresh_secret"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="30d"
```

## Build & Run Instructions

### Local Development

```bash
# Install dependencies
npm install

# Run Prisma migration
npx prisma migrate dev --schema=./prisma/schema/schema.prisma

# Start development server
npm run dev
```

### Docker Build

```bash
# Build and push to Docker Hub
npm run docker-build
```

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

**Login**

```
POST /api/v1/auth/login
```

```json
{
  "email": "[EMAIL_ADDRESS]",
  "password": "password"
}
```

**Google Login**

```
GET /api/v1/auth/google?redirect=/login/google-callback
```

After Google sign-in, exchange the returned `code` using `POST /api/v1/auth/google/exchange` as described in [Google Sign-In (Frontend Integration)](#google-sign-in-frontend-integration).

### Users

**Get Current User Profile**

```
GET /api/v1/user/me
```

**Update User Profile**

```
PATCH /api/v1/user/me
```

### Admin Endpoints

**Get All Users**

```
GET /api/v1/admin/users
```

**Update User Status**

```
PATCH /api/v1/admin/users/:userId/status
```

**Get All Companies**

```
GET /api/v1/admin/companies
```

**Verify Company**

```
PATCH /api/v1/admin/companies/:companyId/verify
```

### Companies

**Get Single Company**

```
GET /api/v1/companies/:companyId
```

**Update Company**

```
PATCH /api/v1/companies/:companyId
```

### Discussions

**Get All Discussions**

```
GET /api/v1/discussions?companyId=...&status=...
```

**Create Discussion**

```
POST /api/v1/discussions
```

**Update Discussion**

```
PATCH /api/v1/discussions/:id
```

**Delete Discussion**

```
DELETE /api/v1/discussions/:id
```

### Comments

**Create Comment**

```
POST /api/v1/discussions/:discussionId/comments
```

**Update Comment**

```
PATCH /api/v1/comments/:id
```

**Delete Comment**

```
DELETE /api/v1/comments/:id
```

### Mentors

**Search Mentors**

```
GET /api/v1/mentor/search
```

**Create Mentor Profile**

```
POST /api/v1/mentor/profile
```

**Get My Mentor Profile**

```
GET /api/v1/mentor/profile/me
```

**Update Mentor Profile**

```
PATCH /api/v1/mentor/profile
```

**Add Availability**

```
POST /api/v1/mentor/availability
```

### Sessions & Video

**Create Booking**

```
POST /api/v1/session/booking
```

**Get My Bookings**

```
GET /api/v1/session/my-bookings
```

**Start Video Session** (Mentor only)

```
POST /api/v1/session/:bookingId/start
```

**Join Video Session**

```
GET /api/v1/session/:bookingId/join
```
