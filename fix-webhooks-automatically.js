const axios = require('axios');

const N8N_BASE_URL = 'http://localhost:5678';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

// Configure axios defaults
axios.defaults.headers.common['X-N8N-API-KEY'] = N8N_API_KEY;

// Workflow definitions
const workflows = {
  postLogs: {
    name: "Simple Working Logs Manual Auto",
    settings: {
      executionOrder: "v1"
    },
    nodes: [
      {
        "id": "webhook-1",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [240, 300],
        "parameters": {
          "httpMethod": "POST",
          "path": "simple-logs-post",
          "responseMode": "responseNode"
        }
      },
      {
        "id": "code-1", 
        "name": "Save Log",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [460, 300],
        "parameters": {
          "language": "javascript",
          "jsCode": "// Save the log data to a file\nconst fs = require('fs');\nconst path = require('path');\n\n// Get the data from the webhook\nconst logData = $input.first().json;\n\n// Create filename based on date and intern name\nconst date = logData.date || new Date().toISOString().split('T')[0];\nconst internName = (logData.internName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');\nconst timestamp = new Date().toISOString().replace(/[:.]/g, '-');\nconst filename = `${date}_${internName}_${timestamp}.json`;\n\n// Ensure logs directory exists\nconst logsDir = '/data/logs';\nif (!fs.existsSync(logsDir)) {\n  fs.mkdirSync(logsDir, { recursive: true });\n}\n\n// Add metadata to the log\nconst logWithMeta = {\n  ...logData,\n  id: `${date}_${timestamp}`,\n  savedAt: new Date().toISOString(),\n  filename: filename\n};\n\n// Save to file\nconst filepath = path.join(logsDir, filename);\nfs.writeFileSync(filepath, JSON.stringify(logWithMeta, null, 2));\n\nconsole.log('Saved log to:', filepath);\n\nreturn [{\n  json: {\n    status: 'success',\n    message: 'Daily log saved successfully',\n    filename: filename,\n    logId: logWithMeta.id,\n    savedAt: logWithMeta.savedAt\n  }\n}];"
        }
      },
      {
        "id": "respond-1",
        "name": "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1,
        "position": [680, 300],
        "parameters": {
          "respondWith": "json",
          "responseBody": "={{ JSON.stringify($json) }}"
        }
      }
    ],
    connections: {
      "Webhook": {
        "main": [
          [
            {
              "node": "Save Log",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Save Log": {
        "main": [
          [
            {
              "node": "Respond to Webhook",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  },
  getLogs: {
    name: "Simple Get Logs Manual Auto",
    settings: {
      executionOrder: "v1"
    },
    nodes: [
      {
        "id": "webhook-2",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [240, 300],
        "parameters": {
          "httpMethod": "GET", 
          "path": "simple-logs-get",
          "responseMode": "responseNode"
        }
      },
      {
        "id": "code-2",
        "name": "Get Logs",
        "type": "n8n-nodes-base.code", 
        "typeVersion": 2,
        "position": [460, 300],
        "parameters": {
          "language": "javascript",
          "jsCode": "// Read log files for a specific intern\nconst fs = require('fs');\nconst path = require('path');\n\n// Get email from query parameters\nconst webhookData = $input.first().json;\nconsole.log('Webhook data received:', JSON.stringify(webhookData, null, 2));\n\n// Try different ways to get the email parameter\nlet internEmail = 'unknown';\nif (webhookData.query && webhookData.query.email) {\n  internEmail = webhookData.query.email;\n} else if (webhookData.email) {\n  internEmail = webhookData.email;\n} else if (webhookData.params && webhookData.params.email) {\n  internEmail = webhookData.params.email;\n}\n\nconsole.log('Searching for logs with email:', internEmail);\n\n// Read logs directory\nconst logsDir = '/data/logs';\nlet logs = [];\n\ntry {\n  if (fs.existsSync(logsDir)) {\n    const files = fs.readdirSync(logsDir);\n    console.log(`Found ${files.length} files in logs directory`);\n    \n    for (const file of files) {\n      if (file.endsWith('.json') && file !== '.gitkeep') {\n        try {\n          const filepath = path.join(logsDir, file);\n          const content = fs.readFileSync(filepath, 'utf8');\n          const logData = JSON.parse(content);\n          \n          console.log(`File ${file} - internEmail: ${logData.internEmail}`);\n          \n          // Filter by intern email\n          if (logData.internEmail === internEmail) {\n            logs.push(logData);\n            console.log(`✅ Matched log from ${file}`);\n          }\n        } catch (err) {\n          console.error('Error reading file:', file, err.message);\n        }\n      }\n    }\n  } else {\n    console.log('Logs directory does not exist:', logsDir);\n  }\n  \n  // Sort logs by date (newest first)\n  logs.sort((a, b) => new Date(b.date || b.savedAt) - new Date(a.date || a.savedAt));\n  \n  console.log(`Found ${logs.length} logs for ${internEmail}`);\n  \n} catch (error) {\n  console.error('Error reading logs:', error.message);\n}\n\nreturn [{\n  json: {\n    status: 'success',\n    message: 'Logs retrieved successfully',\n    data: logs,\n    internEmail: internEmail,\n    count: logs.length\n  }\n}];"
        }
      },
      {
        "id": "respond-2",
        "name": "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1,
        "position": [680, 300],
        "parameters": {
          "respondWith": "json",
          "responseBody": "={{ JSON.stringify($json) }}"
        }
      }
    ],
    connections: {
      "Webhook": {
        "main": [
          [
            {
              "node": "Get Logs",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Get Logs": {
        "main": [
          [
            {
              "node": "Respond to Webhook",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }
};

async function deactivateOldWorkflows() {
  console.log('🔄 Deactivating old problematic workflows...');
  
  const problematicIds = ['AZBKmrrkT0kf7Zc1', 'J2nEFsNeiupZQ3Sf'];
  
  for (const id of problematicIds) {
    try {
      await axios.patch(`${N8N_BASE_URL}/api/v1/workflows/${id}`, {
        active: false
      });
      console.log(`   ✅ Deactivated workflow ${id}`);
    } catch (error) {
      console.log(`   ⚠️  Could not deactivate ${id}: ${error.message}`);
    }
  }
}

async function createWorkflow(workflowDef) {
  try {
    console.log(`🔧 Creating workflow: ${workflowDef.name}`);
    
    // Create workflow
    const createResponse = await axios.post(`${N8N_BASE_URL}/api/v1/workflows`, workflowDef);
    const workflowId = createResponse.data.id;
    console.log(`   ✅ Created workflow with ID: ${workflowId}`);
    
    // Activate workflow using correct endpoint
    await axios.post(`${N8N_BASE_URL}/api/v1/workflows/${workflowId}/activate`);
    console.log(`   ✅ Activated workflow ${workflowId}`);
    
    return workflowId;
    
  } catch (error) {
    console.error(`   ❌ Error creating workflow: ${error.message}`);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function testWebhooks() {
  console.log('\n🧪 Testing webhook endpoints...');
  
  const endpoints = [
    { method: 'POST', path: 'simple-logs-post' },
    { method: 'GET', path: 'simple-logs-get' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      if (endpoint.method === 'POST') {
        await axios.post(`${N8N_BASE_URL}/webhook/${endpoint.path}`, {
          test: true,
          internEmail: 'test@example.com',
          date: '2024-01-01',
          tasks: 'Test task'
        });
      } else {
        await axios.get(`${N8N_BASE_URL}/webhook/${endpoint.path}?email=test@example.com`);
      }
      console.log(`   ✅ ${endpoint.method} /webhook/${endpoint.path} - Working!`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ❌ ${endpoint.method} /webhook/${endpoint.path} - Not registered (404)`);
      } else {
        console.log(`   ⚠️  ${endpoint.method} /webhook/${endpoint.path} - Error: ${error.message}`);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting automatic webhook fix...\n');
  
  try {
    // Step 1: Deactivate old workflows
    await deactivateOldWorkflows();
    
    // Step 2: Create new workflows
    console.log('\n🔧 Creating new workflows...');
    await createWorkflow(workflows.postLogs);
    await createWorkflow(workflows.getLogs);
    
    // Step 3: Wait a moment for webhooks to register
    console.log('\n⏳ Waiting for webhooks to register...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Test webhooks
    await testWebhooks();
    
    console.log('\n🎉 Automatic webhook fix completed!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3002');
    console.log('2. Login with intern credentials');
    console.log('3. Try submitting a daily log');
    console.log('4. Check if it appears in "My Logs"');
    
  } catch (error) {
    console.error('❌ Error during automatic fix:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 