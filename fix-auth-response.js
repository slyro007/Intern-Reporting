const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5678/api/v1',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q',
    'Content-Type': 'application/json'
  }
});

async function fixAuthWorkflow() {
  try {
    console.log('🔧 Fixing authentication workflow to respond synchronously...');
    
    // Get the active login workflow
    const workflowId = 'NgfCs7nAz4EGJs2W';
    const response = await api.get(`/workflows/${workflowId}`);
    const workflow = response.data.data || response.data;
    
    console.log(`📋 Retrieved workflow: ${workflow.name}`);
    
    // Update the workflow nodes with proper webhook configuration
    const updatedNodes = [
      {
        parameters: {
          httpMethod: "POST",
          path: "auth-login",
          responseMode: "responseNode",
          options: {}
        },
        id: "webhook-node",
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [260, 300],
        webhookId: "auth-login"
      },
      {
        parameters: {
          jsCode: `// Wolff Logics MSP - Intern Tracking System Authentication
// Role-based user database with specific permissions

const users = {
  // Intern
  'sjalagam@wolfflogics.com': {
    email: 'sjalagam@wolfflogics.com',
    password: 'iamanintern',
    name: 'Srujan Jalagam',
    role: 'intern',
    id: 'intern_001',
    permissions: ['submit_daily_log', 'view_own_data']
  },
  
  // Admins
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

// Get login data from webhook
const { email, password } = $input.first().json;

console.log('Login attempt for:', email);

// Validate input
if (!email || !password) {
  return [{
    json: {
      success: false,
      error: 'Email and password are required',
      timestamp: new Date().toISOString()
    }
  }];
}

// Find user
const user = users[email.toLowerCase()];

if (!user) {
  console.log('User not found:', email);
  return [{
    json: {
      success: false,
      error: 'Invalid credentials - user not found',
      timestamp: new Date().toISOString()
    }
  }];
}

// Validate password
if (user.password !== password) {
  console.log('Invalid password for:', email);
  return [{
    json: {
      success: false,
      error: 'Invalid credentials - incorrect password', 
      timestamp: new Date().toISOString()
    }
  }];
}

// Successful authentication
console.log('Successful login for:', user.name, '(' + user.role + ')');

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
        id: "auth-code-node",
        name: "Authenticate User",
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
        id: "response-node",
        name: "Respond to Webhook",
        type: "n8n-nodes-base.respondToWebhook", 
        typeVersion: 1,
        position: [700, 300]
      }
    ];
    
    const updatedConnections = {
      "Webhook": {
        "main": [
          [
            {
              "node": "Authenticate User",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Authenticate User": {
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
    };
    
    // Update the workflow
    const updateData = {
      name: workflow.name,
      nodes: updatedNodes,
      connections: updatedConnections,
      settings: workflow.settings || {}
    };
    
    await api.put(`/workflows/${workflowId}`, updateData);
    
    console.log('✅ Authentication workflow fixed!');
    console.log('🔗 Login endpoint: http://localhost:5678/webhook/auth-login');
    
    // Test the authentication
    console.log('\n🧪 Testing authentication...');
    await testAuth();
    
  } catch (error) {
    console.error('❌ Error fixing authentication workflow:', error.message);
    if (error.response?.data) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testAuth() {
  try {
    const testResponse = await axios.post('http://localhost:5678/webhook/auth-login', {
      email: 'sjalagam@wolfflogics.com',
      password: 'iamanintern'
    });
    
    console.log('✅ Test successful!');
    console.log('Response:', JSON.stringify(testResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

fixAuthWorkflow(); 