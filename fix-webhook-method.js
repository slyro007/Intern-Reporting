#!/usr/bin/env node

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

async function fixWebhookMethod() {
  console.log('🔧 Fixing webhook HTTP method for DB Daily Logs Working...\n');
  
  try {
    // 1. Get the "DB Daily Logs Working" workflow
    const workflowId = '3Eq3btK7Nz11AxqE';
    console.log(`Getting workflow ${workflowId}...`);
    
    const workflowResponse = await n8nApi.get(`/workflows/${workflowId}`);
    const workflow = workflowResponse.data;
    
    console.log(`✅ Found workflow: "${workflow.name}"`);
    
    // 2. Find the webhook node and update its HTTP method
    const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
    
    if (!webhookNode) {
      console.log('❌ No webhook node found in this workflow');
      return;
    }
    
    console.log(`🔍 Current webhook configuration:`);
    console.log(`   Path: "${webhookNode.parameters.path}"`);
    console.log(`   HTTP Method: ${webhookNode.parameters.httpMethod || 'GET (default)'}`);
    
    // 3. Update the webhook node to use POST method
    webhookNode.parameters.httpMethod = 'POST';
    webhookNode.parameters.responseMode = 'responseNode'; // Ensure we use response node
    
    console.log(`\n🔧 Updated webhook configuration:`);
    console.log(`   Path: "${webhookNode.parameters.path}"`);
    console.log(`   HTTP Method: ${webhookNode.parameters.httpMethod}`);
    console.log(`   Response Mode: ${webhookNode.parameters.responseMode}`);
    
    // 4. First deactivate the workflow
    console.log(`\n🔄 Deactivating workflow to apply changes...`);
    await n8nApi.patch(`/workflows/${workflowId}`, { active: false });
    console.log('   ✅ Workflow deactivated');
    
    // 5. Update the workflow with the fixed webhook
    console.log(`\n💾 Saving updated workflow...`);
    const updateResponse = await n8nApi.put(`/workflows/${workflowId}`, workflow);
    console.log('   ✅ Workflow updated');
    
    // 6. Reactivate the workflow
    console.log(`\n🔄 Reactivating workflow...`);
    await n8nApi.patch(`/workflows/${workflowId}`, { active: true });
    console.log('   ✅ Workflow reactivated');
    
    // 7. Test the fixed webhook
    console.log(`\n🧪 Testing the fixed webhook...`);
    
    // Wait a moment for webhook registration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testData = {
      internEmail: "test@example.com",
      internName: "Test User",
      date: new Date().toISOString().split('T')[0],
      projectDescription: "Test project after fix",
      tasksCompleted: "Testing POST webhook",
      timeSpent: "1",
      challenges: "Testing webhook fix",
      notes: "This should work now"
    };
    
    try {
      const testResponse = await axios.post('http://localhost:5678/webhook/daily-logs-db', testData);
      console.log(`   ✅ Webhook test successful: ${testResponse.status}`);
      console.log(`   Response: ${JSON.stringify(testResponse.data, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ Webhook test failed: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   Error data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing webhook method:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the fix
fixWebhookMethod(); 