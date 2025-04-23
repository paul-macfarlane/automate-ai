# Automanager

Automanager is a modern project management platform designed to streamline collaboration and organize your workflows. It provides tools for creating and managing projects, inviting team members with different access roles, and tracking progress.

## Features

- **Project Management**: Create, view, and manage projects with detailed information
- **Role-Based Access Control**: Assign team members as admins, editors, or viewers
- **Team Collaboration**: Send and manage project invitations to team members
- **User Profiles**: Personalize your account with display name and profile picture
- **Modern UI**: Clean, responsive interface with dark mode support
- **Authentication**: Secure login system with session management

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router and React Server Components
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for customizable, accessible components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) for authentication and session management
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React's built-in hooks and Server Actions

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/automanager.git
   cd automanager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables in `.env.local`

4. Initialize the database:

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
automanager/
├── src/
│   ├── actions/        # Server actions for data mutations
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI components
│   ├── db/             # Database schema and configuration
│   ├── models/         # Data models and Zod validation schemas
│   └── services/       # Business logi
├── docs/               # Documentation
│   ├── database-patterns.md # Database abstraction patterns
│   ├── form-pattern.md      # Form and server action patterns
│   ├── project-invites.md   # Project invitation system
│   └── theming.md           # Styling and theme guidelines
├── public/             # Static assets
└── README.md           # This file
```

## Development Guidelines

Our development documentation provides detailed guidance on standard patterns and practices used throughout the codebase:

### [Database Patterns](docs/database-patterns.md)

Comprehensive guide on our database abstraction approach, including:

- Transaction management for data integrity
- TypeScript-first approach with proper type definitions
- Query optimization strategies
- Error handling best practices

### [Form & Server Action Patterns](docs/form-pattern.md)

Detailed documentation on implementing forms with server actions:

- Type-safe form validation with Zod
- React Hook Form integration
- Error handling and state management
- Consistent user feedback patterns

### [Theming & Styling Guidelines](docs/theming.md)

Complete guide to our theming system:

- CSS variable approach for consistent design
- Dark mode implementation
- Component styling patterns
- Accessibility considerations

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request
