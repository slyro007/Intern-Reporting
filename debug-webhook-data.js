const axios = require('axios');

async function debugWebhookData() {
    console.log('🔍 Testing webhook data format...\n');
    
    // Test data matching your frontend format
    const testData = {
        internEmail: 'test@example.com',
        internName: 'Test User',
        date: '2025-01-30',
        projectDescription: 'Test project',
        tasksCompleted: 'Testing webhook',
        timeSpent: '1',
        challenges: 'None',
        notes: 'Test notes',
        timestamp: new Date().toISOString()
    };
    
    console.log('📤 Sending data:');
    console.log(JSON.stringify(testData, null, 2));
    
    try {
        const response = await axios.post('http://localhost:5678/webhook/daily-logs-db', testData);
        console.log('\n✅ Success Response:');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        
    } catch (error) {
        console.log('\n❌ Error Response:');
        console.log('Message:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        }
    }
}

debugWebhookData(); 