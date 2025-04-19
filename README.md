# Automanager

Automanager is a modern project management platform designed to streamline collaboration and organize your workflows. It provides tools for creating and managing projects, inviting team members with different access roles, and tracking progress.

## Features

- **Project Management**: Create, view, and manage projects with detailed information
- **Role-Based Access Control**: Assign team members as admins, editors, or viewers
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
│   │   └── schema/     # Drizzle ORM schema definitions
│   └── lib/            # Utility functions and validations
│       └── models/     # Data models and Zod validation schemas
├── docs/               # Documentation
│   ├── form-pattern.md # Form and server action patterns
│   └── database-patterns.md # Database abstraction patterns
├── public/             # Static assets
└── README.md           # This file
```

## Development Guidelines

### Database Patterns

We use a standardized approach to database operations that balances performance and data integrity. See [Database Patterns Guide](docs/database-patterns.md) for details on:

- Using transaction contexts for data operations
- Working with the `withDb` and `withTransaction` utilities
- Naming conventions and best practices
- Type definitions and error handling

### Form Patterns

We follow a standardized pattern for handling forms and server actions. See [Form Pattern Documentation](docs/form-pattern.md) for details on how to:

- Create validation schemas with Zod
- Implement server actions with proper error handling
- Build form components with React Hook Form
- Manage form state and server communication

### Styling Guidelines

We use Tailwind CSS for styling components. Key conventions:

- Use the provided theme variables (e.g., `bg-background`, `text-foreground`)
- Support both light and dark modes using the theme variables
- Maintain consistent spacing and component sizes

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request
