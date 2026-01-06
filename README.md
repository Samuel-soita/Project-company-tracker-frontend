# Company Project Manager - Frontend

A modern React-based project management application for companies to manage team projects, departments, and project categories.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (Employee/Manager)
- Protected routes

### Employee Dashboard
- **My Projects Section**: View, edit, delete, and track projects you're assigned to
- **Company Projects Section**: View projects created by other team members (read-only)
- Create new projects with team member invitations via email
- Drag-and-drop Kanban board for project progress tracking

### Manager Dashboard
- **Projects Tab**: View and manage all company projects
- **Teams Tab**: Create, edit, and delete teams/departments
- **Project Types Tab**: Create, edit, and delete project categories (Web Apps, Mobile, Analytics, etc.)
- Full CRUD operations on all resources

### Project Management
- Create projects with description, GitHub link, and tags
- Invite team members via email (they receive email invitations)
- Track project progress with a drag-and-drop Kanban board
  - To Do
  - In Progress
  - Done
- View project details and team members
- Edit/delete projects (owner or admin only)

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **@dnd-kit** - Drag and drop functionality for Kanban board
- **Lucide React** - Icon library
- **Fetch API** - HTTP client

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp env.example .env
```

4. Update `.env` file with your backend API URL
```
VITE_API_URL=http://localhost:5000
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or `5174-5176` if 5173 is taken)

### Backend Requirements

⚠️ **IMPORTANT**: This frontend requires a backend server running on `http://localhost:5000`.

**For immediate development**: If you're getting CORS errors, your backend needs CORS configuration:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Sample Login Credentials
```javascript
// Manager (Admin access to all teams)
email: "manager@test.com"
password: "adminpass"

// Employees (limited to their assigned team)
email: "employee1@company.com"  // Frontend Team
password: "employeepass"

email: "employee2@company.com"  // Backend Team
password: "employeepass"
```

#### Available Teams & Project Types
```javascript
// Teams:
const teams = [
  { id: 1, name: "Frontend Team" },
  { id: 2, name: "Backend Team" }
];

// Project Types:
const projectTypes = [
  { id: 1, name: "Web Application" },
  { id: 2, name: "Mobile Development" },
  { id: 3, name: "Data Analytics" },
  { id: 4, name: "DevOps & Infrastructure" },
  { id: 5, name: "Product Management" },
  { id: 6, name: "Cybersecurity" }
];
```

See `BACKEND_SYNC_PROMPT.md` for complete backend requirements.

### Production Setup

⚠️ **IMPORTANT**: Before deploying to production, ensure your backend implements the security changes outlined in `BACKEND_SYNC_PROMPT.md`.

The frontend now uses httpOnly cookies for authentication instead of localStorage, requiring backend updates for secure production deployment.

### Development Notes

- **Backend Required**: The application requires a backend server running on `http://localhost:5000` for authentication and data operations.
- **Error Messages**: Network connection errors indicate the backend server is not running.
- **Security**: All authentication now uses secure httpOnly cookies (localStorage removed for security).
- **PWA Features**: The app includes service worker caching and can be installed as a PWA.
- **Code Splitting**: Route-based code splitting reduces initial bundle size.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage

### As an Employee

1. **Register/Login**
   - Create an account or login with existing credentials
   - Select "Employee" as your role during registration

2. **Dashboard**
   - View your projects in the "My Projects" section
   - View company projects in the "Company Projects" section

3. **Create a Project**
   - Click "New Project" button
   - Fill in project details (name, description, repository link, tags)
   - Add team members by email (they'll receive invitations)
   - Click "Create Project"

4. **Manage Your Projects**
   - Edit or delete your own projects
   - View project details and progress
   - Track tasks with the Kanban board (drag and drop)

5. **View Company Projects**
   - Browse projects from other team members
   - View their progress (read-only)

### As a Manager

1. **Login as Manager**
   - Use manager credentials to login

2. **Manage Projects**
   - View all company projects
   - Create, edit, or delete any project
   - Track progress for all projects

3. **Manage Teams**
   - Switch to "Teams" tab
   - Create new teams/departments
   - Edit or delete existing teams

4. **Manage Project Types**
   - Switch to "Project Types" tab
   - Create new project categories (e.g., Web Development, Mobile Apps, Data Analytics)
   - Edit or delete existing categories

## API Integration

The frontend communicates with the backend API using the Fetch API. All API calls are centralized in the `src/api` directory.

### Authentication
- JWT tokens are stored in localStorage
- Tokens are automatically attached to requests via the API client
- Automatic redirect to login on 401 Unauthorized

### Error Handling
- API errors are caught and displayed to users
- Network errors are handled gracefully

## Design

The UI is designed to match the Figma specifications with:
- Clean, modern interface
- Responsive design for mobile and desktop
- Consistent color scheme and typography
- Smooth transitions and hover effects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
