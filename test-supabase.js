const db = require('./backend/src/config/db.js');
console.log('Supabase configuration loaded successfully');

// Test basic connection
async function testConnection() {
  try {
    const { data, error } = await db.from('users').select('count').limit(1);
    if (error) {
      console.error('Database connection error:', error);
    } else {
      console.log('Database connection successful');
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testConnection();
