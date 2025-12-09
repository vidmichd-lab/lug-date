/**
 * Script to create admin user
 * Usage: tsx scripts/create-admin.ts <email> <password>
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import { adminRepository } from '../backend/src/repositories/adminRepository';
import { initYDBForMigrations } from '../backend/src/db/connection';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password>');
    process.exit(1);
  }

  try {
    // Skip driver ready check to avoid hanging
    process.env.YDB_SKIP_READY_CHECK = 'true';

    // Initialize YDB connection
    await initYDBForMigrations();

    // Check if admin already exists
    const existing = await adminRepository.findByEmail(email);
    if (existing) {
      console.error(`Admin with email ${email} already exists`);
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

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();
