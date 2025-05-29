#!/usr/bin/env node

const axios = require('axios');

// n8n API configuration  
const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

// Create axios instance with API key authentication
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function checkWorkflows() {
  console.log('🔍 Checking workflows...');
  
  try {
    const response = await axios.get('http://localhost:5678/api/v1/workflows', {
      headers: { 'X-N8N-API-KEY': API_KEY }
    });
    
    console.log('📋 All Workflows:');
    response.data.data.forEach(w => {
      console.log(`${w.active ? '✅' : '❌'} ${w.id} - ${w.name}`);
    });
    
    // Find workflows with 'rdHmFzAdwJ8X82k0' ID or any active workflow
    const targetWorkflow = response.data.data.find(w => w.id === 'rdHmFzAdwJ8X82k0');
    if (targetWorkflow) {
      console.log(`\n🎯 Found target workflow: ${targetWorkflow.name}`);
      console.log(`Active: ${targetWorkflow.active}`);
    }
    
    // Test webhook
    console.log('\n🧪 Testing webhook...');
    const testData = {
      internEmail: 'debug@test.com',
      internName: 'Debug User',
      date: '2025-01-30',
      projectDescription: 'DEBUG TEST',
      tasksCompleted: 'Testing',
      timeSpent: '1',
      challenges: 'None',
      notes: 'Debug test'
    };
    
    const webhookResponse = await axios.post('http://localhost:5678/webhook/daily-logs-new', testData);
    console.log(`✅ Webhook test: ${webhookResponse.status}`);
    console.log('Response:', webhookResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

checkWorkflows(); 