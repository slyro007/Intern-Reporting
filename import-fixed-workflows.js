#!/usr/bin/env node

const fs = require('fs');
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

// List of fixed workflow files to import
const workflowFiles = [
  'n8n-workflows/working-intern-logs-workflow-fixed.json',
  'n8n-workflows/working-get-logs-workflow-fixed.json'
];

async function importWorkflow(filePath) {
  try {
    console.log(`\nImporting fixed workflow from ${filePath}...`);
    
    // Read the workflow file
    const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Strip down to only essential properties for creation
    const workflowToCreate = {
      name: workflowData.name,
      nodes: workflowData.nodes,
      connections: workflowData.connections,
      settings: {
        executionOrder: "v1"
      }
    };
    
    console.log('📤 Sending fixed workflow with keys:', Object.keys(workflowToCreate));
    
    // Import the workflow
    const response = await n8nApi.post('/workflows', workflowToCreate);
    
    const createdWorkflow = response.data.data || response.data;
    console.log(`✅ Successfully imported: ${createdWorkflow.name}`);
    console.log(`   Workflow ID: ${createdWorkflow.id}`);
    console.log(`   Status: Created (inactive - will activate automatically)`);
    
    // Automatically activate the workflow
    console.log(`🔄 Activating ${createdWorkflow.name}...`);
    await n8nApi.patch(`/workflows/${createdWorkflow.id}`, { active: true });
    console.log(`✅ Activated ${createdWorkflow.name}`);
    
    return createdWorkflow;
  } catch (error) {
    console.error(`❌ Failed to import ${filePath}:`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.statusText}`);
      if (error.response.data.details) {
        console.error(`   Details: ${JSON.stringify(error.response.data.details, null, 2)}`);
      }
    } else {
      console.error(`   Error: ${error.message}`);
    }
    throw error;
  }
}

async function main() {
  console.log('🔧 Importing FIXED n8n workflows with CORS support...\n');
  
  try {
    let successCount = 0;
    let errorCount = 0;
    let importedWorkflows = [];
    
    for (const filePath of workflowFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${filePath}`);
          errorCount++;
          continue;
        }
        
        const workflow = await importWorkflow(filePath);
        importedWorkflows.push(workflow);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All fixed workflows imported and activated successfully!');
      console.log('\n📝 New webhook endpoints:');
      importedWorkflows.forEach(w => {
        if (w.name.includes('Intern Logs Fixed')) {
          console.log(`   📤 POST: http://localhost:5678/webhook/intern-logs-working-fixed`);
        }
        if (w.name.includes('Get Intern Logs Fixed')) {
          console.log(`   📥 GET:  http://localhost:5678/webhook/intern-logs-get-fixed`);
        }
      });
      
      console.log('\n🔧 Next steps:');
      console.log('   1. Update your frontend to use the new endpoints with "-fixed" suffix');
      console.log('   2. Test the intern dashboard - CORS errors should be gone!');
      console.log('   3. Deactivate the old workflows to avoid conflicts');
    } else {
      console.log('\n⚠️  Some workflows failed to import. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

main(); 