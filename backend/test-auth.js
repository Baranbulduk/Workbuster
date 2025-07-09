import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testWelcomeMessagesWithoutAuth() {
  try {
    console.log('Testing welcome messages endpoints without authentication...');
    
    // Test POST create message without auth
    console.log('\n1. Testing POST /welcome-messages (no auth)');
    const createResponse = await axios.post(`${BASE_URL}/welcome-messages`, {
      title: 'Test Welcome Message',
      content: 'This is a test message',
      isDefault: false,
      locked: false
    });
    console.log('POST Response:', createResponse.data);
    
    console.log('\n✅ Test passed! The endpoint works without authentication.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
  }
}

testWelcomeMessagesWithoutAuth(); 