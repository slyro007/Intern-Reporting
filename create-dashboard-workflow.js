const N8nApiClient = require('./n8n-api-client');

async function createDashboardDataWorkflow() {
  const client = new N8nApiClient();
  
  // Test connection first
  const connected = await client.testConnection();
  if (!connected) {
    console.error('Cannot connect to n8n API');
    return;
  }

  const workflowData = {
    name: "Dashboard Data Provider",
    active: true,
    nodes: [
      {
        parameters: {
          httpMethod: "GET",
          path: "get-logs",
          options: {}
        },
        id: "webhook",
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [240, 300],
        webhookId: "get-logs"
      },
      {
        parameters: {
          respondWith: "json",
          responseBody: `{
  "status": "success",
  "data": [
    {
      "id": 1,
      "date": "2025-05-29",
      "internName": "Srujan Jalagam",
      "projectDescription": "Computer setups using immy.bot",
      "tasksCompleted": "Configured 8 new workstations",
      "timeSpent": "8",
      "challenges": "Driver compatibility issues",
      "notes": "Learned about Group Policy",
      "timestamp": "2025-05-29T16:30:00.000Z"
    }
  ],
  "totalCount": 1
}`,
          responseHeaders: {
            entries: [
              {
                name: "Access-Control-Allow-Origin",
                value: "*"
              }
            ]
          }
        },
        id: "response",
        name: "Response",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [460, 300]
      }
    ],
    connections: {
      "Webhook": {
        main: [
          [
            {
              node: "Response",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    }
  };

  try {
    const workflow = await client.createWorkflow(workflowData);
    console.log('\n🎯 Dashboard Data Workflow Created!');
    console.log(`Workflow ID: ${workflow.id}`);
    console.log(`Webhook URL: http://localhost:5678/webhook/get-logs`);
    
    return workflow;
  } catch (error) {
    console.error('❌ Error creating workflow:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Try to get existing workflows to see the correct format
    console.log('\n🔍 Checking existing workflow structure...');
    try {
      const workflows = await client.getWorkflows();
      if (workflows.length > 0) {
        const existingWorkflow = await client.getWorkflow(workflows[0].id);
        console.log('Sample workflow structure:', JSON.stringify(existingWorkflow.nodes[0], null, 2));
      }
    } catch (e) {
      console.error('Error getting existing workflows:', e.message);
    }
  }
}

// Run the script
createDashboardDataWorkflow(); 