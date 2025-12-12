/**
 * Script to create admin user
 * Usage: tsx scripts/create-admin.ts <email> <password>
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import { adminRepository } from '../backend/src/repositories/adminRepository';
import { postgresClient } from '../backend/src/db/postgresConnection';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password>');
    console.error('Example: tsx scripts/create-admin.ts admin@example.com mypassword123');
    process.exit(1);
  }

  try {
    // Connect to PostgreSQL
    await postgresClient.connect();

    // Check if admin already exists
    const existing = await adminRepository.findByEmail(email);
    if (existing) {
      console.error(`❌ Admin with email ${email} already exists`);
      console.error(`   ID: ${existing.id}`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await adminRepository.create({
      email,
      passwordHash,
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created at: ${admin.createdAt}`);
    console.log('');
    console.log('📝 You can now login to admin panel with:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();
