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

async function checkGetLogsWorkflow() {
  console.log('🔍 Checking DB Get Logs workflow...\n');
  
  try {
    // 1. Get the "DB Get Logs" workflow details
    const workflowId = 'X9RkVAmKsXDr526f';
    console.log(`Getting "DB Get Logs" workflow details...`);
    
    const workflowResponse = await n8nApi.get(`/workflows/${workflowId}`);
    const workflow = workflowResponse.data;
    
    console.log(`✅ Found workflow: "${workflow.name}"`);
    console.log(`   Active: ${workflow.active}`);
    console.log(`   Nodes: ${workflow.nodes.length}`);
    
    // 2. Examine each node
    console.log('\n🔍 Workflow nodes:');
    workflow.nodes.forEach((node, index) => {
      console.log(`   ${index + 1}. ${node.name} (${node.type})`);
      
      if (node.type === 'n8n-nodes-base.webhook') {
        console.log(`      • Path: "${node.parameters.path || 'not-set'}"`);
        console.log(`      • Method: ${node.parameters.httpMethod || 'GET (default)'}`);
      }
      
      if (node.type === 'n8n-nodes-base.postgres') {
        console.log(`      • Operation: ${node.parameters.operation || 'not-set'}`);
        console.log(`      • Query: ${node.parameters.query || 'not-set'}`);
      }
      
      if (node.type === 'n8n-nodes-base.respondToWebhook') {
        console.log(`      • Response Mode: ${node.parameters.respondWith || 'not-set'}`);
        const body = node.parameters.responseBody;
        if (body && body.length > 100) {
          console.log(`      • Response Body: ${body.substring(0, 100)}...`);
        } else {
          console.log(`      • Response Body: ${body || 'not-set'}`);
        }
      }
    });
    
    // 3. Test the actual endpoint with a proper request
    console.log('\n🧪 Testing GET /webhook/get-logs-db...');
    try {
      const response = await axios.get('http://localhost:5678/webhook/get-logs-db');
      console.log(`   ✅ Success: ${response.status}`);
      console.log(`   Response type: ${typeof response.data}`);
      console.log(`   Response content: ${JSON.stringify(response.data, null, 2)}`);
      
      // Check if it's returning actual database data
      if (response.data && typeof response.data === 'object') {
        if (response.data.message === "Workflow was started") {
          console.log('\n   ⚠️  Workflow started but may not be returning database data');
          console.log('   👉 This suggests the workflow might not have a proper response node');
        } else if (Array.isArray(response.data) || response.data.data) {
          console.log('\n   ✅ Looks like actual database data!');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   Error data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // 4. Check recent executions of this workflow
    console.log('\n📊 Checking recent executions of DB Get Logs workflow...');
    const executionsResponse = await n8nApi.get(`/executions?filter={"workflowId":"${workflowId}"}&limit=3`);
    const executions = executionsResponse.data.data;
    
    if (executions.length === 0) {
      console.log('   ℹ️  No recent executions found');
    } else {
      console.log(`   Found ${executions.length} recent executions:`);
      executions.forEach(ex => {
        console.log(`   • ${ex.startedAt}: ${ex.finished ? 'Finished' : 'Running'} (${ex.mode})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking workflow:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the check
checkGetLogsWorkflow(); 