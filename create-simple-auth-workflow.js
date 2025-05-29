const N8nApiClient = require('./n8n-api-client');

async function createSimpleAuthWorkflow() {
  const client = new N8nApiClient();
  
  // Test connection first
  const connected = await client.testConnection();
  if (!connected) {
    console.error('Cannot connect to n8n API');
    return;
  }

  // Create a simple login workflow based on the working CORS workflow structure
  const loginWorkflow = {
    name: "Simple User Login",
    active: true,
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "auth-login",
          options: {}
        },
        id: "webhook",
        name: "Login Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [240, 300],
        webhookId: "auth-login"
      },
      {
        parameters: {
          respondWith: "json",
          responseBody: `{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_001",
    "name": "Srujan Jalagam", 
    "email": "srujan@wolfflogics.com",
    "role": "intern"
  }
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
        name: "Login Response",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [460, 300]
      }
    ],
    connections: {
      "Login Webhook": {
        main: [
          [
            {
              node: "Login Response",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    }
  };

  try {
    console.log('🔑 Creating Simple Login Workflow...');
    const workflow = await client.createWorkflow(loginWorkflow);
    console.log(`✅ Login workflow created! ID: ${workflow.id}`);
    console.log(`🚪 Login endpoint: http://localhost:5678/webhook/auth-login`);
    
    return workflow;
  } catch (error) {
    console.error('❌ Error creating workflow:');
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run the script
createSimpleAuthWorkflow(); 