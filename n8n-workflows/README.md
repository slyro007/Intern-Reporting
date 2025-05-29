# n8n Workflow Templates

This directory contains workflow templates for the intern tracking system.

## Setup Instructions

1. Start your Docker services: `docker-compose up -d`
2. Open n8n at http://localhost:5678
3. Complete the initial setup (create admin account)
4. Import these workflow templates
5. Configure your OpenAI API credentials

## Workflow Files

### 1. `log-receiver-workflow.json`
**Purpose**: Receives webhook data from the frontend form and saves daily logs.

**Setup**:
- Import this workflow first
- Activate the webhook trigger
- Note the webhook URL (should be `/webhook/intern-logs`)

### 2. `weekly-summary-workflow.json`
**Purpose**: Runs weekly to generate AI summaries of recent logs.

**Setup**:
- Requires OpenAI API key
- Set schedule for Sundays at 9 PM
- Customize the summary prompt as needed

### 3. `final-report-workflow.json`
**Purpose**: Generates comprehensive final intern reports.

**Setup**:
- Manual trigger or scheduled for internship end
- Requires OpenAI API key
- Outputs PDF or markdown format

## Import Instructions

1. In n8n, go to **Workflows** → **Import from File**
2. Select the JSON file for each workflow
3. Save and activate each workflow
4. Test webhooks with sample data

## Customization

- Edit the OpenAI prompts in the workflows to match your needs
- Adjust file naming conventions in the file write nodes
- Modify the schedule triggers as needed
- Add email notifications if desired

## Troubleshooting

- Check webhook URLs match frontend configuration
- Verify file permissions for the `/data` directory
- Test workflows manually before relying on automation 