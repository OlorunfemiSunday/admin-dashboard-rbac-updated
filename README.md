# admin-dashboard-rbac

A starter Node.js + Express + MongoDB project implementing:
- JWT access tokens + refresh tokens stored in DB (can be invalidated on logout)
- Role-Based Access Control (Admin, Manager, User)
- Activity logs (login, role changes, CRUD actions)
- Stats endpoints (users by role, login success/fail counts, active users in last 24h)
- Helmet, rate limiting, and centralized error handling

## Quick start

1. Copy `.env.example` to `.env` and set values:
   - `MONGO_URI` - your MongoDB connection string
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` - strong secrets
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the server (development):
   ```bash
   npm run dev
   ```
4. API endpoints:
   - `POST /api/auth/signup` - register { name, email, password }
   - `POST /api/auth/login` - login { email, password } -> returns accessToken & refreshToken
   - `POST /api/auth/refresh-token` - { refreshToken } -> returns new accessToken
   - `POST /api/auth/logout` - { refreshToken } -> invalidates refresh token
   - `GET /api/users` - (admin) list users
   - `GET /api/users/:id` - (admin, manager) view a user
   - `PATCH /api/users/:id/role` - (admin) change user role
   - `DELETE /api/users/:id` - (admin) delete user
   - `GET /api/logs` - (admin, manager) view activity logs (managers must filter)
   - `GET /api/logs/export?format=csv` - (admin, manager) export logs
   - `DELETE /api/logs/:id` - (admin) delete a specific log
   - `GET /api/stats/users` - (admin, manager) users by role
   - `GET /api/stats/logins` - (admin, manager) login success vs failed counts
   - `GET /api/stats/active-users` - (admin, manager) users active in last 24 hours

## Notes
- Access tokens are short-lived (default 15 minutes). Refresh tokens are long-lived and stored in DB.
- Managers can view filtered logs (must provide at least one filter param like `user`, `from`, or `to`).
- For production, use HTTPS, secure cookie flags if storing tokens in cookies, and rotate secrets.