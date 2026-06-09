require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const { getAllUsers } = require('./src/controllers/userController');

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

connectDB().then(() => {
  const changeStream = User.watch();
  
  changeStream.on('change', async (change) => {
    console.log('Database change detected:', change.operationType);
    const users = await getAllUsers();
    io.emit('users-update', users);
    
    const { getDashboardStats } = require('./src/controllers/dashboardController');
    const stats = await getDashboardStats();
    io.emit('dashboard-stats-update', stats);
  });
  
  changeStream.on('error', (err) => {
    console.error('Change stream error. Using polling fallback.', err.message);
    setInterval(async () => {
      const users = await getAllUsers();
      io.emit('users-update', users);

      const { getDashboardStats } = require('./src/controllers/dashboardController');
      const stats = await getDashboardStats();
      io.emit('dashboard-stats-update', stats);
    }, 5000);
  });
});

io.on('connection', async (socket) => {
  console.log('Admin client connected:', socket.id);
  
  const users = await getAllUsers();
  socket.emit('users-update', users);

  const { getDashboardStats } = require('./src/controllers/dashboardController');
  const stats = await getDashboardStats();
  socket.emit('dashboard-stats-update', stats);

  socket.on('disconnect', () => {
    console.log('Admin client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Admin Server listening on port ${PORT}`);
});
