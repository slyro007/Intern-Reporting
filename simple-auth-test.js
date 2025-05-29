const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing auth for intern...');
    const response = await axios.post('http://localhost:5678/webhook/auth-login', {
      email: 'sjalagam@wolfflogics.com',
      password: 'iamanintern'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testAuth(); 