# EduCore – Student Management System (updated)

Spring Boot 4 (Java 17, MySQL) + React 19 / Vite.

## Run
**Backend** – set env vars (see `Backend/.env.example`), then `./mvnw spring-boot:run`.
Use a **fresh database** (`DROP DATABASE studentdb;`) – the schema changed (roles, classes, new tables).
On first start a SUPER_ADMIN is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@sms.local` / `ChangeMe@2026`, username `superadmin`) and must change the password at first login.
With `MAIL_ENABLED=false` (default) credentials and OTPs are printed in the backend console instead of emailed.

**Frontend** – `cd Frontend && npm install && npm run dev` (API URL: `VITE_API_URL`, default http://localhost:8080).

## Roles
- SUPER_ADMIN: everything, plus teachers, audit log, deleting students/classes.
- TEACHER: students, classes, attendance, exams, marks, notices, holidays.
- STUDENT: read-only, only their own data (`/api/me/**`).

## Flow
Teacher/admin adds student → account created → email with username, admission no. and temporary password →
student logs in → forced change-password → dashboard. Forgot password uses a 6-digit emailed code.
