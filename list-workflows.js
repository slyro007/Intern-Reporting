const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

async function listWorkflows() {
    try {
        const response = await axios.get('http://localhost:5678/api/v1/workflows', {
            headers: { 'X-N8N-API-KEY': API_KEY }
        });
        
        console.log('📋 All Workflows:');
        response.data.data.forEach(w => {
            console.log(`${w.active ? '✅' : '❌'} ${w.id} - ${w.name}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listWorkflows(); 