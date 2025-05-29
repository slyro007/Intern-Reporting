const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

async function exportAllWorkflows() {
    try {
        console.log('🔽 Exporting all n8n workflows...\n');
        
        // Ensure workflows directory exists
        const workflowsDir = './n8n-workflows';
        if (!fs.existsSync(workflowsDir)) {
            fs.mkdirSync(workflowsDir, { recursive: true });
        }
        
        // Get all workflows
        const response = await axios.get('http://localhost:5678/api/v1/workflows', {
            headers: { 'X-N8N-API-KEY': API_KEY }
        });
        
        const workflows = response.data.data;
        console.log(`📋 Found ${workflows.length} workflows to export:\n`);
        
        for (const workflow of workflows) {
            try {
                // Get detailed workflow
                const detailResponse = await axios.get(`http://localhost:5678/api/v1/workflows/${workflow.id}`, {
                    headers: { 'X-N8N-API-KEY': API_KEY }
                });
                
                const workflowData = detailResponse.data.data;
                
                // Create filename from workflow name
                const filename = (workflowData.name || workflow.name || `workflow-${workflow.id}`)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') + '.json';
                
                const filepath = path.join(workflowsDir, filename);
                
                // Write workflow to file
                fs.writeFileSync(filepath, JSON.stringify(workflowData, null, 2));
                
                console.log(`${workflow.active ? '✅' : '❌'} ${workflowData.name || workflow.name || workflow.id} → ${filename}`);
                
            } catch (error) {
                console.log(`❌ Failed to export ${workflow.name || workflow.id}: ${error.message}`);
                
                // Try to save what we have
                try {
                    const filename = `workflow-${workflow.id}.json`;
                    const filepath = path.join(workflowsDir, filename);
                    fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
                    console.log(`💾 Saved basic info for ${workflow.id}`);
                } catch (saveError) {
                    console.log(`❌ Could not save basic info: ${saveError.message}`);
                }
            }
        }
        
        console.log('\n🎉 All workflows exported successfully!');
        
        // Create a manifest file
        const manifest = {
            exportDate: new Date().toISOString(),
            totalWorkflows: workflows.length,
            workflows: workflows.map(w => ({
                id: w.id,
                name: w.name,
                active: w.active,
                filename: w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.json'
            }))
        };
        
        fs.writeFileSync(path.join(workflowsDir, 'workflow-manifest.json'), JSON.stringify(manifest, null, 2));
        console.log('📄 Created workflow manifest file');
        
    } catch (error) {
        console.error('❌ Error exporting workflows:', error.message);
    }
}

exportAllWorkflows(); 