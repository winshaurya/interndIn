const paths = [
  './src/Routes/authRoutes',
  './src/Routes/studentRoutes',
  './src/Routes/alumniRoutes',
  './src/Routes/adminRoutes',
  './src/Routes/JobRoutes',
  './src/Routes/jobApplicationRoutes',
  './src/Routes/uploadRoutes',
  './src/Routes/profileRoutes',
  './src/Routes/utilityRoutes',
  './src/Routes/connectionRoutes',
  './src/Routes/messageRoutes',
];
for (const p of paths) {
  try {
    const mod = require(p);
    console.log(p, '->', typeof mod, Array.isArray(mod) ? 'array' : '');
  } catch (e) {
    console.log(p, '-> ERROR requiring:', e && e.message);
  }
}
