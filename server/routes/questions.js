const express = require('express');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getQuestions(req, res) {
    const projectId = req.params.projectId;

    Question.find({ projectId: projectId })
        .populate('authorId', 'name')
        .sort({ timestamp: 1 })
        .then(function(questions) {
            return res.json(questions);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function postQuestion(req, res) {
    const projectId = req.params.projectId;
    const userId = req.user.userId;
    const text = req.body.text;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Question text is required' });
    }

    const newQuestion = new Question({
        projectId: projectId,
        authorId: userId,
        text: text.trim()
    });

    newQuestion.save()
        .then(function(savedQuestion) {
            return Question.findById(savedQuestion._id).populate('authorId', 'name');
        })
        .then(function(populatedQuestion) {
            return res.status(201).json(populatedQuestion);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

router.get('/:projectId', authMiddleware, getQuestions);
router.post('/:projectId', authMiddleware, postQuestion);

module.exports = router;
