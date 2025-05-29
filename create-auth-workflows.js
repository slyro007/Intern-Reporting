const N8nApiClient = require('./n8n-api-client');

async function createAuthWorkflows() {
  const client = new N8nApiClient();
  
  // Test connection first
  const connected = await client.testConnection();
  if (!connected) {
    console.error('Cannot connect to n8n API');
    return;
  }

  console.log('🔐 Creating Authentication Workflows...\n');

  // Create User Login Workflow - minimal structure
  const loginWorkflow = {
    name: "User Login",
    settings: {},
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "auth-login",
          options: {
            noResponseBody: false
          }
        },
        id: "login-webhook-node",
        name: "Login Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [240, 300],
        webhookId: "auth-login"
      },
      {
        parameters: {
          functionCode: `// Extract login data from webhook
const inputData = $input.first().json;
const { email, password } = inputData;

console.log('Login attempt for:', email);

// Validate required fields
if (!email || !password) {
  return [{
    json: {
      success: false,
      error: 'Email and password are required'
    }
  }];
}

// Mock user database - in production, query actual database
const mockUsers = [
  {
    id: 'user_001',
    name: 'Srujan Jalagam',
    email: 'srujan@wolfflogics.com',
    password: 'password123',
    role: 'intern'
  },
  {
    id: 'user_002',
    name: 'Admin User',
    email: 'admin@wolfflogics.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 'user_003',
    name: 'Demo Intern',
    email: 'demo@wolfflogics.com',
    password: 'demo123',
    role: 'intern'
  }
];

// Find user by email
const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

if (!user || user.password !== password) {
  console.log('Login failed for:', email);
  return [{
    json: {
      success: false,
      error: 'Invalid email or password'
    }
  }];
}

console.log('Login successful for:', user.email);

return [{
  json: {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}];`
        },
        id: "login-function-node", 
        name: "Validate Login",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [460, 300]
      },
      {
        parameters: {
          respondWith: "json",
          responseBody: "={{ $json }}",
          options: {}
        },
        id: "login-response-node",
        name: "Login Response",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [680, 300]
      }
    ],
    connections: {
      "Login Webhook": {
        main: [
          [
            {
              node: "Validate Login",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Validate Login": {
        main: [
          [
            {
              node: "Login Response",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    }
  };

  // Create User Registration Workflow - minimal structure
  const registrationWorkflow = {
    name: "User Registration",
    settings: {},
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "auth-register",
          options: {
            noResponseBody: false
          }
        },
        id: "register-webhook-node",
        name: "Registration Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [240, 300],
        webhookId: "auth-register"
      },
      {
        parameters: {
          functionCode: `// Extract registration data from webhook
const inputData = $input.first().json;
const { name, email, password } = inputData;

console.log('Registration attempt for:', email);

// Validate required fields
if (!name || !email || !password) {
  return [{
    json: {
      success: false,
      error: 'Name, email, and password are required'
    }
  }];
}

// Validate email format
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
if (!emailRegex.test(email)) {
  return [{
    json: {
      success: false,
      error: 'Please enter a valid email address'
    }
  }];
}

// Validate password strength
if (password.length < 6) {
  return [{
    json: {
      success: false,
      error: 'Password must be at least 6 characters long'
    }
  }];
}

// In production, check if user already exists
// For now, simulate successful registration
const userId = 'user_' + Date.now();

console.log('Registration successful for:', email);

return [{
  json: {
    success: true,
    message: 'Registration successful! Please log in.',
    userId: userId
  }
}];`
        },
        id: "register-function-node",
        name: "Validate Registration", 
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [460, 300]
      },
      {
        parameters: {
          respondWith: "json",
          responseBody: "={{ $json }}",
          options: {}
        },
        id: "register-response-node",
        name: "Registration Response",
        type: "n8n-nodes-base.respondToWebhook", 
        typeVersion: 1,
        position: [680, 300]
      }
    ],
    connections: {
      "Registration Webhook": {
        main: [
          [
            {
              node: "Validate Registration",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Validate Registration": {
        main: [
          [
            {
              node: "Registration Response",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    }
  };

  try {
    // Create login workflow
    console.log('🔑 Creating User Login Workflow...');
    const loginWf = await client.createWorkflow(loginWorkflow);
    if (loginWf && loginWf.id) {
      console.log(`✅ Login workflow created! ID: ${loginWf.id}`);
      console.log(`🚪 Login endpoint: http://localhost:5678/webhook/auth-login\n`);
    }

    // Create registration workflow
    console.log('📝 Creating User Registration Workflow...');
    const regWorkflow = await client.createWorkflow(registrationWorkflow);
    if (regWorkflow && regWorkflow.id) {
      console.log(`✅ Registration workflow created! ID: ${regWorkflow.id}`);
      console.log(`📧 Registration endpoint: http://localhost:5678/webhook/auth-register\n`);
    }

    console.log('🎉 Authentication workflows created successfully!');
    console.log('\n🔧 Next Steps:');
    console.log('1. Go to http://localhost:5678 to access n8n');
    console.log('2. Find and activate both authentication workflows');
    console.log('3. Test with: ./test-webhooks.ps1');
    
    console.log('\n📋 Test Users Available:');
    console.log('• srujan@wolfflogics.com / password123 (intern)');
    console.log('• admin@wolfflogics.com / admin123 (admin)');
    console.log('• demo@wolfflogics.com / demo123 (intern)');

    return { login: loginWf, registration: regWorkflow };
  } catch (error) {
    console.error('❌ Error creating authentication workflows:');
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run the script
if (require.main === module) {
  createAuthWorkflows();
}

module.exports = createAuthWorkflows; 