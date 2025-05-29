const axios = require('axios');

async function debugFrontendData() {
    console.log('🔍 Debugging frontend data format...\\n');
    
    try {
        const response = await axios.get('http://localhost:5678/webhook/get-logs-db');
        console.log('✅ Raw response from get-logs-db:');
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log('\\n📊 Data analysis:');
        console.log('Type:', typeof response.data);
        console.log('Is Array:', Array.isArray(response.data));
        
        if (Array.isArray(response.data) && response.data.length > 0) {
            const firstLog = response.data[0];
            console.log('\\n📝 First log entry:');
            Object.keys(firstLog).forEach(key => {
                console.log(`${key}: ${firstLog[key]} (${typeof firstLog[key]})`);
            });
            
            console.log('\\n📅 Date field analysis:');
            console.log('log_date value:', firstLog.log_date);
            console.log('log_date type:', typeof firstLog.log_date);
            console.log('Date object:', new Date(firstLog.log_date));
            console.log('Is valid date:', !isNaN(new Date(firstLog.log_date)));
            console.log('Formatted:', new Date(firstLog.log_date).toLocaleDateString());
        }
        
    } catch (error) {
        console.log('❌ Error fetching data:');
        console.log('Message:', error.message);
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
    }
}

debugFrontendData(); 