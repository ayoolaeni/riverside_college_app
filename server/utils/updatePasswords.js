import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const updateUserPasswords = async () => {
  try {
    console.log('🔄 Updating user passwords...');
    
    // Generate the correct hash for 'password123'
    const correctHash = await bcrypt.hash('password123', 10);
    console.log('✅ Generated hash for password123:', correctHash);
    
    // Update all existing users with the correct password hash
    const updateQuery = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE email IN ('admin@riverside.edu', 'teacher@riverside.edu', 'student@riverside.edu')
    `;
    
    const result = await pool.query(updateQuery, [correctHash]);
    console.log(`✅ Updated ${result.rowCount} user passwords`);
    
    // Verify the users exist
    const verifyQuery = 'SELECT email, role, full_name FROM users ORDER BY role';
    const users = await pool.query(verifyQuery);
    
    console.log('\n📋 Current users in database:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.full_name}`);
    });
    
    console.log('\n🎯 Test these credentials:');
    console.log('  Admin: admin@riverside.edu / password123');
    console.log('  Teacher: teacher@riverside.edu / password123');
    console.log('  Student: student@riverside.edu / password123');
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    process.exit(0);
  }
};

updateUserPasswords();