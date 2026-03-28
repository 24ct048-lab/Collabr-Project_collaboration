const express = require('express');
const Idea = require('../models/Idea');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getAllIdeas(req, res) {
    Idea.find({})
        .sort({ createdAt: -1 })
        .populate('authorId', 'name')
        .then(function(ideas) {
            return res.json(ideas);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function createIdea(req, res) {
    const userId = req.user.userId;
    const title = req.body.title;
    const description = req.body.description;
    const tags = req.body.tags;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const tagsArray = Array.isArray(tags)
        ? tags
        : (typeof tags === 'string'
            ? tags.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t.length > 0; })
            : []);

    const newIdea = new Idea({
        authorId: userId,
        title: title,
        description: description,
        tags: tagsArray
    });

    newIdea.save()
        .then(function(savedIdea) {
            return savedIdea.populate('authorId', 'name');
        })
        .then(function(populated) {
            return res.status(201).json(populated);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

router.get('/', authMiddleware, getAllIdeas);
router.post('/', authMiddleware, createIdea);

module.exports = router;
