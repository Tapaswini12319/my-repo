const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017/meancrud';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Tutorial Schema
const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MEAN Stack Backend API',
    endpoints: {
      getAll: 'GET /api/tutorials',
      create: 'POST /api/tutorials',
      getOne: 'GET /api/tutorials/:id',
      update: 'PUT /api/tutorials/:id',
      delete: 'DELETE /api/tutorials/:id',
      deleteAll: 'DELETE /api/tutorials',
      findByTitle: 'GET /api/tutorials?title=xxx'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working!' });
});

// Get all tutorials
app.get('/api/tutorials', async (req, res) => {
  try {
    const { title } = req.query;
    let query = {};
    
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    
    const tutorials = await Tutorial.find(query);
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create tutorial
app.post('/api/tutorials', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const tutorial = new Tutorial({ title, description });
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tutorial by ID
app.get('/api/tutorials/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update tutorial
app.put('/api/tutorials/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete tutorial
app.delete('/api/tutorials/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });
    res.json({ message: 'Tutorial deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all tutorials
app.delete('/api/tutorials', async (req, res) => {
  try {
    await Tutorial.deleteMany({});
    res.json({ message: 'All tutorials deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoUrl}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
});
