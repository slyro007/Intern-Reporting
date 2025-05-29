const axios = require('axios');

// n8n API configuration
const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

// Create axios instance with API key authentication
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

class N8nApiClient {
  constructor() {
    this.api = n8nApi;
  }

  async getWorkflows() {
    try {
      const response = await this.api.get('/workflows');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workflows:', error.message);
      throw error;
    }
  }

  async getWorkflow(workflowId) {
    try {
      const response = await this.api.get(`/workflows/${workflowId}`);
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        console.error('Unexpected response structure:', response);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching workflow ${workflowId}:`, error.response?.status, error.response?.statusText);
      throw error;
    }
  }

  async updateWorkflow(workflowId, workflowData) {
    try {
      const response = await this.api.put(`/workflows/${workflowId}`, workflowData);
      console.log(`✅ Updated workflow: ${response.data.data?.name || response.data.name}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating workflow ${workflowId}:`, error.message);
      throw error;
    }
  }
}

async function updateAuthWorkflow() {
  const client = new N8nApiClient();
  
  try {
    console.log('🔄 Updating authentication workflow with role-based users...');
    
    // Get the existing login workflow ID - use the active one
    const workflows = await client.getWorkflows();
    const loginWorkflow = workflows.find(w => w.name === 'User Login' && w.active);
    
    if (!loginWorkflow) {
      console.error('❌ Active User Login workflow not found!');
      return;
    }
    
    console.log(`📋 Found login workflow: ${loginWorkflow.id}`);
    
    // Get the current workflow structure
    const currentWorkflow = await client.getWorkflow(loginWorkflow.id);
    
    // Update the workflow with new user database
    const updatedWorkflow = {
      ...currentWorkflow,
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "auth-login",
            options: {}
          },
          id: "b8c77cfc-b802-4d4d-8cf5-ea8f4a6f5e4f",
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [260, 300],
          webhookId: "d5e4f5e4-5f5f-4f5f-5f5f-5f5f5f5f5f5f"
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
          id: "f9e8d7c6-5b4a-3928-1765-4321098fedcb",
          name: "Authenticate User",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [480, 300]
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}"
          },
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Send Response",
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
                "node": "Send Response", 
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      settings: {}
    };
    
    // Update the workflow
    await client.updateWorkflow(loginWorkflow.id, updatedWorkflow);
    
    console.log('✅ Authentication workflow updated successfully!');
    console.log('📧 Configured users:');
    console.log('   • sjalagam@wolfflogics.com (Intern)');
    console.log('   • dsolomon@wolfflogics.com (Admin)');
    console.log('   • ehammond@wolfflogics.com (Admin)');
    console.log('   • pcounts@wolfflogics.com (Admin)');
    console.log('🔗 Login endpoint: http://localhost:5678/webhook/auth-login');
    
  } catch (error) {
    console.error('❌ Error updating authentication workflow:', error.message);
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }
  }
}

// Run the update
updateAuthWorkflow(); 