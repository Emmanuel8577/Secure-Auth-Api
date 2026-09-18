# Secure Auth API

[![Node.js CI](https://github.com/Emmanuel8577/secure-auth-api/actions/workflows/ci.yml/badge.svg)]
(https://github.com/Emmanuel8577/secure-auth-api/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Render Deployment](https://img.shields.io/badge/Render-Deployed-success?logo=render)]
(https://secured-auth-api.onrender.com)

A robust, production-grade RESTful Authentication & Authorization API built with **Node.js**, **Express**, **Prisma ORM**, and **Neon PostgreSQL**. Implements dual-token JWT authentication stored in secure `HttpOnly` cookies, strict schema validation, role-based access control (RBAC), and automated integration testing with Jest.


## 🚀 Live Demo & Documentation

* **Live Production URL:** [https://secured-auth-api.onrender.com]
* **Interactive Swagger UI Docs:** [https://secured-auth-api.onrender.com/api-docs]
* **Health Endpoint:** `GET /health`

---

## ✨ Key Features

- **Dual-Token Authentication**: Issues short-lived Access Tokens and long-lived Refresh Tokens via `HttpOnly` cookies to prevent XSS and CSRF vulnerabilities.
- **Automatic Token Rotation**: Automatic token refresh cycle on `/api/v1/auth/refresh`.
- **Role-Based Access Control (RBAC)**: Fine-grained authorization middleware separating `USER` and `ADMIN` privileges.
- **Input Validation**: Strict request payload schema validation using **Zod**.
- **Password Hashing**: Secure password hashing using **Bcrypt** (cost factor 12).
- **Security Middleware**: **Helmet** for HTTP security headers, **CORS** configuration, and **Express Rate Limit** against brute-force attacks.
- **Server Keep-Alive**: Background self-ping utility to keep Render free-tier instances active without cold-start delays.
- **Comprehensive Integration Tests**: Fully tested using **Jest** and **Supertest** with ES Module support.
- **CI/CD Pipeline**: GitHub Actions workflow automatically executing test suites on every `push` and `pull_request`.

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js v5 |
| **Database** | PostgreSQL (Hosted on Neon serverless) |
| **ORM** | Prisma ORM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `cookie-parser` |
| **Password Security** | Bcrypt |
| **Validation** | Zod |
| **Security** | Helmet, CORS, Express Rate Limit |
| **API Documentation** | Swagger UI (`swagger-jsdoc`, `swagger-ui-express`) |
| **Testing** | Jest, Supertest, Cross-Env |
| **Deployment & Hosting** | Render |
| **CI/CD** | GitHub Actions |

## 📡 API Endpoints Summary

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue HttpOnly cookies |
| `POST` | `/api/v1/auth/logout` | Public | Invalidate and clear auth cookies |
| `POST` | `/api/v1/auth/refresh` | Refresh Cookie | Rotate refresh token & issue new access token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve profile of currently logged-in user |
| `GET` | `/api/v1/auth/admin/users` | Admin Only | Fetch list of all registered users |
| `GET` | `/health` | Public | Server health check endpoint |

---

## ⚙️ Getting Started Locally

### 1. Prerequisites
- **Node.js** v20+
- **npm** or **pnpm**
- **PostgreSQL Database** (Local instance or Neon Postgres string)

### 2. Installation & Setup

```bash
# Clone the repository
git clone [https://github.com/Emmanuel8577/secure-auth-api.git]
cd secure-auth-api

# Install dependencies
npm install


### 3. Environment Variables
Create a `.env` file in the root directory and define the following variables:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require"
JWT_ACCESS_SECRET="your_super_secret_access_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
CLIENT_URL="http://localhost:3000"


### 4. Database Setup & Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Running the Application

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start


## 🧪 Running Automated Tests

Run the integration test suite using Jest and Supertest:

```bash
npm test


## 🚀 Deployment

The API is configured for seamless deployment on **Render**:

1. **Build Command:** `npm install && npm run build && npm run prisma:migrate`
2. **Start Command:** `npm start`
3. Configure environment variables (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`) in the Render Dashboard.
