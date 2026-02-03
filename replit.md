# Kisan Union Punjab - Farmer ID Card Registration System

## Overview

This is a membership registration and ID card generation system for the Kisan Mazdoor Sangharsh Committee Punjab (Farmer Workers Struggle Committee). The application allows farmers to register for membership and receive digital ID cards. It features a public-facing registration form and an admin panel for managing registrations and generating ID cards.

The application is built as a full-stack TypeScript project with a React frontend and Express backend, using PostgreSQL for data persistence and Replit Auth for admin authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Animations**: Framer Motion for page transitions and UI animations
- **Language**: Punjabi (Gurmukhi script) as primary interface language

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **File Uploads**: Multer for handling multipart/form-data (photo uploads)
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Authentication**: Replit Auth (OpenID Connect) for admin access
- **Build System**: Vite for frontend, esbuild for backend bundling

### Database Design
- **registrations**: Stores farmer registration data including name, designation, village, tehsil, district, mobile number, Aadhaar number (last 4 digits shown), and base64-encoded photo
- **sessions**: Session storage for Replit Auth (mandatory table)
- **users**: User storage for Replit Auth (mandatory table)

### API Structure
- `POST /api/registrations` - Public endpoint for submitting new registrations (multipart/form-data with photo)
- `GET /api/admin/registrations` - Protected endpoint to list all registrations
- `GET /api/admin/registrations/:id` - Protected endpoint to get single registration
- `DELETE /api/admin/registrations/:id` - Protected endpoint to delete registration
- `POST /api/generate-card` - Generates ID card (returns ZIP or HTML file as binary blob)
- `POST /api/admin/download-all` - Downloads all registrations as ID cards

### Authentication & Authorization
- Uses Replit Auth (OpenID Connect) for authentication
- Admin access restricted to specific email addresses (sukdev3689@gmail.com)
- Session-based authentication with PostgreSQL session store
- Public registration form requires no authentication

### File Structure
```
├── client/               # React frontend
│   └── src/
│       ├── components/   # UI components (Navbar, Footer, shadcn/ui)
│       ├── hooks/        # Custom React hooks (auth, registration, toast)
│       ├── lib/          # Utilities (queryClient, auth-utils)
│       └── pages/        # Page components (Home, About, Contact, Admin)
├── server/               # Express backend
│   ├── replit_integrations/auth/  # Replit Auth integration
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/               # Shared code between frontend/backend
│   ├── schema.ts         # Drizzle schema definitions
│   ├── routes.ts         # API route type definitions
│   └── models/auth.ts    # Auth-related models
└── migrations/           # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and queries
- **drizzle-kit**: Database migrations with `npm run db:push`

### Authentication
- **Replit Auth**: OpenID Connect provider at `https://replit.com/oidc`
- Requires `REPL_ID` and `SESSION_SECRET` environment variables

### File Processing
- **Multer**: Handles photo uploads (max 5MB, images only)
- **AdmZip**: Creates ZIP archives for bulk ID card downloads

### UI Libraries
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-styled component library
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `REPL_ID`: Replit deployment identifier (auto-set on Replit)
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)