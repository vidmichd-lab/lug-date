/**
 * Script to create admin user via API
 * Usage: tsx scripts/create-admin-via-api.ts <email> <password> [backend-url]
 */

import axios from 'axios';

async function createAdminViaAPI() {
  const email = process.argv[2];
  const password = process.argv[3];
  const backendUrl = process.argv[4] || 'https://bba2from3lh3r2baegq5.containers.yandexcloud.net';

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin-via-api.ts <email> <password> [backend-url]');
    console.error('Example: tsx scripts/create-admin-via-api.ts admin@example.com admin123');
    process.exit(1);
  }

  try {
    console.log(`🔐 Creating admin via API: ${backendUrl}`);
    console.log(`   Email: ${email}`);

    // First, check if backend is available
    const healthCheck = await axios.get(`${backendUrl}/health`);
    console.log(`✅ Backend is healthy: ${healthCheck.status}`);

    // Note: This script assumes there's an endpoint to create admin
    // If not, you'll need to create admin directly in database or through migration
    console.log('\n⚠️  Note: There is no API endpoint to create admin.');
    console.log('   You need to create admin directly in YDB database.');
    console.log('\n   Options:');
    console.log('   1. Run migrations first: npm run migrate');
    console.log('   2. Then create admin via database directly');
    console.log('   3. Or use the create-admin script after fixing YDB connection issues');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to create admin:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

createAdminViaAPI();
