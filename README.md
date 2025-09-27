# Routine Master

A full-stack MERN daily planner web application that helps users organize their daily routines, set goals, track progress, and maintain a personal diary.

## Features

- **Task Management**: Create, view, edit, and delete tasks with priority levels and status tracking
- **Goal Setting**: Set and track progress on personal goals with deadline management
- **Interactive Calendar**: View tasks and goals in a calendar format
- **Progress Tracking**: Visualize productivity with charts and statistics
- **Daily Diary**: Write and manage daily journal entries with mood tracking
- **User Authentication**: Secure JWT-based authentication system
- **Dark/Light Mode**: Toggle between themes with persistent user preferences
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Technology Stack

### Frontend
- React.js 18
- React Router DOM for navigation
- Tailwind CSS for styling
- Chart.js for data visualization
- React Calendar for calendar functionality
- Axios for API calls
- React Hot Toast for notifications

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation
- CORS for cross-origin requests

## Project Structure

```
routinemaster/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── goalController.js
│   │   ├── diaryController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Goal.js
│   │   └── Diary.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── goals.js
│   │   ├── diary.js
│   │   └── users.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── pages/
    │   │   ├── Landing.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Tasks.js
    │   │   ├── Goals.js
    │   │   ├── Calendar.js
    │   │   ├── Progress.js
    │   │   ├── Diary.js
    │   │   ├── Profile.js
    │   │   └── Settings.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/routinemaster
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend application will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/stats` - Get task statistics

### Goals
- `GET /api/goals` - Get all goals for user
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal

### Diary
- `GET /api/diary` - Get diary entries
- `POST /api/diary` - Create a new diary entry
- `PUT /api/diary/:id` - Update a diary entry
- `DELETE /api/diary/:id` - Delete a diary entry

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences

## Database Models

### User Model
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- avatar: String (optional)
- preferences: Object (theme, notifications)
- timestamps: createdAt, updatedAt

### Task Model
- title: String (required)
- description: String (optional)
- dueDate: Date (required)
- status: String (pending, in-progress, completed)
- priority: String (low, medium, high)
- userId: ObjectId (reference to User)
- timestamps: createdAt, updatedAt

### Goal Model
- title: String (required)
- description: String (optional)
- deadline: Date (required)
- completed: Boolean (default: false)
- progress: Number (0-100)
- userId: ObjectId (reference to User)
- timestamps: createdAt, updatedAt

### Diary Model
- date: Date (required)
- content: String (required)
- mood: String (excellent, good, okay, bad, terrible)
- userId: ObjectId (reference to User)
- timestamps: createdAt, updatedAt

## Features in Detail

### Authentication System
- JWT-based authentication with secure password hashing
- Protected routes requiring authentication
- Persistent login state with token storage
- User registration and login forms with validation

### Task Management
- CRUD operations for tasks
- Task filtering by status and priority
- Task sorting by due date, priority, or creation date
- Status updates (pending, in-progress, completed)
- Priority levels (low, medium, high)

### Goal Setting
- Create goals with deadlines
- Progress tracking with percentage completion
- Visual progress bars
- Goal completion status

### Calendar Integration
- Interactive calendar view
- Display tasks and goals by date
- Monthly statistics
- Event indicators on calendar dates

### Progress Tracking
- Dashboard with key statistics
- Weekly progress charts
- Task completion rates
- Goal achievement metrics
- Productivity insights

### Daily Diary
- Create daily journal entries
- Mood tracking with emojis
- Monthly filtering of entries
- Rich text content support

### User Preferences
- Dark/light theme toggle
- Notification preferences
- Profile management with avatar support
- Settings persistence

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@routinemaster.com or create an issue in the repository.

## Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the utility-first CSS framework
- Chart.js for data visualization capabilities
- MongoDB for the flexible database solution