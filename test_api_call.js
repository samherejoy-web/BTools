// Test script to check if the frontend can reach the backend API
const axios = require('axios');

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sync-codebase-8.preview.emergentagent.com';

console.log('Testing API connection to:', `${BACKEND_URL}/api`);

const testAPI = async () => {
    try {
        console.log('Testing basic connection...');
        const response = await axios.get(`${BACKEND_URL}/api/blogs/by-slug/medium-style-blog-test-125914`);
        console.log('✅ API call successful!');
        console.log('Blog title:', response.data.title);
        console.log('Status:', response.status);
    } catch (error) {
        console.log('❌ API call failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Error:', error.message);
        }
    }
};

testAPI();