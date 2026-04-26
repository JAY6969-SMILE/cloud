# Job Portal (Spring Boot + PostgreSQL + Vanilla Frontend)

This repository contains a full-stack job portal application with:

- Spring Boot REST API backend
- PostgreSQL database
- Static HTML/CSS/JS frontend
- JWT authentication with role-based flows for `JOBSEEKER` and `EMPLOYER`

The app supports posting jobs, applying with PDF resumes, parsing resume text, and reviewing applications.

## Quick Start Guide

Use this section if you just want to run everything quickly.

1. Start backend + database:

```bash
docker compose up -d --build
```

2. Check backend health:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{ "status": "UP" }
```

3. Start frontend static server from `frontend`:

```bash
cd frontend
python -m http.server 5500
```

4. Open frontend:

- `http://localhost:5500`

5. Create your first account:

- Open `http://localhost:5500/auth.html`
- Click `REGISTER`
- Select role (`JOBSEEKER` or `EMPLOYER`)
- Register, then login

## Login and Password Details

There are no hardcoded default users in this project.

- You must register first from the Auth page or via API.
- Passwords are stored using BCrypt hashing in database.

### Recommended Demo Credentials

You can use these sample accounts for local testing (create them via Register):

- Employer
  - Email: `employer@test.com`
  - Password: `Employer@123`
  - Role: `EMPLOYER`
- Jobseeker
  - Email: `jobseeker@test.com`
  - Password: `Jobseeker@123`
  - Role: `JOBSEEKER`

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.3.4
- Spring Web (REST API)
- Spring Data JPA (ORM)
- Spring Security (JWT + stateless auth)
- JJWT 0.11.5
- Apache PDFBox 2.0.29

### Database

- PostgreSQL 15

### Frontend

- HTML5, CSS3, JavaScript (ES modules)

### DevOps / Tooling

- Maven wrapper (`mvnw`, `mvnw.cmd`)
- Docker and Docker Compose
- Eclipse Temurin 17 JDK container base image

## High-Level Architecture

1. Frontend pages in `frontend/` call backend endpoints under `/api`.
2. User registers/logs in via `/api/auth/*` and receives JWT.
3. Frontend stores JWT in `localStorage` and sends `Authorization: Bearer <token>`.
4. `JwtAuthenticationFilter` validates token for protected endpoints.
5. Services (`AuthService`, `JobService`, `ApplicationService`, `ResumeParserService`) handle business logic.
6. JPA repositories persist data in PostgreSQL.

## Functional Features

### Authentication and Roles

- Register as `JOBSEEKER` or `EMPLOYER`
- Login returns JWT
- BCrypt password hashing
- Stateless session policy

### Jobseeker Flow

- Browse jobs
- Open job detail
- Apply using PDF resume upload
- Get parsed skills from resume text
- View own applications and statuses

### Employer Flow

- Post jobs
- View applications for own posted jobs
- Accept/reject applications

### Resume Parsing

- PDF parsing with PDFBox
- Keyword-based skills extraction
- Current keywords: `Java`, `Python`, `SQL`, `React`, `Docker`, `Spring`, `AWS`, `Node`, `ML`, `Git`

## Repository Structure

```text
.
|-- src/main/java/com/jobportal/
|   |-- controller/
|   |-- model/
|   |-- repository/
|   |-- security/
|   `-- service/
|-- frontend/
|-- docker-compose.yml
|-- Dockerfile
|-- pom.xml
`-- mvnw / mvnw.cmd
```

## Key API Endpoints

Base URL: `http://localhost:8080/api`

### Public

- `GET /api/info`
- `GET /api/health`
- `GET /api/jobs`
- `GET /api/jobs/{id}`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected (JWT required)

- `POST /api/jobs` (employer only)
- `POST /api/jobs/{id}/apply` (jobseeker only)
- `GET /api/jobs/{id}/applications` (employer only, own jobs)
- `PUT /api/jobs/applications/{applicationId}/accept`
- `PUT /api/jobs/applications/{applicationId}/reject`
- `GET /api/users/applications`

## Environment Variables

Backend runtime variables:

- `SPRING_DATASOURCE_URL` (example: `jdbc:postgresql://localhost:5432/jobportal`)
- `SPRING_DATASOURCE_USERNAME` (example: `postgres`)
- `SPRING_DATASOURCE_PASSWORD` (example: `postgres`)
- `JWT_SECRET`
- `JWT_EXPIRATION` (example: `86400000`)

`docker-compose.yml` in this repo already contains these values for local Docker run.

## Running the Project (Detailed)

### Option 1: Docker Compose

1. Build and run:

```bash
docker compose up -d --build
```

2. Verify backend:

```bash
curl http://localhost:8080/api/health
```

3. Serve frontend:

```bash
cd frontend
python -m http.server 5500
```

4. Open app:

- `http://localhost:5500`

### Option 2: Run Backend Locally + DB in Docker

1. Start database:

```bash
docker run --name jobportal-db -e POSTGRES_DB=jobportal -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

2. Set backend env vars.

3. Start backend:

```bash
./mvnw spring-boot:run
```

4. Serve frontend from `frontend` on port 5500.

## Frontend Notes

- API base URL is `http://localhost:8080/api`.
- JWT and role are stored in `localStorage`.
- Authorization header format is `Bearer <token>`.

## Security Notes

- CSRF disabled, stateless auth enabled.
- CORS is configured for:
  - `http://localhost:5500`
  - `http://127.0.0.1:5500`
- OPTIONS preflight is permitted globally.
- Passwords are BCrypt-hashed.

## Current Known Limitations

- No automated tests yet under `src/test/java`.
- Resume skill extraction is keyword-based (not NLP ranking).
