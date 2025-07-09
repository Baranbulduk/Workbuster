import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testWelcomeMessages() {
  try {
    console.log('Testing welcome messages endpoints...');
    
    // Test GET all messages
    console.log('\n1. Testing GET /welcome-messages');
    const getResponse = await axios.get(`${BASE_URL}/welcome-messages`);
    console.log('GET Response:', getResponse.data);
    
    // Test POST create message
    console.log('\n2. Testing POST /welcome-messages');
    const createResponse = await axios.post(`${BASE_URL}/welcome-messages`, {
      title: 'Test Welcome Message',
      content: 'This is a test message',
      isDefault: false,
      locked: false
    });
    console.log('POST Response:', createResponse.data);
    
    const messageId = createResponse.data._id;
    
    // Test PUT update message
    console.log('\n3. Testing PUT /welcome-messages/:id');
    const updateResponse = await axios.put(`${BASE_URL}/welcome-messages/${messageId}`, {
      title: 'Updated Test Message',
      content: 'This is an updated test message'
    });
    console.log('PUT Response:', updateResponse.data);
    
    // Test DELETE message
    console.log('\n4. Testing DELETE /welcome-messages/:id');
    const deleteResponse = await axios.delete(`${BASE_URL}/welcome-messages/${messageId}`);
    console.log('DELETE Response:', deleteResponse.data);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWelcomeMessages(); 