const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const swipeRoutes = require('./routes/swipes');
const matchRoutes = require('./routes/matches');
const questionRoutes = require('./routes/questions');
const ideaRoutes = require('./routes/ideas');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ideas', ideaRoutes);

app.get('/api/health', function(req, res) {
    return res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(function() {
        console.log('Connected to MongoDB');
        app.listen(PORT, function() {
            console.log('Server running on port ' + PORT);
        });
    })
    .catch(function(error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    });
