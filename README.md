# interndIn

A full-stack platform connecting SGSITS students with alumni opportunities including jobs, internships, and networking.

## Architecture

- **Backend**: Node.js + Express + Supabase
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with Google OAuth

## Features

- Student and Alumni registration/login
- Job postings and applications
- Resume uploads
- Messaging system
- Admin dashboard

## Setup

1. Clone the repo
2. Setup environment variables
3. Run backend: `cd backend && npm install && npm start`
4. Run frontend: `cd frontend && npm install && npm run dev`

## Environment Variables

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ANON_KEY
- FRONTEND_URL
