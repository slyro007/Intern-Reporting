const axios = require('axios');

async function testNewEndpoint() {
    console.log('🔍 Testing NEW webhook endpoint: /webhook/daily-logs-new\n');
    
    const testData = {
        internEmail: 'test@example.com',
        internName: 'Test User NEW ENDPOINT',
        date: '2025-01-30',
        projectDescription: 'TESTING NEW ENDPOINT',
        tasksCompleted: 'Testing new unique endpoint',
        timeSpent: '2',
        challenges: 'None',
        notes: 'This should save to database'
    };
    
    try {
        console.log('📤 Sending to new endpoint...');
        const response = await axios.post('http://localhost:5678/webhook/daily-logs-new', testData);
        console.log('✅ Success! Status:', response.status);
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ Error!');
        console.log('Message:', error.message);
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
    }
}

testNewEndpoint(); 