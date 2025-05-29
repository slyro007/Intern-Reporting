const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

async function deactivateWorkflows() {
    console.log('🔧 Deactivating useless workflows...\n');
    
    // These are the duplicate/broken workflows we want to deactivate
    const workflowsToDeactivate = [
        '3Eq3btK7Nz11AxqE', // DB Daily Logs Working (broken - not saving to DB)
        '5OD7GVs9LxpXpAn0', // DB Daily Logs (duplicate)
        // Keep 4fQJRlF8Z71NhhHh (DB Get Logs Fixed) - this one we're fixing
        // Keep fje6Rnmx2puexP5E (Auth Login Working) - this one works
    ];
    
    for (const workflowId of workflowsToDeactivate) {
        try {
            console.log(`🔄 Deactivating workflow ${workflowId}...`);
            
            const response = await axios.post(
                `http://localhost:5678/api/v1/workflows/${workflowId}/deactivate`,
                {},
                {
                    headers: { 'X-N8N-API-KEY': API_KEY }
                }
            );
            
            console.log(`✅ Successfully deactivated ${workflowId}`);
            
        } catch (error) {
            console.error(`❌ Error deactivating ${workflowId}:`, error.message);
        }
    }
    
    console.log('\n📋 Checking final workflow status...');
    
    try {
        const response = await axios.get('http://localhost:5678/api/v1/workflows', {
            headers: { 'X-N8N-API-KEY': API_KEY }
        });
        
        console.log('\n📊 Final Active Workflows:');
        response.data.data.forEach(w => {
            if (w.active) {
                console.log(`✅ ${w.id} - ${w.name}`);
            }
        });
        
        console.log('\n❌ Inactive Workflows:');
        response.data.data.forEach(w => {
            if (!w.active) {
                console.log(`❌ ${w.id} - ${w.name}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error listing workflows:', error.message);
    }
}

deactivateWorkflows(); 