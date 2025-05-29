const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5678/api/v1',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q',
    'Content-Type': 'application/json'
  }
});

async function switchAuthWorkflows() {
  try {
    console.log('🔄 Switching authentication workflows...');
    
    // Deactivate old workflow
    const oldWorkflowId = 'NgfCs7nAz4EGJs2W';
    const oldWorkflow = await api.get(`/workflows/${oldWorkflowId}`);
    const deactivatedWorkflow = {
      ...oldWorkflow.data.data,
      active: false
    };
    // Remove read-only fields
    delete deactivatedWorkflow.id;
    delete deactivatedWorkflow.createdAt;
    delete deactivatedWorkflow.updatedAt;
    
    await api.put(`/workflows/${oldWorkflowId}`, deactivatedWorkflow);
    console.log('✅ Deactivated old User Login workflow');
    
    // Activate new workflow
    const newWorkflowId = 'b3tlcBeXJryozwZM';
    const newWorkflow = await api.get(`/workflows/${newWorkflowId}`);
    const activatedWorkflow = {
      ...newWorkflow.data.data,
      active: true
    };
    // Remove read-only fields
    delete activatedWorkflow.id;
    delete activatedWorkflow.createdAt;
    delete activatedWorkflow.updatedAt;
    
    await api.put(`/workflows/${newWorkflowId}`, activatedWorkflow);
    console.log('✅ Activated new Auth Login Working workflow');
    
    console.log('🔗 Authentication endpoint: http://localhost:5678/webhook/auth-login');
    
    // Test the authentication
    console.log('\n🧪 Testing authentication...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for activation
    await testAuth();
    
  } catch (error) {
    console.error('❌ Error switching workflows:', error.message);
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

switchAuthWorkflows(); 