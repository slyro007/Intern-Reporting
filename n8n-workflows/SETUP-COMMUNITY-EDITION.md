# n8n Community Edition Setup Guide

Since you're using n8n Community Edition (which doesn't support external credential storage), here's how to set up the workflows using environment variables.

## 🔑 Environment Variables Setup

Your OpenAI API key is already in the `.env` file, which gets passed to the n8n container via Docker Compose. In n8n Community Edition, you'll use these environment variables directly in your workflow expressions.

## 📋 Step-by-Step Workflow Setup

### 1. Start Your System
```bash
./start.ps1  # Windows
# or
./start.sh   # Linux/Mac
```

### 2. Access n8n
1. Open http://localhost:5678
2. Complete the initial setup (create admin account)
3. You'll be taken to the n8n dashboard

### 3. Import the Log Receiver Workflow

1. **Import Workflow**:
   - Click "Add workflow" or the "+" button
   - Select "Import from file"
   - Choose `log-receiver-workflow.json` from the `n8n-workflows` folder
   - Click "Import"

2. **Activate the Workflow**:
   - Once imported, click the toggle switch to activate it
   - The webhook will now be available at: `http://localhost:5678/webhook/intern-logs`

### 4. Test the Frontend Connection

1. Open http://localhost:3000
2. Fill out the form for Srujan
3. Submit it
4. Check if the log file appears in your `data/logs/` directory

## 🤖 Setting Up AI Summaries (Optional for v1)

Since you can't store OpenAI credentials in n8n Community Edition, here are your options for AI summaries:

### Option A: Use HTTP Request Node with API Key in Environment
You can create a workflow that uses the HTTP Request node to call OpenAI directly:

```javascript
// In an HTTP Request node, use this URL:
https://api.openai.com/v1/chat/completions

// Headers:
{
  "Authorization": "Bearer {{ $env.OPENAI_API_KEY }}",
  "Content-Type": "application/json"
}

// Body (in JSON format):
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system", 
      "content": "You are an AI assistant that creates professional weekly summaries of intern progress logs."
    },
    {
      "role": "user",
      "content": "Please analyze these intern logs and create a weekly summary: {{ $json.logs }}"
    }
  ],
  "max_tokens": 1000
}
```

### Option B: External Script Integration
Create a simple Python script that:
1. Reads log files from `data/logs/`
2. Calls OpenAI API using your key
3. Saves summaries to `data/summaries/`
4. Triggered by n8n via webhook or schedule

### Option C: Manual Summaries for Now
For v1, you could:
1. Manually collect weekly logs
2. Use ChatGPT web interface for summaries
3. Save them to `data/summaries/`
4. Automate this later when needed

## 🗂️ Expected File Structure

After running for a few days, your data directory should look like:

```
data/
├── logs/
│   ├── 2024-01-15_Srujan_Jalagam.json
│   ├── 2024-01-16_Srujan_Jalagam.json
│   └── 2024-01-17_Srujan_Jalagam.json
├── summaries/
│   └── (will be created when you add AI workflows)
└── reports/
    └── (for final reports)
```

## 🧪 Testing Your Setup

### Test the Webhook
You can test the webhook directly using curl:

```bash
curl -X POST http://localhost:5678/webhook/intern-logs \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "internName": "Srujan Jalagam", 
    "projectDescription": "Testing webhook",
    "tasksCompleted": "Set up intern tracking system",
    "timeSpent": "2",
    "challenges": "Learning n8n workflow setup",
    "notes": "System working great!",
    "timestamp": "2024-01-15T10:00:00.000Z",
    "week": 3
  }'
```

### Expected Response
```json
{
  "status": "success",
  "message": "Log entry saved successfully", 
  "filename": "2024-01-15_Srujan_Jalagam.json"
}
```

## 🔧 Troubleshooting

### Webhook Not Working
1. Check if the workflow is activated (toggle switch on)
2. Verify the webhook path is `/intern-logs`
3. Check n8n logs: `docker-compose logs n8n`

### File Not Saving
1. Verify the `/data` directory exists and is writable
2. Check the docker volume mount in `docker-compose.yml`
3. Look at the n8n execution logs in the workflow

### Frontend Can't Connect
1. Make sure both services are running: `docker-compose ps`
2. Verify the webhook URL in your `.env` file
3. Check browser console for CORS errors

## 📈 Next Steps

1. **Get the basic logging working first** - this is your v1
2. **Add manual weekly summaries** - copy/paste logs into ChatGPT
3. **Later**: Automate summaries with HTTP Request nodes or external scripts
4. **Future**: Add Teams integration, dashboards, etc.

## 💡 Pro Tips

- **Keep it simple for v1** - focus on reliable daily logging
- **Test thoroughly** - make sure Srujan can submit logs easily  
- **Monitor the data** - check that log files are being created properly
- **Plan for growth** - the structure supports future automation

Remember: The goal is to track Srujan's progress effectively. The AI summaries are nice-to-have but the daily logs are the core value! 