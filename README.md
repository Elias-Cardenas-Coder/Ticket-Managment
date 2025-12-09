# HelpDeskPro - Centralized Support Ticket Management System

HelpDeskPro is a comprehensive help desk solution designed to solve the challenges of managing support requests through scattered emails, chats, and spreadsheets. Built with Next.js, TypeScript, and Prisma, it provides a centralized platform for tracking, managing, and resolving customer support tickets.

## Problem Statement

HelpDeskPro addresses the following challenges faced by support teams:

- **No centralized ticket registry** - All support requests are now tracked in one place
- **Lost or delayed responses** - Automated tracking ensures no ticket goes unanswered
- **Unclear ticket status** - Clear status tracking (Open, In Progress, Resolved, Closed)
- **No priority management** - Priority levels (Low, Medium, High, Urgent) with visual indicators
- **No performance metrics** - Real-time dashboards showing response times and resolution metrics
- **Poor customer experience** - Organized workflow leads to faster, more reliable support

## Key Features

### For All Users
- **Create and track support tickets** with detailed descriptions
- **Comment system** for ongoing communication
- **Personal dashboard** showing your ticket status
- **Search and filter** tickets by status, priority, and keywords
- **Dark mode support** for comfortable viewing
- **Multi-language support** (i18n ready)

### For Agents & Admins
- **Real-time analytics dashboard** with key metrics:
  - Ticket counts by status (Open, In Progress, Resolved, Closed)
  - Priority distribution (Urgent, High, Medium, Low)
  - Unassigned tickets tracking
  - Average response time
  - Average resolution time
- **Ticket assignment** to specific agents
- **Priority management** with visual indicators
- **Internal notes** (not visible to customers)
- **Status management** with automatic timestamp tracking
- **User management** capabilities

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Initialize the database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. (Optional) Seed the database with sample data:

```bash
npm run seed
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User** - System users (customers, agents, admins)
- **Ticket** - Support tickets with status, priority, and assignment tracking
- **Comment** - Ticket comments and internal notes
- **Account/Session** - NextAuth authentication

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **UI Components:** Custom components with dark mode support

## User Roles

### USER (Customer)
- Create support tickets
- View own tickets
- Add comments to own tickets
- Track ticket status

### AGENT
- All USER permissions
- View all tickets
- Assign tickets to themselves or other agents
- Update ticket status and priority
- Add internal notes
- Access analytics dashboard

### ADMIN
- All AGENT permissions
- User management
- Full system access
- Advanced analytics

## Ticket Workflow

1. **OPEN** - New ticket created, awaiting assignment
2. **IN_PROGRESS** - Agent is actively working on the ticket
3. **RESOLVED** - Issue has been resolved, awaiting customer confirmation
4. **CLOSED** - Ticket is closed and archived

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Seed database with sample data
npm run lint         # Run ESLint
```

## Performance Metrics

The system automatically tracks:
- **First Response Time** - Time from ticket creation to first agent response
- **Resolution Time** - Time from ticket creation to resolution
- **Ticket Volume** - Number of tickets by status and priority
- **Agent Performance** - Assigned tickets and response times

## Security Features

- Secure authentication with NextAuth.js
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Session management
- Protected API routes

## Best Practices Implemented

- **Centralized ticket management** - Single source of truth
- **Clear status tracking** - Visual indicators for ticket states
- **Priority-based workflow** - Urgent tickets get immediate attention
- **Response time tracking** - SLA monitoring capabilities
- **Internal collaboration** - Agent notes for team coordination
- **Customer transparency** - Real-time status updates

