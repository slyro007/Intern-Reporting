const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

async function createWorkingDailyLogsWorkflow() {
    console.log('🔧 Creating new working daily logs workflow...\n');
    
    const workflow = {
        "name": "Daily Logs Save to DB",
        "nodes": [
            {
                "parameters": {
                    "path": "daily-logs-db",
                    "httpMethod": "POST",
                    "responseMode": "responseNode",
                    "options": {}
                },
                "id": "webhook1",
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [200, 300]
            },
            {
                "parameters": {
                    "operation": "insert",
                    "schema": "public",
                    "table": "daily_logs",
                    "columns": "intern_email, intern_name, log_date, project_description, tasks_completed, time_spent, challenges, notes, created_at, updated_at",
                    "additionalFields": {},
                    "returnFields": "*"
                },
                "id": "postgres1",
                "name": "Save to Database",
                "type": "n8n-nodes-base.postgres",
                "typeVersion": 2.4,
                "position": [400, 300],
                "credentials": {
                    "postgres": {
                        "id": "postgres_credentials",
                        "name": "postgres account"
                    }
                }
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": {
                        "status": "success",
                        "message": "Daily log saved successfully",
                        "data": {
                            "intern_name": "={{ $json.intern_name }}",
                            "date": "={{ $json.log_date }}",
                            "project": "={{ $json.project_description }}"
                        }
                    },
                    "options": {}
                },
                "id": "response1",
                "name": "Return Success",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [600, 300]
            }
        ],
        "connections": {
            "Webhook": {
                "main": [
                    [
                        {
                            "node": "Save to Database",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Save to Database": {
                "main": [
                    [
                        {
                            "node": "Return Success",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        "active": true,
        "settings": {},
        "versionId": "1"
    };
    
    try {
        // Create the workflow
        const response = await axios.post('http://localhost:5678/api/v1/workflows', workflow, {
            headers: { 
                'X-N8N-API-KEY': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Created workflow:', response.data.data.name);
        console.log('🆔 Workflow ID:', response.data.data.id);
        
        // Activate the workflow
        const activateResponse = await axios.post(
            `http://localhost:5678/api/v1/workflows/${response.data.data.id}/activate`,
            {},
            {
                headers: { 'X-N8N-API-KEY': API_KEY }
            }
        );
        
        console.log('🚀 Workflow activated successfully!');
        
        // Test the new workflow
        console.log('\n🧪 Testing new workflow...');
        const testLog = {
            internEmail: 'test@wolfflogics.com',
            internName: 'Test User New',
            date: '2025-01-30',
            projectDescription: 'New workflow test',
            tasksCompleted: 'Testing new database save',
            timeSpent: '1.5',
            challenges: 'None',
            notes: 'Testing the new working workflow',
            timestamp: new Date().toISOString()
        };
        
        const testResponse = await axios.post('http://localhost:5678/webhook/daily-logs-db', testLog);
        console.log('✅ Test response:', testResponse.status, testResponse.data);
        
    } catch (error) {
        console.error('❌ Error creating workflow:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

createWorkingDailyLogsWorkflow(); 