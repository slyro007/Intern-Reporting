const axios = require('axios');

const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';
const N8N_BASE_URL = 'http://localhost:5678';

const workflowData = {
  "name": "Self Evaluation DB Working",
  "nodes": [
    {
      "parameters": {
        "path": "submit-self-evaluation",
        "httpMethod": "POST",
        "options": {
          "noResponseBody": false
        }
      },
      "id": "webhook-trigger",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [260, 240]
    },
    {
      "parameters": {
        "operation": "insert",
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public"
        },
        "table": {
          "__rl": true,
          "mode": "list",
          "value": "self_evaluations"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "intern_email": "={{ $('Webhook').item.json.body.internEmail }}",
            "intern_name": "={{ $('Webhook').item.json.body.internName }}",
            "week_start_date": "={{ $('Webhook').item.json.body.weekStartDate }}",
            "week_end_date": "={{ $('Webhook').item.json.body.weekEndDate }}",
            "accomplishments": "={{ $('Webhook').item.json.body.accomplishments }}",
            "challenges": "={{ $('Webhook').item.json.body.challenges }}",
            "learnings": "={{ $('Webhook').item.json.body.learnings }}",
            "goals": "={{ $('Webhook').item.json.body.goals }}",
            "productivity_rating": "={{ parseInt($('Webhook').item.json.body.productivity) }}",
            "created_at": "={{ $now }}",
            "updated_at": "={{ $now }}"
          }
        },
        "options": {}
      },
      "id": "postgres-insert",
      "name": "PostgreSQL",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.4,
      "position": [480, 240],
      "credentials": {
        "postgres": {
          "id": "postgres-credentials",
          "name": "PostgreSQL account"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "condition-success",
              "leftValue": "={{ $('PostgreSQL').item.json.rowCount }}",
              "rightValue": 1,
              "operator": {
                "type": "number",
                "operation": "equals"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "id": "check-insert-success",
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [700, 240]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{\"status\": \"success\", \"message\": \"Self-evaluation submitted successfully! 📊\", \"data\": {{ JSON.stringify($('PostgreSQL').item.json) }}}",
        "options": {}
      },
      "id": "success-response",
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, 180]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{\"status\": \"error\", \"message\": \"Failed to save self-evaluation. Please try again.\"}",
        "options": {}
      },
      "id": "error-response",
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "PostgreSQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PostgreSQL": {
      "main": [
        [
          {
            "node": "Check Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Success": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Response",
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

async function createWorkflow() {
  try {
    console.log('🚀 Creating working self-evaluation workflow...');

    // First, try to delete any existing self-evaluation workflows to avoid conflicts
    try {
      const existingWorkflows = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      for (const workflow of existingWorkflows.data.data) {
        if (workflow.name.includes('Self Evaluation') || workflow.name.includes('self-evaluation')) {
          console.log(`🗑️ Deleting existing workflow: ${workflow.name} (${workflow.id})`);
          await axios.delete(`${N8N_BASE_URL}/api/v1/workflows/${workflow.id}`, {
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY
            }
          });
        }
      }
    } catch (deleteError) {
      console.log('⚠️ Could not clean up existing workflows (this is OK)');
    }

    // Create the new workflow
    const response = await axios.post(`${N8N_BASE_URL}/api/v1/workflows`, workflowData, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Successfully created workflow: ${response.data.name} (ID: ${response.data.id})`);
    console.log(`📍 Webhook URL: http://localhost:5678/webhook/submit-self-evaluation`);
    
    // Activate the workflow
    await axios.post(`${N8N_BASE_URL}/api/v1/workflows/${response.data.id}/activate`, {}, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    console.log('✅ Workflow activated successfully!');
    console.log('\n📋 Manual Setup Required:');
    console.log('1. Go to n8n UI: http://localhost:5678');
    console.log('2. Open the "Self Evaluation DB Working" workflow');
    console.log('3. Click on the PostgreSQL node');
    console.log('4. Set up credentials if not already configured:');
    console.log('   - Host: database');
    console.log('   - Port: 5432');
    console.log('   - Database: intern_tracker');
    console.log('   - User: intern_user');
    console.log('   - Password: intern_password123');
    console.log('5. Save and test the workflow');

    return response.data;
  } catch (error) {
    console.error('❌ Error creating workflow:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('   Details:', error.response.data.message);
    }
    throw error;
  }
}

if (require.main === module) {
  createWorkflow().catch(console.error);
}

module.exports = { createWorkflow }; 