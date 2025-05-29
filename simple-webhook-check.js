#!/usr/bin/env node

const axios = require('axios');

// n8n API configuration  
const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

async function simpleWebhookCheck() {
  console.log('🔍 Simple webhook check...\n');
  
  try {
    // Test the actual webhook endpoints directly
    console.log('🧪 Testing webhook endpoints directly:\n');
    
    const testData = {
      internEmail: "test@example.com",
      internName: "Test User",
      projectDescription: "Test project",
      tasksCompleted: "Test tasks",
      timeSpent: "4",
      challenges: "Test challenges",
      notes: "Test notes"
    };
    
    // Test POST to daily-logs-db
    console.log('1. Testing POST /webhook/daily-logs-db...');
    try {
      const response = await axios.post('http://localhost:5678/webhook/daily-logs-db', testData);
      console.log(`   ✅ Success: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // Test GET to daily-logs-db
    console.log('\n2. Testing GET /webhook/daily-logs-db...');
    try {
      const response = await axios.get('http://localhost:5678/webhook/daily-logs-db');
      console.log(`   ✅ Success: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // Test GET to get-logs-db
    console.log('\n3. Testing GET /webhook/get-logs-db...');
    try {
      const response = await axios.get('http://localhost:5678/webhook/get-logs-db');
      console.log(`   ✅ Success: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // Check what workflows are active via API
    console.log('\n🔍 Checking active workflows via API...');
    const n8nApi = axios.create({
      baseURL: N8N_BASE_URL,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const workflowsResponse = await n8nApi.get('/workflows');
    const workflows = workflowsResponse.data.data;
    const activeWorkflows = workflows.filter(w => w.active);
    
    console.log('\n📋 Active workflows:');
    activeWorkflows.forEach(w => {
      console.log(`   ✅ ${w.name} (ID: ${w.id})`);
    });
    
    // Try to get one workflow in detail to see the structure
    if (activeWorkflows.length > 0) {
      console.log('\n🔍 Examining first active workflow structure...');
      const firstWorkflow = activeWorkflows[0];
      try {
        const detailResponse = await n8nApi.get(`/workflows/${firstWorkflow.id}`);
        console.log('Response structure:', Object.keys(detailResponse.data));
        if (detailResponse.data.data) {
          console.log('Workflow data keys:', Object.keys(detailResponse.data.data));
        } else {
          console.log('Full response:', JSON.stringify(detailResponse.data, null, 2));
        }
      } catch (error) {
        console.log(`Error getting workflow details: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in simple check:', error.message);
  }
}

// Run the check
simpleWebhookCheck(); 