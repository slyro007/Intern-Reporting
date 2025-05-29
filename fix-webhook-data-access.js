const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5678/api/v1',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q',
    'Content-Type': 'application/json'
  }
});

async function fixWebhookDataAccess() {
  try {
    console.log('🔧 Fixing webhook data access in authentication workflow...');
    
    // Find the active Auth Login Working workflow
    const workflows = await api.get('/workflows');
    const authWorkflow = workflows.data.data.find(w => 
      w.name === 'Auth Login Working' && w.active
    );
    
    if (!authWorkflow) {
      console.error('❌ Active Auth Login Working workflow not found!');
      return;
    }
    
    console.log(`📋 Found workflow: ${authWorkflow.name} (${authWorkflow.id})`);
    
    // Get the full workflow
    const workflow = await api.get(`/workflows/${authWorkflow.id}`);
    const fullWorkflow = workflow.data.data || workflow.data;
    
    // Update the code node with corrected data access
    const updatedNodes = fullWorkflow.nodes.map(node => {
      if (node.type === 'n8n-nodes-base.code') {
        return {
          ...node,
          parameters: {
            ...node.parameters,
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

// Get request data - check both possible data structures
const requestData = $input.first().json;
console.log('Full request data:', JSON.stringify(requestData, null, 2));

const email = requestData.body?.email || requestData.email;
const password = requestData.body?.password || requestData.password;

console.log('Login request for:', email);
console.log('Password provided:', !!password);

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
  console.log('Authentication failed for:', email);
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
          }
        };
      }
      return node;
    });
    
    // Update the workflow
    const updateData = {
      name: fullWorkflow.name,
      nodes: updatedNodes,
      connections: fullWorkflow.connections,
      settings: fullWorkflow.settings || {}
    };
    
    await api.put(`/workflows/${authWorkflow.id}`, updateData);
    
    console.log('✅ Authentication workflow updated with corrected data access!');
    console.log('🔗 Endpoint: http://localhost:5678/webhook/auth-login');
    
    // Test the authentication
    console.log('\n🧪 Testing authentication...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAuth();
    
  } catch (error) {
    console.error('❌ Error fixing webhook data access:', error.message);
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

fixWebhookDataAccess(); 