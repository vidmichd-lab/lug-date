/**
 * Seed script that adds test data via API
 * Creates 10 test users and 10 test events
 * 
 * Usage: npm run seed:api
 * or: npx tsx scripts/seed-via-api.ts
 */

const API_BASE_URL = process.env.API_URL || process.env.BACKEND_URL || 'https://functions.yandexcloud.net/d4er75rsvc5mopabt70v';


// Make API request
async function apiRequest(endpoint: string, method: string, data?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error?.message || `HTTP ${response.status}`);
  }
  
  return result;
}

// Main seed function
async function seed() {
  console.log('🌱 Starting API seed...');
  console.log(`API URL: ${API_BASE_URL}\n`);

  try {
    // Check API health
    console.log('📡 Checking API health...');
    try {
      const health = await apiRequest('/api/v1/health', 'GET');
      console.log(`✅ API is healthy: ${health.status}\n`);
    } catch (error) {
      console.error('❌ API health check failed:', error);
      console.error('   Make sure backend is running on', API_BASE_URL);
      process.exit(1);
    }

    // Create users via Admin API
    console.log('💾 Creating users via Admin API...');
    try {
      const usersResult = await apiRequest('/api/admin/management/seed/users', 'POST', { count: 10 });
      console.log(`   ✅ Created ${usersResult.count} users`);
      usersResult.data.slice(0, 3).forEach((user: any, i: number) => {
        console.log(`   ✓ User ${i + 1}: ${user.firstName} ${user.lastName}`);
      });
    } catch (error) {
      console.error(`   ✗ Failed to create users:`, error instanceof Error ? error.message : error);
    }
    console.log('');

    // Create events via Admin API
    console.log('💾 Creating events via Admin API...');
    try {
      const eventsResult = await apiRequest('/api/admin/management/seed/events', 'POST', { count: 10 });
      console.log(`   ✅ Created ${eventsResult.count} events`);
      eventsResult.data.slice(0, 3).forEach((event: any, i: number) => {
        console.log(`   ✓ Event ${i + 1}: ${event.title} (${event.category})`);
      });
    } catch (error) {
      console.error(`   ✗ Failed to create events:`, error instanceof Error ? error.message : error);
    }
    console.log('');

    // Summary
    console.log('📊 Seed Summary:');
    console.log(`   ✅ Users: 10`);
    console.log(`   ✅ Events: 10\n`);
    
    console.log('✅ Seed completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during seed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run seed when script is executed
seed();

