import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ATLAS_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v1.0';

export async function whitelistCurrentIP() {
  console.log('🔄 Starting IP whitelisting process...');
  try {
    const publicKey = process.env.MONGO_ATLAS_PUBLIC_KEY;
    const privateKey = process.env.MONGO_ATLAS_PRIVATE_KEY;
    const projectId = process.env.MONGO_PROJECT_ID;

    console.log('🔍 Checking Atlas credentials...');
    console.log('Public Key present:', !!publicKey);
    console.log('Private Key present:', !!privateKey);
    console.log('Project ID present:', !!projectId);

    if (!publicKey || !privateKey || !projectId) {
      console.log('⚠️  Atlas API credentials not found in .env. Skipping IP whitelisting.');
      console.log('Required env vars: MONGO_ATLAS_PUBLIC_KEY, MONGO_ATLAS_PRIVATE_KEY, MONGO_PROJECT_ID');
      return;
    }

    // Fetch current public IP
    console.log('🌐 Fetching current public IP...');
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const currentIP = ipResponse.data.ip;
    console.log(`📍 Current IP: ${currentIP}`);

    // Check if IP is already whitelisted
    const accessListUrl = `${ATLAS_BASE_URL}/groups/${projectId}/accessList`;
    const auth = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');

    console.log('🔍 Checking existing whitelist...');
    const existingResponse = await axios.get(accessListUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const existingIPs = existingResponse.data;
    const ipExists = existingIPs.results.some(entry => entry.ipAddress === currentIP);

    if (ipExists) {
      console.log('✅ IP already whitelisted');
      return;
    }

    // Add IP to whitelist
    console.log('🔒 Adding IP to MongoDB Atlas whitelist...');
    await axios.post(accessListUrl, {
      ipAddress: currentIP,
      comment: 'Auto-added by Community Connect'
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ IP successfully whitelisted in MongoDB Atlas');

  } catch (error) {
    console.error('❌ Error whitelisting IP:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}
