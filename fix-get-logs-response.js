const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';
const N8N_URL = 'http://localhost:5678';

async function fixGetLogsWorkflow() {
    try {
        console.log('🔧 Fixing Get Logs workflow...');
        
        // Get the current workflow
        const workflowResponse = await axios.get(`${N8N_URL}/api/v1/workflows/4fQJRlF8Z71NhhHh`, {
            headers: { 'X-N8N-API-KEY': API_KEY }
        });
        
        const workflow = workflowResponse.data.data;
        console.log('📋 Current workflow found:', workflow.name);
        
        // Update the Response node to return the database results directly
        const nodes = workflow.nodes;
        const responseNode = nodes.find(node => node.type === 'n8n-nodes-base.respondToWebhook');
        
        if (responseNode) {
            console.log('🎯 Found Response node, updating...');
            
            // Set response to return the database query results directly
            responseNode.parameters = {
                "options": {},
                "responseMode": "responseNode",
                "responseData": "allEntries"
            };
            
            console.log('✅ Updated Response node parameters');
        }
        
        // Update the workflow
        const updateResponse = await axios.put(`${N8N_URL}/api/v1/workflows/4fQJRlF8Z71NhhHh`, workflow, {
            headers: { 
                'X-N8N-API-KEY': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Workflow updated successfully');
        
        // Test the endpoint
        console.log('🧪 Testing updated endpoint...');
        const testResponse = await axios.get(`${N8N_URL}/webhook/get-logs-db`);
        console.log('📊 Test response:', JSON.stringify(testResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

fixGetLogsWorkflow(); 