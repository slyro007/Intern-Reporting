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

async function checkWebhookConfigs() {
  console.log('🔍 Checking webhook configurations and workflow details...\n');
  
  try {
    // 1. Get all workflows first
    const workflowsResponse = await n8nApi.get('/workflows');
    
    console.log('📋 All Workflows:');
    workflowsResponse.data.data.forEach(w => {
      console.log(`${w.active ? '✅' : '❌'} ${w.id} - ${w.name}`);
    });
    
    // 2. Find our new workflow (rdHmFzAdwJ8X82k0 from execution logs)
    const newWorkflow = workflowsResponse.data.data.find(w => w.id === 'rdHmFzAdwJ8X82k0');
    
    if (newWorkflow) {
      console.log(`\n🎯 Found our new workflow: ${newWorkflow.name} (${newWorkflow.id})`);
      console.log(`Active: ${newWorkflow.active}`);
      
      // Get detailed workflow info
      try {
        const detailResponse = await n8nApi.get(`/workflows/${newWorkflow.id}`);
        
        const workflow = detailResponse.data.data;
        console.log(`\n🔧 Workflow Details:`);
        console.log(`Nodes: ${workflow.nodes.length}`);
        
        workflow.nodes.forEach((node, index) => {
          console.log(`\n   ${index + 1}. ${node.type} - ${node.name}`);
          
          if (node.type === 'n8n-nodes-base.webhook') {
            console.log(`      🌐 Webhook Path: ${node.parameters.path}`);
            console.log(`      🌐 HTTP Method: ${node.parameters.httpMethod}`);
          }
          
          if (node.type === 'n8n-nodes-base.postgres') {
            console.log(`      🗄️  Operation: ${node.parameters.operation}`);
            console.log(`      🗄️  Table: ${node.parameters.table}`);
            console.log(`      🗄️  Schema: ${node.parameters.schema || 'public'}`);
            
            // Check values to send
            if (node.parameters.valuesUi && node.parameters.valuesUi.values) {
              console.log(`      🗄️  Values to Send:`);
              node.parameters.valuesUi.values.forEach((value, idx) => {
                console.log(`         ${idx + 1}. ${value.column}: ${value.value}`);
              });
            }
          }
        });
        
      } catch (error) {
        console.log(`❌ Error getting workflow details: ${error.message}`);
      }
    } else {
      console.log('\n❌ Could not find the new workflow with ID rdHmFzAdwJ8X82k0');
    }
    
    // 3. Test the webhook directly with debugging
    console.log('\n🧪 Testing webhook with detailed logging...');
    
    const testData = {
      internEmail: 'debug@test.com',
      internName: 'Debug Test User',
      date: '2025-01-30',
      projectDescription: 'DEBUG TEST - Should save to database',
      tasksCompleted: 'Testing database save',
      timeSpent: '1',
      challenges: 'None',
      notes: 'This is a debug test'
    };
    
    console.log('📤 Sending test data:');
    console.log(JSON.stringify(testData, null, 2));
    
    const response = await n8nApi.post('/webhook/daily-logs-new', testData);
    console.log(`\n✅ Webhook Response: ${response.status}`);
    console.log('Response Data:', response.data);
    
    // 4. Wait a moment then check database
    console.log('\n⏳ Waiting 2 seconds then checking database...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if data was saved
    console.log('\n🔍 Checking database for test data...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the check
checkWebhookConfigs(); 