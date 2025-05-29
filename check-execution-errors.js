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

async function checkExecutionErrors() {
  console.log('🔍 Checking recent workflow executions for errors...\n');
  
  try {
    // Get recent executions
    const response = await n8nApi.get('/executions', {
      params: {
        limit: 10
      }
    });
    
    console.log(`📊 Found ${response.data.data.length} recent executions:\n`);
    
    response.data.data.forEach((execution, index) => {
      console.log(`${index + 1}. Execution ID: ${execution.id}`);
      console.log(`   Workflow: ${execution.workflowId}`);
      console.log(`   Status: ${execution.finished ? '✅ Finished' : '❌ Running'}`);
      console.log(`   Success: ${execution.stoppedAt ? '✅ Yes' : '❌ No'}`);
      console.log(`   Started: ${execution.startedAt}`);
      console.log(`   Mode: ${execution.mode}`);
      
      if (execution.stoppedAt) {
        console.log(`   Stopped: ${execution.stoppedAt}`);
      }
      console.log('');
    });
    
    // Get detailed info for the most recent execution
    if (response.data.data.length > 0) {
      const latestExecution = response.data.data[0];
      console.log('🔍 Getting detailed info for latest execution...\n');
      
      const detailResponse = await n8nApi.get(`/executions/${latestExecution.id}`);
      
      const execution = detailResponse.data.data;
      console.log('📋 Latest Execution Details:');
      console.log('Status:', execution.finished ? 'Finished' : 'Running');
      console.log('Success:', execution.stoppedAt ? 'Yes' : 'No');
      
      if (execution.data && execution.data.resultData) {
        console.log('\n🔧 Node Results:');
        const nodeData = execution.data.resultData.runData;
        
        if (nodeData) {
          Object.keys(nodeData).forEach(nodeName => {
            const nodeResult = nodeData[nodeName];
            console.log(`\n   ${nodeName}:`);
            console.log(`   - Executed: ${nodeResult.length > 0 ? 'Yes' : 'No'}`);
            
            if (nodeResult.length > 0) {
              const result = nodeResult[0];
              console.log(`   - Start Time: ${result.startTime}`);
              console.log(`   - Execution Time: ${result.executionTime}ms`);
              
              if (result.error) {
                console.log(`   - ❌ ERROR: ${result.error.message}`);
                console.log(`   - Error Details: ${JSON.stringify(result.error, null, 2)}`);
              } else {
                console.log(`   - ✅ Success`);
                console.log(`   - Data Items: ${result.data?.main?.[0]?.length || 0}`);
              }
            }
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking executions:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the check
checkExecutionErrors(); 