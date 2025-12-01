/**
 * Seed script for development database
 * Generates test data: users, events, likes, and matches
 * 
 * Usage: npm run seed:dev
 */

import { faker } from '@faker-js/faker';
import { User, Event, Like, Match } from '@dating-app/shared';

// Mock database interface
// In real implementation, this would connect to YDB
interface Database {
  users: User[];
  events: Event[];
  likes: Like[];
  matches: Match[];
}

// Initialize mock database
const db: Database = {
  users: [],
  events: [],
  likes: [],
  matches: [],
};

// Generate fake photo URL using placeholder service
function generatePhotoUrl(gender: 'male' | 'female'): string {
  const seed = faker.string.alphanumeric(10);
  const genderParam = gender === 'male' ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${genderParam}/${faker.number.int({ min: 1, max: 99 })}.jpg`;
}

// Generate 50 users with fake photos
function generateUsers(count: number = 50): User[] {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(['male', 'female'] as const);
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName();
    
    const user: User = {
      id: faker.string.uuid(),
      telegramId: faker.number.int({ min: 100000000, max: 999999999 }),
      username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      photoUrl: generatePhotoUrl(gender),
      bio: faker.person.bio(),
      age: faker.number.int({ min: 18, max: 65 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
    
    users.push(user);
  }
  
  return users;
}

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
  'photography',
  'gaming',
  'yoga',
  'running',
  'cooking',
  'language',
  'charity',
  'business',
  'science',
  'fashion',
];

// Generate 20 events in different categories
function generateEvents(count: number = 20): Event[] {
  const events: Event[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(eventCategories);
    const event: Event = {
      id: faker.string.uuid(),
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      description: faker.lorem.paragraph({ min: 2, max: 4 }),
      category,
      imageUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(10)}/800/600`,
      location: faker.location.city(),
      date: faker.date.future({ years: 1 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
    
    events.push(event);
  }
  
  return events;
}

// Generate random likes between users
function generateLikes(users: User[], events: Event[], count: number = 200): Like[] {
  const likes: Like[] = [];
  
  for (let i = 0; i < count; i++) {
    const fromUser = faker.helpers.arrayElement(users);
    // Ensure user doesn't like themselves
    const toUsers = users.filter(u => u.id !== fromUser.id);
    const toUser = faker.helpers.arrayElement(toUsers);
    const event = faker.datatype.boolean() ? faker.helpers.arrayElement(events) : undefined;
    
    const like: Like = {
      id: faker.string.uuid(),
      fromUserId: fromUser.id,
      toUserId: toUser.id,
      eventId: event?.id,
      createdAt: faker.date.recent({ days: 30 }),
    };
    
    likes.push(like);
  }
  
  return likes;
}

// Generate matches from mutual likes
function generateMatches(likes: Like[], users: User[], events: Event[]): Match[] {
  const matches: Match[] = [];
  const mutualLikes = new Map<string, { from: string; to: string; eventId?: string }>();
  
  // Find mutual likes
  for (const like of likes) {
    const key = `${like.fromUserId}-${like.toUserId}`;
    const reverseKey = `${like.toUserId}-${like.fromUserId}`;
    
    if (mutualLikes.has(reverseKey)) {
      // Mutual like found - create match
      const existing = mutualLikes.get(reverseKey)!;
      const match: Match = {
        id: faker.string.uuid(),
        userId1: like.fromUserId,
        userId2: like.toUserId,
        eventId: like.eventId || existing.eventId,
        createdAt: faker.date.recent({ days: 30 }),
      };
      matches.push(match);
      mutualLikes.delete(reverseKey);
    } else {
      mutualLikes.set(key, {
        from: like.fromUserId,
        to: like.toUserId,
        eventId: like.eventId,
      });
    }
  }
  
  // Add a few more random matches to ensure we have some
  const additionalMatches = Math.min(10, users.length / 2);
  for (let i = 0; i < additionalMatches; i++) {
    const user1 = faker.helpers.arrayElement(users);
    const user2 = faker.helpers.arrayElement(users.filter(u => u.id !== user1.id));
    const event = faker.datatype.boolean() ? faker.helpers.arrayElement(events) : undefined;
    
    // Check if match already exists
    const exists = matches.some(
      m => (m.userId1 === user1.id && m.userId2 === user2.id) ||
           (m.userId1 === user2.id && m.userId2 === user1.id)
    );
    
    if (!exists) {
      matches.push({
        id: faker.string.uuid(),
        userId1: user1.id,
        userId2: user2.id,
        eventId: event?.id,
        createdAt: faker.date.recent({ days: 30 }),
      });
    }
  }
  
  return matches;
}

// Main seed function
async function seed() {
  console.log('🌱 Starting database seed...');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check if we're in development mode
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production') {
    console.error('❌ Seed script should not be run in production mode!');
    console.error('   Set NODE_ENV=development to run seed script.');
    process.exit(1);
  }
  
  try {
    // Generate users
    console.log('👥 Generating users...');
    const users = generateUsers(50);
    db.users = users;
    console.log(`✅ Generated ${users.length} users`);
    
    // Generate events
    console.log('🎉 Generating events...');
    const events = generateEvents(20);
    db.events = events;
    console.log(`✅ Generated ${events.length} events`);
    
    // Generate likes
    console.log('❤️  Generating likes...');
    const likes = generateLikes(users, events, 200);
    db.likes = likes;
    console.log(`✅ Generated ${likes.length} likes`);
    
    // Generate matches
    console.log('💕 Generating matches...');
    const matches = generateMatches(likes, users, events);
    db.matches = matches;
    console.log(`✅ Generated ${matches.length} matches`);
    
    // TODO: In real implementation, save to YDB database
    // For now, we just log the data structure
    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${db.users.length}`);
    console.log(`   Events: ${db.events.length}`);
    console.log(`   Likes: ${db.likes.length}`);
    console.log(`   Matches: ${db.matches.length}`);
    
    // Show sample data
    console.log('\n📝 Sample User:');
    console.log(JSON.stringify(db.users[0], null, 2));
    
    console.log('\n📝 Sample Event:');
    console.log(JSON.stringify(db.events[0], null, 2));
    
    console.log('\n📝 Sample Match:');
    if (db.matches.length > 0) {
      const match = db.matches[0];
      const user1 = db.users.find(u => u.id === match.userId1);
      const user2 = db.users.find(u => u.id === match.userId2);
      console.log(JSON.stringify({
        ...match,
        user1: user1 ? { id: user1.id, name: `${user1.firstName} ${user1.lastName}` } : null,
        user2: user2 ? { id: user2.id, name: `${user2.firstName} ${user2.lastName}` } : null,
      }, null, 2));
    }
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n⚠️  Note: This is a mock implementation.');
    console.log('   To save to real database, implement YDB connection in this script.');
    
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  }
}

// Run seed when script is executed
seed();

export { seed, db };

