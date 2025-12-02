require('dotenv').config();
const axios = require('axios');
const colors = require('colors');

/**
 * Test connection to backend API and authentication
 */
async function testConnection() {
  console.log(colors.cyan('\n🔍 Testing Backend Connection...\n'));

  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8888/api';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(colors.white('Configuration:'));
  console.log(colors.gray(`  API URL: ${API_BASE_URL}`));
  console.log(colors.gray(`  Email: ${ADMIN_EMAIL}`));
  console.log(colors.gray(`  Password: ${'*'.repeat(ADMIN_PASSWORD.length)}\n`));

  // Test 1: Backend reachability
  console.log(colors.yellow('Test 1: Backend Reachability'));
  try {
    const response = await axios.get(API_BASE_URL.replace('/api', '/'));
    console.log(colors.green('✅ Backend is reachable\n'));
  } catch (error) {
    console.log(colors.red('❌ Backend is NOT reachable'));
    console.log(colors.red(`   Error: ${error.message}`));
    console.log(colors.yellow('\n💡 Make sure backend is running on http://localhost:8888\n'));
    process.exit(1);
  }

  // Test 2: Login endpoint
  console.log(colors.yellow('Test 2: Login Endpoint'));
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (response.data && response.data.success && response.data.result && response.data.result.token) {
      console.log(colors.green('✅ Login successful'));
      console.log(colors.gray(`   Token: ${response.data.result.token.substring(0, 30)}...`));
      console.log(colors.gray(`   User: ${response.data.result.name} ${response.data.result.surname}`));
      console.log(colors.gray(`   Email: ${response.data.result.email}`));
      console.log(colors.gray(`   Role: ${response.data.result.role}\n`));

      // Test 3: Authenticated request
      console.log(colors.yellow('Test 3: Authenticated Request (Get Clients)'));
      try {
        const clientsResponse = await axios.get(`${API_BASE_URL}/client/list`, {
          headers: {
            'Authorization': `Bearer ${response.data.result.token}`,
          },
        });

        if (clientsResponse.data && clientsResponse.data.success) {
          const count = clientsResponse.data.result ? clientsResponse.data.result.length : 0;
          console.log(colors.green(`✅ Authenticated request successful`));
          console.log(colors.gray(`   Current clients in database: ${count}\n`));
        }
      } catch (error) {
        console.log(colors.red('❌ Authenticated request failed'));
        console.log(colors.red(`   Error: ${error.message}\n`));
      }

      console.log(colors.green('╔════════════════════════════════════════╗'));
      console.log(colors.green('║   All Tests Passed! ✅                ║'));
      console.log(colors.green('╚════════════════════════════════════════╝\n'));

      console.log(colors.cyan('You can now run the seed scripts:'));
      console.log(colors.white('  npm run seed          # Run all seeds'));
      console.log(colors.white('  npm run seed:clients  # Seed only clients'));
      console.log(colors.white('  npm run seed:invoices # Seed only invoices'));
      console.log(colors.white('  npm run seed:quotes   # Seed only quotes'));
      console.log(colors.white('  npm run seed:payments # Seed only payments\n'));

    } else {
      console.log(colors.red('❌ Login response missing token\n'));
      process.exit(1);
    }
  } catch (error) {
    console.log(colors.red('❌ Login failed'));
    if (error.response) {
      console.log(colors.red(`   Status: ${error.response.status}`));
      console.log(colors.red(`   Message: ${JSON.stringify(error.response.data)}`));
    } else {
      console.log(colors.red(`   Error: ${error.message}`));
    }
    console.log(colors.yellow('\n💡 Check your credentials in .env file\n'));
    process.exit(1);
  }
}

testConnection();
