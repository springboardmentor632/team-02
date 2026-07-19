# PolicyGPT Backend

This backend implements the server-side API for the PolicyGPT Government Policy & Public Scheme Intelligence Platform.

## What was added

- Full Express.js backend scaffold in `backend/`
- MongoDB Atlas support via `MONGODB_ATLAS_URI`
- JWT authentication and role-based access control
- Models for users, policies, schemes, eligibility rules, notifications, feedback, reports, audit logs, and search history
- REST API routes for authentication, policy management, scheme management, search, eligibility checking, notifications, feedback, and reporting
- Centralized error handling and request logging

## How to use

1. Copy `.env.example` to `.env`
2. Set `MONGODB_ATLAS_URI` to your MongoDB Atlas connection string
3. Set `JWT_SECRET` to a secure secret value
4. Run:

```bash
cd backend
npm install
npm run dev
```

The server will start on `http://localhost:4000` by default.

## Important note

- The current frontend implementation is untouched.
- This backend is designed to integrate with the existing Angular frontend without modifying the frontend files.

## API prefixes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/policies`
- `POST /api/policies`
- `PUT /api/policies/:id`
- `DELETE /api/policies/:id`
- `GET /api/schemes`
- `POST /api/schemes`
- `PUT /api/schemes/:id`
- `DELETE /api/schemes/:id`
- `POST /api/search`
- `POST /api/eligibility/check`
- `GET /api/notifications`
- `POST /api/feedback`
- `GET /api/reports`

## Roles

- Administrator
- Government Official
- Citizen
- Researcher
- Organization
- Guest User
