import bcrypt from 'bcryptjs';

// Utility to generate password hash
const generateHash = async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
};

// Generate hash for 'password123'
generateHash('password123').then(() => {
  process.exit(0);
});