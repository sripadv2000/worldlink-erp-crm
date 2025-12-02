require('dotenv').config();
const axios = require('axios');
const colors = require('colors');

/**
 * Login to the ERP system and get authentication token
 * @returns {Promise<string>} JWT token
 */
async function login() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8888/api';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    console.log(colors.cyan(`\n🔐 Attempting login to: ${API_BASE_URL}/login`));
    console.log(colors.cyan(`📧 Email: ${ADMIN_EMAIL}`));

    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (response.data && response.data.success && response.data.result && response.data.result.token) {
      const token = response.data.result.token;
      console.log(colors.green(`✅ Login successful!`));
      console.log(colors.gray(`Token: ${token.substring(0, 20)}...`));
      return token;
    } else {
      throw new Error('Login response missing token');
    }
  } catch (error) {
    console.error(colors.red('\n❌ Login failed!'));
    if (error.response) {
      console.error(colors.red(`Status: ${error.response.status}`));
      console.error(colors.red(`Message: ${JSON.stringify(error.response.data)}`));
    } else {
      console.error(colors.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}

/**
 * Get axios instance with authentication headers
 * @param {string} token - JWT token
 * @returns {object} Configured axios instance
 */
function getAuthenticatedAxios(token) {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8888/api';

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

module.exports = { login, getAuthenticatedAxios };
