# Riverside College E-Learning Platform

A comprehensive full-stack e-learning application built for Riverside College with role-based access control for Admins, Teachers, and Students.

## Features

### Admin Dashboard
- User Management (Create, Edit, Delete users)
- Video Management (Upload and manage all videos)
- Result Management (Upload and manage student results)
- System Overview (Statistics and activity logs)
- Announcement System (School-wide announcements)

### Teacher Dashboard
- Video Uploads (Class-specific video lessons)
- Assignment & Test Creation (PDF uploads or CBT quizzes)
- Result Upload (Class-specific results)
- Class Announcements (Class-only announcements)

### Student Dashboard
- Performance Overview (Scores and progress tracking)
- Class Videos (Access to class-specific videos)
- Results Access (View uploaded results)
- Assignment Submission (PDF downloads and CBT attempts)
- Announcements (School-wide and class-specific)

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing
- Multer for file uploads

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup
1. Create a PostgreSQL database named `riverside_college`
2. Run the schema file to create tables:
   ```bash
   psql -U postgres -d riverside_college -f server/database/schema.sql
   ```

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the database credentials and other settings:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=riverside_college
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the frontend (http://localhost:5173) and backend (http://localhost:5000) servers concurrently.

## Default Login Credentials

- **Admin**: admin@riverside.edu / admin123
- **Teacher**: teacher@riverside.edu / teacher123  
- **Student**: student@riverside.edu / student123

## Class Levels
- JSS1, JSS2, JSS3 (Junior Secondary School)
- SSS1, SSS2, SSS3 (Senior Secondary School)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset user password

### Videos
- `GET /api/videos` - Get videos (filtered by role)
- `POST /api/videos` - Create video (Admin/Teacher)
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Assignments
- `GET /api/assignments` - Get assignments (filtered by role)
- `POST /api/assignments` - Create assignment (Admin/Teacher)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Results
- `GET /api/results` - Get results (filtered by role)
- `POST /api/results` - Create result (Admin/Teacher)
- `PUT /api/results/:id` - Update result
- `DELETE /api/results/:id` - Delete result

### Announcements
- `GET /api/announcements` - Get announcements (filtered by role)
- `POST /api/announcements` - Create announcement (Admin/Teacher)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities

## Security Features
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- SQL injection protection
- CORS configuration

## Development
- Frontend runs on port 5173
- Backend runs on port 5000
- Hot reload enabled for both frontend and backend
- ESLint configured for code quality

## Production Deployment
1. Build the frontend: `npm run build`
2. Set NODE_ENV=production in your environment
3. Configure your production database
4. Deploy both frontend build and backend server

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.