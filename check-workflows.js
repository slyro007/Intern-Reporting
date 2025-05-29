const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5678/api/v1',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q',
    'Content-Type': 'application/json'
  }
});

async function checkWorkflows() {
  try {
    const response = await api.get('/workflows');
    console.log('Available workflows:');
    response.data.data.forEach(w => {
      console.log(`- ${w.name} (ID: ${w.id}) - Active: ${w.active}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkWorkflows(); 