# Wolff Logics - Intern Tracking System

A self-hosted Docker-based system for tracking intern progress, generating weekly summaries, and producing final reports.

## 🚀 Features

### ✅ Current Features
- **Multi-user Authentication System** with email registration
- **Daily Progress Logging** with structured data collection
- **Real-time Data Storage** using JSON files
- **Professional UI** with Wolff Logics branding
- **Docker-based Deployment** for easy setup and portability
- **n8n Automation Platform** for workflow management
- **AI-Powered Report Generation** using OpenAI GPT-4
- **Weekly Summary Generation** with automated data analysis
- **Comprehensive Final Reports** for performance evaluation

### 📊 Data Collection
- Daily work descriptions and tasks completed
- Time tracking with hours worked
- Challenge identification and problem-solving notes
- Additional learning observations
- User attribution and timestamp tracking

### 🤖 AI Features
- **Weekly Summaries**: Automated analysis of the past 7 days
- **Final Reports**: Comprehensive performance evaluations
- **Statistical Analysis**: Hours, productivity trends, and growth patterns
- **Professional Formatting**: Management-ready markdown reports

## 🏗️ System Architecture

- **Frontend**: React app with Tailwind CSS (port 3000)
- **Backend**: n8n automation platform (port 5678)
- **Data Storage**: JSON files in `/data` directory
- **AI Integration**: OpenAI for weekly summaries and reports

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key (for AI summaries)

### Setup
1. Clone this repository
2. Start the services:
   ```bash
   docker-compose up -d
   ```
3. Access the applications:
   - **Frontend (Intern Log Form)**: http://localhost:3000
   - **n8n (Automation Backend)**: http://localhost:5678

### First Time Setup in n8n

1. Open http://localhost:5678
2. Complete the initial n8n setup (create admin account)
3. Import the workflow templates from `/n8n-workflows/`
4. Configure your OpenAI API credentials in n8n settings

## 📁 Project Structure

```
intern-reports/
├── frontend/                 # React app for logging
│   ├── src/
│   │   ├── App.js            # Main form component
│   │   ├── App.css           # Tailwind styles
│   │   └── index.js          # React entry point
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── data/                     # Data storage
│   ├── logs/                 # Daily log entries (JSON)
│   ├── summaries/           # Weekly AI summaries
│   └── reports/             # Final intern reports
├── n8n-workflows/           # n8n workflow templates
├── docker-compose.yml       # Docker services configuration
└── README.md
```

## 🔄 Workflow Overview

### Daily Logging
1. Intern fills out form at http://localhost:3000
2. Form submits to n8n webhook (`/webhook/intern-logs`)
3. n8n saves log entry to `/data/logs/YYYY-MM-DD.json`

### Weekly Summaries
1. n8n runs scheduled workflow every Sunday
2. Collects all logs from the past week
3. Sends to OpenAI for summary generation
4. Saves summary to `/data/summaries/week-XX-YYYY.json`

### Final Reports
1. Manual trigger in n8n (or scheduled at internship end)
2. Collects all logs and summaries
3. Generates comprehensive final report
4. Saves to `/data/reports/final-report-YYYY-MM-DD.pdf`

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# n8n Configuration
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_HOST=localhost

# Frontend Configuration
REACT_APP_N8N_WEBHOOK_URL=http://localhost:5678/webhook/intern-logs
```

### Webhook Configuration

The frontend is pre-configured to send data to:
- **Webhook URL**: `http://localhost:5678/webhook/intern-logs`
- **Method**: POST
- **Data Format**: JSON

**Expected payload structure:**
```json
{
  "date": "2024-01-15",
  "internName": "John Doe",
  "projectDescription": "Computer setups with immy.bot",
  "tasksCompleted": "Configured 5 new workstations...",
  "timeSpent": "8",
  "challenges": "Had issues with network configuration...",
  "notes": "Learned about Group Policy settings...",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "week": 3
}
```

## 📋 n8n Workflow Setup

You'll need to create these workflows in n8n:

### 1. **Log Receiver Workflow**
- **Trigger**: Webhook (intern-logs)
- **Function**: Save incoming logs to JSON files
- **File naming**: `/data/logs/YYYY-MM-DD_intern-name.json`

### 2. **Weekly Summary Workflow**
- **Trigger**: Schedule (Sundays at 9 PM)
- **Function**: 
  - Read all logs from past week
  - Send to OpenAI for summarization
  - Save summary to `/data/summaries/`

### 3. **Final Report Workflow**
- **Trigger**: Manual/Webhook
- **Function**:
  - Collect all logs and summaries
  - Generate comprehensive report
  - Save as PDF/Markdown

## 🔧 Development

### Running Locally

```bash
# Start all services
docker-compose up

# Rebuild frontend after changes
docker-compose up --build frontend

# View logs
docker-compose logs -f
```

### Customization

#### Frontend Form Fields
Edit `frontend/src/App.js` to modify:
- Form fields
- Validation rules
- Styling
- Webhook endpoint

#### Data Structure
Modify the JSON structure in the webhook payload to match your tracking needs.

## 📊 AI Prompt Templates

### Weekly Summary Prompt
```
Please analyze the following intern logs from the past week and create a professional summary including:

1. **Key Accomplishments**: Main tasks completed
2. **Project Progress**: Areas of focus and advancement
3. **Challenges Overcome**: Problems solved and lessons learned
4. **Skills Developed**: Technical and professional growth
5. **Time Analysis**: Productivity and efficiency insights
6. **Recommendations**: Suggestions for the following week

Logs:
[INSERT_WEEKLY_LOGS]

Format the response as a structured report suitable for management review.
```

### Final Report Prompt
```
Based on the complete internship logs and weekly summaries provided, generate a comprehensive final report covering:

1. **Executive Summary**: Overall internship outcomes
2. **Project Portfolio**: Complete list of projects and contributions
3. **Skills Development Timeline**: Technical and soft skills progression
4. **Performance Analysis**: Productivity trends and improvements
5. **Key Achievements**: Most significant accomplishments
6. **Growth Areas**: Challenges faced and overcome
7. **Future Recommendations**: Career development suggestions
8. **Manager Assessment**: Professional readiness evaluation

Include specific examples and metrics where possible.

Data:
[INSERT_ALL_LOGS_AND_SUMMARIES]
```

## 🚀 Future Enhancements

- [ ] Microsoft Teams integration for notifications
- [ ] Dashboard with charts and analytics
- [ ] Email automation for weekly summaries
- [ ] Photo/document attachments
- [ ] Multi-intern support
- [ ] Export to various formats (PDF, Excel, etc.)

## 🆘 Troubleshooting

### Common Issues

**Frontend can't connect to n8n**
- Check if n8n is running: `docker-compose ps`
- Verify webhook URL in environment variables
- Check CORS settings in n8n

**n8n workflows not triggering**
- Verify webhook paths match frontend configuration
- Check n8n logs: `docker-compose logs n8n`
- Test webhook manually with curl/Postman

**Data not saving**
- Check volume mounts in docker-compose.yml
- Verify write permissions on `/data` directory
- Review n8n workflow node configurations

### Support

For technical support with this tracking system, contact the Wolff Logics development team.

---

**Last Updated**: May 2025  
**Version**: 1.0.0  
**Developed for**: Wolff Logics MSP Intern Program
