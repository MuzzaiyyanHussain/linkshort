# LinkShort 🚀

A production-ready SaaS-style URL shortening platform built with Next.js, Clerk, Supabase, Redis, Docker, and GitHub Actions.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Redis](https://img.shields.io/badge/Redis-Upstash-red)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-orange)

---

## ✨ Features

### 🔗 URL Shortening

* Create short and shareable URLs instantly
* Dynamic redirect system
* Real-time link generation

### 🔐 Authentication

* Clerk authentication integration
* Protected dashboard routes
* User-specific link management

### ⚡ Performance Optimizations

* Redis caching using Upstash
* Reduced database lookups
* Faster redirect performance

### 🛡️ Security & Reliability

* API rate limiting
* Protected backend APIs
* Input validation
* Production-ready architecture

### 📊 Analytics

* Click tracking
* URL statistics
* Link activity monitoring

### 🐳 DevOps

* Dockerized application
* Docker Compose setup
* CI/CD pipeline using GitHub Actions
* Production build verification

---

# 🏗️ System Architecture

```txt
                ┌──────────────┐
                │    Client    │
                └──────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │   Next.js App  │
              └──────┬─────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────┐       ┌────────────────┐
│ Upstash Redis │       │   Supabase DB │
│    (Cache)    │       │   (Persistent)│
└───────────────┘       └────────────────┘
```

---

# 🧠 Tech Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Sonner Toasts

## Backend

* Next.js API Routes
* Supabase
* Clerk Authentication
* Upstash Redis

## DevOps

* Docker
* Docker Compose
* GitHub Actions

---

# ⚙️ Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

# 🚀 Local Development

## Install dependencies

```bash
npm install
```

## Run development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# 🐳 Docker Setup

## Build container

```bash
docker compose build
```

## Run container

```bash
docker compose up
```

---

# ✅ CI/CD Pipeline

GitHub Actions automatically runs:

* ESLint
* TypeScript checks
* Production builds

on every push and pull request.

---

# 📌 Future Improvements

* Stripe subscriptions
* AI support assistant
* Advanced analytics dashboard
* QR code generation
* Custom domains
* Monitoring with Grafana
* Background jobs & queues

# 👨‍💻 Author

Built by Muzzaiyyan.

If you liked this project, consider giving it a ⭐ on GitHub.
