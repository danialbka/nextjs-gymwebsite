#!/usr/bin/env tsx
/**
 * Database initialization script
 * Run this to set up the database schema
 */

import { config } from 'dotenv';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load environment variables with absolute path
config({ path: join(process.cwd(), '.env.local') });

import { query } from '../lib/database';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('Working directory:', process.cwd());
    
    // Read the schema file
    const schemaPath = join(process.cwd(), '..', 'schema.sql');
    console.log('Schema path:', schemaPath);
    const schema = await readFile(schemaPath, 'utf-8');
    
    // Execute the schema
    await query(schema);
    
    console.log('✅ Database schema created successfully!');
    
    // Test the connection by querying the users table
    const result = await query('SELECT COUNT(*) FROM users');
    console.log(`✅ Database connection test passed. Users table has ${result.rows[0].count} records.`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Database initialization completed.');
    process.exit(0);
  });
}

export { initializeDatabase };