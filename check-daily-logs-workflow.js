const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

async function checkAllDailyLogsWorkflows() {
    const workflowIds = [
        '3Eq3btK7Nz11AxqE', // DB Daily Logs Working
        '5OD7GVs9LxpXpAn0'  // DB Daily Logs
    ];
    
    for (const workflowId of workflowIds) {
        try {
            console.log(`🔍 Checking workflow ${workflowId}...\n`);
            
            const response = await axios.get(`http://localhost:5678/api/v1/workflows/${workflowId}`, {
                headers: { 'X-N8N-API-KEY': API_KEY }
            });
            
            const workflow = response.data.data;
            console.log('📋 Workflow:', workflow.name);
            console.log('🔧 Active:', workflow.active);
            
            console.log('\n📦 Nodes in workflow:');
            workflow.nodes.forEach((node, index) => {
                console.log(`${index + 1}. ${node.type} - "${node.name}"`);
                
                // Show key parameters for database nodes
                if (node.type.includes('postgres') || node.type.includes('database')) {
                    console.log(`   📊 Query: ${node.parameters?.query || 'Not set'}`);
                }
                
                // Show webhook path
                if (node.type.includes('webhook')) {
                    console.log(`   🔗 Path: ${node.parameters?.path || 'Not set'}`);
                    console.log(`   📥 Method: ${node.parameters?.httpMethod || 'Not set'}`);
                }
            });
            
            // Check if there's a PostgreSQL node
            const hasPostgres = workflow.nodes.some(node => 
                node.type.includes('postgres') || node.type.includes('database') || node.name.includes('Database')
            );
            
            console.log('\n🎯 Analysis:');
            console.log('✅ Has Database node:', hasPostgres ? 'YES' : 'NO');
            
            if (!hasPostgres) {
                console.log('❌ PROBLEM: This workflow has no database node!');
                console.log('   This explains why submissions don\'t save to the database.');
            }
            
            console.log('\n' + '='.repeat(50) + '\n');
            
        } catch (error) {
            console.error(`❌ Error checking workflow ${workflowId}:`, error.message);
        }
    }
}

checkAllDailyLogsWorkflows(); 