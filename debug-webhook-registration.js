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

async function debugWebhookRegistration() {
  console.log('🔍 Debugging webhook registration...\n');
  
  try {
    // 1. Check all workflows
    console.log('1. Checking all workflows...');
    const workflowsResponse = await n8nApi.get('/workflows');
    const workflows = workflowsResponse.data.data;
    
    const targetWorkflows = workflows.filter(w => 
      w.name.includes('Working Intern Logs') || w.name.includes('Working Get Intern Logs')
    );
    
    console.log('📋 Found target workflows:');
    targetWorkflows.forEach(w => {
      console.log(`   - ${w.name} (ID: ${w.id}) [${w.active ? 'Active' : 'Inactive'}]`);
    });
    
    // 2. Check each workflow in detail
    for (const workflow of targetWorkflows) {
      console.log(`\n🔍 Examining "${workflow.name}" (${workflow.id}):`);
      
      try {
        const detailResponse = await n8nApi.get(`/workflows/${workflow.id}`);
        const workflowDetail = detailResponse.data.data;
        
        console.log(`   Status: ${workflowDetail.active ? 'Active' : 'Inactive'}`);
        
        // Find webhook nodes
        const webhookNodes = workflowDetail.nodes.filter(node => 
          node.type === 'n8n-nodes-base.webhook'
        );
        
        console.log(`   Webhook nodes found: ${webhookNodes.length}`);
        webhookNodes.forEach(node => {
          console.log(`     - Path: "${node.parameters.path}"`);
          console.log(`     - Method: ${node.parameters.httpMethod || 'POST'}`);
        });
        
        // 3. Check executions for errors
        const executionsResponse = await n8nApi.get(`/executions?filter={"workflowId":"${workflow.id}"}&limit=5`);
        const executions = executionsResponse.data.data;
        
        console.log(`   Recent executions: ${executions.length}`);
        const failedExecutions = executions.filter(ex => ex.finished === false || ex.mode === 'error');
        if (failedExecutions.length > 0) {
          console.log(`   ❌ Failed executions: ${failedExecutions.length}`);
          failedExecutions.forEach(ex => {
            console.log(`     - ${ex.id}: ${ex.stoppedAt} (${ex.mode})`);
          });
        }
        
      } catch (error) {
        console.error(`   ❌ Error examining workflow: ${error.message}`);
      }
    }
    
    // 4. Try to manually activate workflows
    console.log('\n🔄 Attempting to reactivate workflows...');
    for (const workflow of targetWorkflows) {
      if (workflow.active) {
        console.log(`   Deactivating ${workflow.name}...`);
        await n8nApi.patch(`/workflows/${workflow.id}`, { active: false });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`   Reactivating ${workflow.name}...`);
        await n8nApi.patch(`/workflows/${workflow.id}`, { active: true });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`   ✅ Reactivated ${workflow.name}`);
      }
    }
    
    console.log('\n🧪 Testing webhooks after reactivation...');
    
    // Test webhook registration
    try {
      const testResponse = await axios.get('http://localhost:5678/webhook/intern-logs-working');
      console.log('✅ intern-logs-working webhook is now registered');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ intern-logs-working webhook still not registered');
      } else {
        console.log('✅ intern-logs-working webhook exists (got different error)');
      }
    }
    
    try {
      const testResponse = await axios.get('http://localhost:5678/webhook/intern-logs-get');
      console.log('✅ intern-logs-get webhook is now registered');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ intern-logs-get webhook still not registered');
      } else {
        console.log('✅ intern-logs-get webhook exists (got different error)');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

debugWebhookRegistration(); 