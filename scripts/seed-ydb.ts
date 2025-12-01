/**
 * Seed script for YDB database
 * Creates 10 test users and 10 test events
 * 
 * Usage: npm run seed:ydb
 * or: npx tsx scripts/seed-ydb.ts
 */

import { faker } from '@faker-js/faker';
import { initYDBForMigrations } from '../backend/src/db/connection';
import { userRepository } from '../backend/src/repositories/userRepository';
import { eventRepository } from '../backend/src/repositories/eventRepository';
import type { User, Event } from '@dating-app/shared';

// Event categories
const eventCategories = [
  'music',
  'sport',
  'art',
  'cinema',
  'travel',
  'food',
  'technology',
  'literature',
  'dance',
  'theater',
];

// Generate fake photo URL using placeholder service
function generatePhotoUrl(gender: 'male' | 'female'): string {
  const genderParam = gender === 'male' ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${genderParam}/${faker.number.int({ min: 1, max: 99 })}.jpg`;
}

// Generate test users
function generateUsers(count: number = 10): User[] {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(['male', 'female'] as const);
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName();
    const now = new Date();
    
    const user: User = {
      id: `user-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      telegramId: faker.number.int({ min: 100000000, max: 999999999 }),
      username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      photoUrl: generatePhotoUrl(gender),
      bio: faker.person.bio(),
      age: faker.number.int({ min: 18, max: 65 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: now,
    };
    
    users.push(user);
  }
  
  return users;
}

// Generate test events
function generateEvents(count: number = 10): Event[] {
  const events: Event[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(eventCategories);
    const now = new Date();
    
    const event: Event = {
      id: `event-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      description: faker.lorem.paragraph({ min: 2, max: 4 }),
      category,
      imageUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(10)}/800/600`,
      location: faker.location.city(),
      date: faker.date.future({ years: 1 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: now,
    };
    
    events.push(event);
  }
  
  return events;
}

// Main seed function
async function seed() {
  console.log('🌱 Starting YDB database seed...');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

  try {
    // Initialize YDB connection
    console.log('📡 Connecting to YDB...');
    await initYDBForMigrations();
    console.log('✅ Connected to YDB\n');

    // Generate users
    console.log('👥 Generating 10 test users...');
    const users = generateUsers(10);
    
    // Save users to database
    console.log('💾 Saving users to database...');
    for (let i = 0; i < users.length; i++) {
      await userRepository.upsertUser(users[i]);
      console.log(`   ✓ User ${i + 1}/10: ${users[i].firstName} ${users[i].lastName} (${users[i].id})`);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // Generate events
    console.log('🎉 Generating 10 test events...');
    const events = generateEvents(10);
    
    // Save events to database
    console.log('💾 Saving events to database...');
    for (let i = 0; i < events.length; i++) {
      await eventRepository.createEvent(events[i]);
      console.log(`   ✓ Event ${i + 1}/10: ${events[i].title} (${events[i].category})`);
    }
    console.log(`✅ Created ${events.length} events\n`);

    // Summary
    console.log('📊 Seed Summary:');
    console.log(`   ✅ Users: ${users.length}`);
    console.log(`   ✅ Events: ${events.length}\n`);

    // Show sample data
    console.log('📝 Sample User:');
    console.log(JSON.stringify({
      id: users[0].id,
      telegramId: users[0].telegramId,
      firstName: users[0].firstName,
      lastName: users[0].lastName,
      username: users[0].username,
      age: users[0].age,
      bio: users[0].bio,
    }, null, 2));
    
    console.log('\n📝 Sample Event:');
    console.log(JSON.stringify({
      id: events[0].id,
      title: events[0].title,
      category: events[0].category,
      location: events[0].location,
      date: events[0].date,
    }, null, 2));
    
    console.log('\n✅ Seed completed successfully!');
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

