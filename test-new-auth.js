const axios = require('axios');

const testUsers = [
  {
    email: 'sjalagam@wolfflogics.com',
    password: 'iamanintern',
    expectedRole: 'intern'
  },
  {
    email: 'dsolomon@wolfflogics.com',
    password: 'lmaowow',
    expectedRole: 'admin'
  },
  {
    email: 'ehammond@wolfflogics.com',
    password: 'imaderp',
    expectedRole: 'admin'
  },
  {
    email: 'pcounts@wolfflogics.com',
    password: 'imalsoaderp',
    expectedRole: 'admin'
  }
];

async function testAuthentication() {
  console.log('🧪 Testing Role-Based Authentication System\n');

  for (const testUser of testUsers) {
    try {
      console.log(`Testing ${testUser.email}...`);
      
      const response = await axios.post('http://localhost:5678/webhook/auth-login', {
        email: testUser.email,
        password: testUser.password
      });

      if (response.data.success) {
        const user = response.data.user;
        console.log(`✅ Success - ${user.name} (${user.role})`);
        console.log(`   Permissions: ${user.permissions.join(', ')}`);
        
        if (user.role === testUser.expectedRole) {
          console.log(`   ✓ Role matches expected: ${testUser.expectedRole}`);
        } else {
          console.log(`   ❌ Role mismatch - expected: ${testUser.expectedRole}, got: ${user.role}`);
        }
      } else {
        console.log(`❌ Failed - ${response.data.error}`);
      }
    } catch (error) {
      console.log(`❌ Error - ${error.message}`);
    }
    console.log('');
  }

  // Test invalid credentials
  console.log('Testing invalid credentials...');
  try {
    const response = await axios.post('http://localhost:5678/webhook/auth-login', {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });
    
    if (!response.data.success) {
      console.log(`✅ Invalid credentials properly rejected: ${response.data.error}`);
    } else {
      console.log('❌ Invalid credentials were accepted!');
    }
  } catch (error) {
    console.log(`❌ Error testing invalid credentials: ${error.message}`);
  }
}

testAuthentication(); 