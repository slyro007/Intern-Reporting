const axios = require('axios');

async function testSelfEvalSubmission() {
  const testData = {
    internEmail: 'sjalagam@wolfflogics.com',
    internName: 'Sujith Jalagam',
    weekStartDate: '2025-05-26',
    weekEndDate: '2025-05-30',
    accomplishments: 'Completed computer setups using Immy.bot, learned new troubleshooting techniques',
    challenges: 'Had some issues with domain joining, but resolved them by checking network connectivity',
    learnings: 'Learned how to troubleshoot network connectivity issues and domain join problems',
    goals: 'Focus on improving efficiency with Immy.bot and learning more advanced configurations',
    productivity: '4'
  };

  try {
    console.log('🧪 Testing self-evaluation submission...');
    console.log('📤 Sending data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5678/webhook/submit-self-evaluation', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Response received!');
    console.log('📄 Status:', response.status);
    console.log('📄 Data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   No response received');
      console.error('   Request:', error.request);
    } else {
      console.error('   Error:', error.message);
    }
    throw error;
  }
}

if (require.main === module) {
  testSelfEvalSubmission()
    .then(result => {
      console.log('🎉 Test completed successfully!');
      console.log('Result:', result);
    })
    .catch(error => {
      console.error('💥 Test failed!');
      process.exit(1);
    });
}

module.exports = { testSelfEvalSubmission }; 