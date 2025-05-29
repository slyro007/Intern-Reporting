const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5678/api/v1',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q',
    'Content-Type': 'application/json'
  }
});

async function createWorkingAuth() {
  try {
    console.log('🔧 Creating new working authentication workflow...');
    
    // First, deactivate the old workflow
    const oldWorkflowId = 'NgfCs7nAz4EGJs2W';
    try {
      const oldWorkflow = await api.get(`/workflows/${oldWorkflowId}`);
      await api.put(`/workflows/${oldWorkflowId}`, {
        ...oldWorkflow.data.data,
        active: false
      });
      console.log('✅ Deactivated old workflow');
    } catch (e) {
      console.log('Note: Could not deactivate old workflow');
    }
    
    // Create new workflow
    const newWorkflow = {
      name: "Auth Login Working",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "auth-login",
            responseMode: "responseNode",
            options: {}
          },
          id: "webhook-node-new",
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [260, 300],
          webhookId: "auth-login-new"
        },
        {
          parameters: {
            jsCode: `// Authentication System
const users = {
  'sjalagam@wolfflogics.com': {
    email: 'sjalagam@wolfflogics.com',
    password: 'iamanintern',
    name: 'Srujan Jalagam',
    role: 'intern',
    id: 'intern_001',
    permissions: ['submit_daily_log', 'view_own_data']
  },
  'dsolomon@wolfflogics.com': {
    email: 'dsolomon@wolfflogics.com', 
    password: 'lmaowow',
    name: 'Danny Solomon',
    role: 'admin',
    id: 'admin_001',
    permissions: ['view_all_data', 'generate_summaries', 'generate_reports', 'submit_daily_log']
  },
  'ehammond@wolfflogics.com': {
    email: 'ehammond@wolfflogics.com',
    password: 'imaderp', 
    name: 'Ezekiel Hammond',
    role: 'admin',
    id: 'admin_002',
    permissions: ['view_all_data', 'generate_summaries', 'generate_reports', 'submit_daily_log']
  },
  'pcounts@wolfflogics.com': {
    email: 'pcounts@wolfflogics.com',
    password: 'imalsoaderp',
    name: 'Philip Counts', 
    role: 'admin',
    id: 'admin_003',
    permissions: ['view_all_data', 'generate_summaries', 'generate_reports', 'submit_daily_log']
  }
};

// Get request data
const requestData = $input.first().json;
const email = requestData.email;
const password = requestData.password;

console.log('Login request for:', email);

if (!email || !password) {
  return [{
    json: {
      success: false,
      error: 'Email and password are required'
    }
  }];
}

const user = users[email.toLowerCase()];

if (!user || user.password !== password) {
  return [{
    json: {
      success: false,
      error: 'Invalid credentials'
    }
  }];
}

console.log('Successful login:', user.name);

return [{
  json: {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions
    },
    loginTime: new Date().toISOString(),
    message: \`Welcome back, \${user.name}!\`
  }
}];`
          },
          id: "code-node-new",
          name: "Authenticate",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [480, 300]
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}",
            options: {}
          },
          id: "response-node-new",
          name: "Respond",
          type: "n8n-nodes-base.respondToWebhook", 
          typeVersion: 1,
          position: [700, 300]
        }
      ],
      connections: {
        "Webhook": {
          "main": [
            [
              {
                "node": "Authenticate",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Authenticate": {
          "main": [
            [
              {
                "node": "Respond", 
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      settings: {}
    };
    
    const response = await api.post('/workflows', newWorkflow);
    const workflowId = response.data.data?.id || response.data.id;
    
    console.log('✅ Created new working authentication workflow!');
    console.log('📋 Workflow ID:', workflowId);
    console.log('🔗 New endpoint: http://localhost:5678/webhook/auth-login');
    
    // Activate the workflow
    if (workflowId) {
      await api.put(`/workflows/${workflowId}/activate`);
      console.log('✅ Activated workflow');
    }
    
    // Test the new authentication
    console.log('\n🧪 Testing new authentication...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for activation
    await testAuth();
    
  } catch (error) {
    console.error('❌ Error creating working authentication:', error.message);
    if (error.response?.data) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testAuth() {
  try {
    console.log('Testing intern login...');
    const response = await axios.post('http://localhost:5678/webhook/auth-login', {
      email: 'sjalagam@wolfflogics.com',
      password: 'iamanintern'
    });
    
    console.log('✅ Test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
  }
}

createWorkingAuth(); 