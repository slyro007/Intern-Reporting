const axios = require('axios');

async function testCurrentStatus() {
    console.log('🔍 Testing Current Status...\n');
    
    try {
        // Test the get-logs endpoint
        console.log('📡 Testing get-logs endpoint...');
        const response = await axios.get('http://localhost:5678/webhook/get-logs-db');
        console.log('✅ Endpoint Response:', JSON.stringify(response.data, null, 2));
        console.log('📊 Data type:', typeof response.data);
        console.log('📊 Is array:', Array.isArray(response.data));
        console.log('📊 Length:', response.data?.length || 'N/A');
        
    } catch (error) {
        console.log('❌ Endpoint Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
    
    console.log('\n🔍 Testing daily log submission endpoint...');
    try {
        const testLog = {
            internEmail: 'test@example.com',
            internName: 'Test User',
            date: '2025-01-30',
            projectDescription: 'Test submission',
            tasksCompleted: 'Testing the system',
            timeSpent: '1',
            challenges: 'None',
            notes: 'This is a test',
            timestamp: new Date().toISOString()
        };
        
        const submitResponse = await axios.post('http://localhost:5678/webhook/daily-logs-db', testLog);
        console.log('✅ Submit Response:', submitResponse.status, submitResponse.data);
        
    } catch (error) {
        console.log('❌ Submit Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

testCurrentStatus(); 