const axios = require('axios');

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication workflow...');
    
    const testData = {
      email: 'sjalagam@wolfflogics.com',
      password: 'iamanintern'
    };
    
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:5678/webhook/auth-login', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data);
    }
  }
}

debugAuth(); 