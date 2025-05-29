#!/usr/bin/env node

const axios = require('axios');

// n8n API configuration  
const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

// Create axios instance
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

async function fixGetLogsWorkflow() {
  console.log('🔧 Fixing DB Get Logs workflow...\n');
  
  try {
    // 1. Create a working DB Get Logs workflow (without active field)
    console.log('🔧 Creating new working DB Get Logs workflow...');
    
    const workflowData = {
      name: "DB Get Logs Fixed",
      nodes: [
        {
          parameters: {
            httpMethod: "GET",
            path: "get-logs-db",
            responseMode: "responseNode",
            options: {}
          },
          id: "webhook1",
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [280, 300],
          webhookId: "get-logs-fixed"
        },
        {
          parameters: {
            operation: "executeQuery",
            query: "SELECT * FROM daily_logs ORDER BY created_at DESC LIMIT 50",
            additionalFields: {}
          },
          id: "postgres1",
          name: "Get from Database",
          type: "n8n-nodes-base.postgres",
          typeVersion: 1,
          position: [500, 300],
          credentials: {
            postgres: {
              id: "A9lAUI2oMIYjgm3K",
              name: "Postgres account"
            }
          }
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: `{
  "status": "success",
  "logs": {{ $json }},
  "count": {{ $json.length || 0 }}
}`,
            options: {}
          },
          id: "respond1",
          name: "Return Data",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1,
          position: [720, 300]
        }
      ],
      connections: {
        "Webhook": {
          main: [
            [
              {
                node: "Get from Database",
                type: "main",
                index: 0
              }
            ]
          ]
        },
        "Get from Database": {
          main: [
            [
              {
                node: "Return Data",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      settings: {}
    };
    
    const createResponse = await n8nApi.post('/workflows', workflowData);
    const newWorkflowId = createResponse.data.id;
    console.log(`✅ Created new workflow: ${newWorkflowId}`);
    
    // 2. Now activate it using the correct API endpoint
    console.log('\n🔄 Activating new workflow...');
    try {
      // Use the activation endpoint
      await n8nApi.post(`/workflows/${newWorkflowId}/activate`);
      console.log('✅ Activated new workflow');
    } catch (activateError) {
      // Fallback to PUT method
      try {
        const workflow = createResponse.data;
        workflow.active = true;
        await n8nApi.put(`/workflows/${newWorkflowId}`, workflow);
        console.log('✅ Activated new workflow (fallback method)');
      } catch (putError) {
        console.log('⚠️  Could not activate automatically - activate manually in n8n UI');
      }
    }
    
    // 3. Deactivate the old broken workflow
    console.log('\n🔄 Deactivating old broken workflow...');
    try {
      const currentWorkflowId = 'X9RkVAmKsXDr526f';
      await n8nApi.post(`/workflows/${currentWorkflowId}/deactivate`);
      console.log('✅ Deactivated old workflow');
    } catch (error) {
      console.log('⚠️  Could not deactivate old workflow (may already be inactive)');
    }
    
    // 4. Wait for webhook registration
    console.log('\n⏳ Waiting for webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. Test the new endpoint
    console.log('\n🧪 Testing new get-logs endpoint...');
    try {
      const testResponse = await axios.get('http://localhost:5678/webhook/get-logs-db');
      console.log(`✅ Success: ${testResponse.status}`);
      console.log('Response preview:', JSON.stringify(testResponse.data).substring(0, 200) + '...');
      
      if (testResponse.data && testResponse.data.logs) {
        console.log(`📊 Found ${testResponse.data.count || 0} log entries`);
        console.log('\n🎉 SUCCESS! The get-logs endpoint is now working!');
      } else if (testResponse.data.message === "Workflow was started") {
        console.log('\n⚠️  Still getting "Workflow was started" - manual activation needed');
        console.log('📝 Go to n8n UI and manually activate "DB Get Logs Fixed" workflow');
      }
  } catch (error) {
      console.log(`❌ Test failed: ${error.response?.status} - ${error.message}`);
    if (error.response?.data) {
        console.log('Error data:', JSON.stringify(error.response.data));
      }
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. If webhook still not working, manually activate "DB Get Logs Fixed" in n8n UI');
    console.log('2. Test your frontend - logs should now display!');
    console.log('3. Restart frontend if needed: docker-compose restart frontend');
    
  } catch (error) {
    console.error('❌ Error fixing workflow:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the fix
fixGetLogsWorkflow(); 