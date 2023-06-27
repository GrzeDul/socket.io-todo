const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();

const tasks = [];

app.use(express.static(path.join(__dirname, '/client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});

const io = socket(server);
app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});

const handleConnection = (socket) => {
  socket.emit('updateData', tasks);
  socket.on('addTask', (task) => {
    tasks.push(task);
    socket.broadcast.emit('addTask', task);
  });
  socket.on('removeTask', (id) => {
    const taskToRemove = tasks.find((task) => task.id === id);
    tasks.splice(tasks.indexOf(taskToRemove), 1);
    socket.broadcast.emit('removeTask', id);
  });
};

io.on('connection', handleConnection);
