# Todo App

A modern, full-stack task management application built with Next.js 15, TypeScript, and PostgreSQL. Features user authentication, real-time task management.

## 🚀 Live Demo

[**View Live App**](https://todoapp-sigma-ruby.vercel.app/) 

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login/signup with bcrypt password hashing
- ✅ **Task Management** - Create, edit, delete, and toggle tasks with due dates
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔄 **Real-time Updates** - Zustand state management for instant UI feedback
- 💾 **Data Persistence** - PostgreSQL database with Prisma ORM
- 🧪 **Unit Tested** - Jest test suite for validation schemas and API handlers
- ⚡ **Loading States** - Professional skeleton screens and button spinners
- 🎯 **TypeScript** - Full type safety across the entire application

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Form validation and handling

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Prisma** - Modern database ORM
- **PostgreSQL** - Production database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Zod** - Runtime type validation

### Development & Testing
- **Jest** - JavaScript testing framework
- **ts-jest** - TypeScript Jest preset
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🏗️ Architecture

### Database Schema
```
User
├── id (String, Primary Key)
├── email (String, Unique)
├── username (String, Unique)  
├── password (String, Hashed)
└── tasks (Task[])

Task
├── id (String, Primary Key)
├── title (String)
├── description (String, Optional)
├── completed (Boolean)
├── dueDate (DateTime, Optional)
├── userId (String, Foreign Key)
└── user (User)
```

### Key Design Decisions

- **App Router**: Leverages Next.js 15's latest routing system for better performance
- **Server Components**: Optimized rendering with client components only where needed
- **JWT Authentication**: Stateless auth with secure HTTP-only cookies  
- **Zustand Store**: Lightweight alternative to Redux for client state
- **Prisma**: Type-safe database queries with excellent TypeScript integration
- **Validation Layer**: Zod schemas ensure data integrity at runtime

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or cloud)

### 1. Clone Repository
```bash
git clone https://github.com/Preet2099x/todoapp.git
cd todoapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todoapp"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# Optional: Next.js
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: 
- Replace `DATABASE_URL` with your PostgreSQL connection string
- Generate a secure `JWT_SECRET` (32+ characters recommended)
- For production, use environment-specific values

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: View database in Prisma Studio
npx prisma studio
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Run Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage
```

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm run start
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

## 🧪 Testing

The project includes comprehensive unit tests:

- **Validation Tests**: Zod schema validation for auth and tasks
- **API Tests**: Signup handler with mocked Prisma and bcrypt
- **Coverage**: Core business logic and input validation

```bash
npm run test                    # Run all tests
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # Coverage report
```

## 🎨 UI Design Philosophy

- **Glassmorphism**: Semi-transparent elements with backdrop blur
- **Warm Gradients**: Purple-to-pink color scheme throughout
- **Micro-interactions**: Hover effects, scale animations, and loading states
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation
- **Mobile-first**: Responsive design that works on all screen sizes

## ⚡ Performance Optimizations

- **Server Components**: Default to server rendering for better performance
- **Image Optimization**: Next.js Image component for automatic optimization
- **Bundle Splitting**: Automatic code splitting for smaller initial loads
- **Loading States**: Skeleton screens improve perceived performance
- **Database Queries**: Optimized Prisma queries with proper indexing

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **Input Validation**: Runtime validation with Zod schemas
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Environment Variables**: Sensitive data stored securely

## 🚧 Future Improvements
- 🌙 **Dark Mode** - Theme switching with system preference detection
- 🏷️ **Task Categories** - Color-coded task organization
- 🔄 **Drag & Drop** - Reorder tasks with smooth animations
- 👥 **Team Collaboration** - Share tasks and lists with others
- 📊 **Analytics Dashboard** - Task completion statistics and insights
- 📤 **Export/Import** - CSV and JSON data portability
- 🎯 **Task Priorities** - High/medium/low priority levels


## 📄 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup    # Create new user account
POST /api/auth/login     # Authenticate user
POST /api/auth/logout    # Clear authentication
GET  /api/auth/me        # Get current user info
```

### Task Endpoints
```
GET    /api/tasks        # Get user's tasks
POST   /api/tasks        # Create new task
PUT    /api/tasks/[id]   # Update existing task
DELETE /api/tasks/[id]   # Delete task
```

## 👨‍💻 Author

**Preet** - [@Preet2099x](https://github.com/Preet2099x)

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
