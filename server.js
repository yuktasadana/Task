const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/taskApp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const taskSchema = new mongoose.Schema({
  taskNo: { type: String, unique: true },
  estimates: [
    {
      estimateNotes: String,
      estimateHours: Number,
    },
  ],
  actualHours: Number,
  actualNotes: String,
  completed: Boolean,
});

const Task = mongoose.model('Task', taskSchema);

app.post('/api/task', async (req, res) => {
  try {
    const { taskNo, estimateNotes, estimateHours, actualHours, actualNotes, completed } = req.body;

    const existingTask = await Task.findOne({ taskNo });

    if (existingTask) {
      if (completed) {
        existingTask.completed = true;
        existingTask.actualHours = actualHours;
        existingTask.actualNotes = actualNotes;
        await existingTask.save();
      } else {
        existingTask.estimates.push({ estimateNotes, estimateHours });
        await existingTask.save();
      }
    } else {
      const newTask = new Task({
        taskNo,
        estimates: [{ estimateNotes, estimateHours }],
        actualHours: completed ? actualHours : undefined,
        actualNotes: completed ? actualNotes : undefined,
        completed: completed || false,
      });
      await newTask.save();
    }

    res.status(200).send('Task saved successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});