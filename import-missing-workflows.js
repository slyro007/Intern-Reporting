#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

// List of workflow files to import
const workflowFiles = [
  'n8n-workflows/working-intern-logs-workflow.json',
  'n8n-workflows/working-get-logs-workflow.json'
];

async function importWorkflow(filePath) {
  try {
    console.log(`\nImporting workflow from ${filePath}...`);
    
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
    
    console.log('📤 Sending workflow with keys:', Object.keys(workflowToCreate));
    
    // Import the workflow
    const response = await n8nApi.post('/workflows', workflowToCreate);
    
    const createdWorkflow = response.data.data || response.data;
    console.log(`✅ Successfully imported: ${createdWorkflow.name}`);
    console.log(`   Workflow ID: ${createdWorkflow.id}`);
    console.log(`   Status: Created (inactive - manually activate in n8n interface)`);
    
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

async function checkExistingWorkflows() {
  try {
    const response = await n8nApi.get('/workflows');
    const workflows = response.data.data;
    
    console.log('📋 Existing workflows:');
    workflows.forEach(workflow => {
      console.log(`   - ${workflow.name} (ID: ${workflow.id}) [${workflow.active ? 'Active' : 'Inactive'}]`);
    });
    
    // Check if our workflows already exist
    const workflowNames = ['Submit Self Evaluation', 'Get Intern Logs', 'Get Intern Evaluations'];
    const existingOurs = workflows.filter(w => workflowNames.includes(w.name));
    
    if (existingOurs.length > 0) {
      console.log('\n⚠️  Some workflows may already exist:');
      existingOurs.forEach(w => {
        console.log(`   - ${w.name} (ID: ${w.id})`);
      });
      console.log('   The script will still attempt to create new ones.');
    }
    
    return workflows;
  } catch (error) {
    console.error('❌ Error checking existing workflows:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🔄 Importing missing n8n workflows...\n');
  
  try {
    // First check connection and existing workflows
    await checkExistingWorkflows();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const filePath of workflowFiles) {
      try {
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${filePath}`);
          errorCount++;
          continue;
        }
        
        await importWorkflow(filePath);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All workflows imported successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Go to your n8n interface (http://localhost:5678)');
      console.log('   2. Find the newly imported workflows in your workflows list');
      console.log('   3. Manually activate each workflow by clicking the toggle switch');
      console.log('   4. Test the intern dashboard daily log submission');
    } else {
      console.log('\n⚠️  Some workflows failed to import. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Check if n8n is running first
async function checkN8NStatus() {
  try {
    await n8nApi.get('/workflows');
    console.log('✅ n8n is running and API is accessible');
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to n8n API. Make sure n8n is running on port 5678');
    console.error('   Run: npm start');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${error.response.statusText}`);
    }
    return false;
  }
}

// Run the script
checkN8NStatus().then(isRunning => {
  if (isRunning) {
    main().catch(error => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}); 