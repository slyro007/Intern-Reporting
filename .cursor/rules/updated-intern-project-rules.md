# Wolff Logics Intern Tracking System - Updated Cursor Rules

## Project Overview
Building a self-hosted tracking system for interns at Wolff Logics MSP. Interns primarily work on computer setups using immy.bot. System logs daily/weekly updates, generates AI summaries, and produces final reports.

## Technical Stack & Architecture

### Database (PostgreSQL - CRITICAL)
- **ALWAYS use PostgreSQL** instead of file storage for reliability
- Use Docker containers with PostgreSQL 15-alpine
- Include Adminer for database administration at port 8080
- Connection: server=database, username=intern_user, password=intern_password123, database=intern_tracker

### Database Schema & Best Practices
- Tables: users, daily_logs, self_evaluations, weekly_summaries, final_reports
- Use snake_case in database (intern_email, log_date, created_at)
- Map to camelCase in frontend (internEmail, logDate, createdAt)
- **NEVER manually set ID fields** - let PostgreSQL auto-generate with SERIAL
- Include foreign key relationships and proper indexes
- Use `{{ $now }}` for created_at and updated_at timestamps in n8n

### n8n Workflow Management
- Prefer manual workflow creation in UI over API imports for webhook reliability
- Configure PostgreSQL credentials first, then create workflows
- Use webhook paths like 'daily-logs-db', 'get-logs-db', 'submit-self-evaluation'
- PostgreSQL node expressions: `{{ $('Webhook').item.json.body.fieldName }}`
- **ALWAYS export workflows before changes** using export-all-workflows.js
- Commit exported workflows to git for backup

### Frontend Architecture (React)
- Configure proxy in package.json to redirect /webhook/* to n8n
- Use relative paths for API calls, not absolute localhost URLs
- Handle n8n data structure: `logsData.map(item => item.json || item)`
- Implement proper error handling with try-catch blocks
- Use Array.isArray() checks for data processing

## UI Design System & Standards

### Layout Architecture
- **Sidebar Navigation**: Collapsible sidebar (w-96 expanded, w-16 collapsed)
- **Main Content Area**: Full-width utilization with centered content containers
- **Header System**: Three-column layout (empty left, centered title, user info right)

### Sidebar Design Standards
- **Logo**: Use `/wolff-logics-logo.png` (same as login screen)
- **Logo Sizing**: h-16 expanded, h-6 collapsed with smooth transitions
- **Width**: w-96 (384px) expanded, w-16 (64px) collapsed
- **Navigation**: Clean icon-based navigation with tooltips when collapsed
- **Transitions**: `transition-all duration-300 ease-in-out`

### Header Layout Standards
- **Logo Position**: Top of sidebar, centered, above "Intern Dashboard" title
- **Page Headers**: Centered titles with descriptive subtitles
- **User Controls**: Far right positioning with theme toggle and logout
- **Layout**: Use `flex-1` containers for proper spacing and centering

### Color Scheme & Visual Hierarchy
- **Background**: `bg-gray-50 dark:bg-gray-900` for main areas
- **Cards**: `bg-white dark:bg-gray-800` with proper border and shadow
- **Gradient Cards**: Color-coded content sections:
  - Purple gradients for project descriptions 🚀
  - Green gradients for tasks completed ✅ 
  - Orange/yellow gradients for challenges ⚠️
  - Blue gradients for notes/learnings 📝🎯

### Interactive Elements
- **Hover Effects**: `transform hover:scale-[1.02]` for cards
- **Buttons**: Proper focus states and transition effects
- **Responsive Design**: Maintain layout integrity across screen sizes
- **Loading States**: Implement loading spinners and disabled states

### Typography & Spacing
- **Headers**: `text-2xl font-bold` for page titles
- **Subheadings**: `text-sm text-gray-600 dark:text-gray-400` for descriptions
- **Card Content**: Consistent padding with `p-6` for main content, `p-3` for sections
- **Spacing**: Use `space-y-6` for card layouts, `space-x-4` for inline elements

## Data Structure Standards

### Daily Logs Schema
```javascript
{
  intern_email: string,
  intern_name: string,
  log_date: date,
  project_description: text,
  tasks_completed: text,
  time_spent: decimal,
  challenges: text,
  notes: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Self-Evaluations Schema
```javascript
{
  intern_email: string,
  intern_name: string,
  week_start_date: date,
  week_end_date: date,
  accomplishments: text,
  challenges: text,
  learnings: text,
  goals: text,
  productivity: integer(1-5),
  created_at: timestamp,
  updated_at: timestamp
}
```

## Development Workflow

### Testing & Validation
- Create test scripts for all endpoints (test-new-endpoint.js pattern)
- Test both POST submissions and GET retrievals
- Verify data saves to database before troubleshooting frontend
- Use comprehensive testing that checks: container status, database connectivity, webhook registration

### Error Handling Patterns
- 'duplicate key constraint' = remove id field from INSERT
- 'webhook not registered' = check HTTP method mismatch
- 'Cannot read properties of undefined' = check data structure mapping
- 'CORS errors' = check proxy configuration

### Git & Version Control
- Export n8n workflows before major changes
- Use feature branches for new functionality
- Write descriptive commit messages explaining both technical and business changes
- Keep separate branches for UI improvements, workflow updates, admin features

## Admin Dashboard Requirements

### Admin Features to Implement
- View all intern logs and evaluations across the system
- Generate AI-powered weekly summaries using OpenAI integration
- Export comprehensive reports for management review
- User management (add/remove interns, reset passwords)
- System health monitoring and workflow status

### AI Integration Planning
- Use n8n's OpenAI node for generating summaries
- Create prompts for weekly progress summaries
- Generate polished final reports from collected data
- Implement summary scheduling and automation

### Admin UI Standards
- **Maintain consistent design** with intern dashboard
- **Use same sidebar navigation pattern** with admin-specific menu items
- **Implement data tables** with sorting, filtering, and pagination
- **Add export functionality** with multiple format options (PDF, CSV, etc.)
- **Include dashboard widgets** showing key metrics and statistics

## Future Integration Notes
- Structure project for easy Teams integration (planned for v2)
- Keep API endpoints RESTful for future mobile app integration
- Design database schema to support multi-tenant scenarios
- Plan for automated report generation and email notifications

## Performance & Security
- Use database indexes on frequently queried fields (intern_email, log_date)
- Limit query results with LIMIT clauses
- Implement proper input validation at all levels
- Use environment variables for sensitive configuration
- Plan for data backup and recovery procedures

## Deployment Standards
- Docker Compose with proper service dependencies
- Database must start first, then n8n and frontend
- Use volumes for data persistence
- Implement health checks for all services
- Include proper environment variable management

## Quality Assurance
- Implement auto-dismissing success messages (3-second timeout)
- Provide clear user feedback for all actions
- Use icons and emojis for visual appeal
- Maintain consistent loading states and error handling
- Test responsive design across different screen sizes 