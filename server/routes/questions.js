const express = require('express');
const Question = require('../models/Question');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getUnansweredForOwner(req, res) {
    const userId = req.user.userId;

    Project.find({ creatorId: userId, status: 'open' })
        .select('_id')
        .then(function(projects) {
            const projectIds = projects.map(function(p) {
                return p._id;
            });
            if (projectIds.length === 0) {
                return [];
            }
            return Question.find({
                projectId: { $in: projectIds },
                $or: [
                    { answer: { $exists: false } },
                    { answer: '' },
                    { answer: null }
                ]
            })
                .populate('projectId', 'title')
                .populate('authorId', 'name')
                .sort({ timestamp: -1 });
        })
        .then(function(questions) {
            return res.json(questions);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function patchQuestionAnswer(req, res) {
    const userId = req.user.userId;
    const questionId = req.params.questionId;
    const answer = req.body.answer;

    if (answer === undefined || String(answer).trim() === '') {
        return res.status(400).json({ error: 'Answer is required' });
    }

    Question.findById(questionId)
        .populate('projectId')
        .then(function(question) {
            if (!question) {
                return res.status(404).json({ error: 'Question not found' });
            }
            const creatorId = question.projectId.creatorId.toString();
            if (creatorId !== String(userId)) {
                return res.status(403).json({ error: 'Only the project owner can answer' });
            }
            question.answer = String(answer).trim();
            return question.save()
                .then(function(saved) {
                    return Question.findById(saved._id).populate('authorId', 'name').populate('projectId', 'title');
                })
                .then(function(populated) {
                    return res.json(populated);
                });
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

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

router.get('/mine/unanswered', authMiddleware, getUnansweredForOwner);
router.patch('/:questionId/answer', authMiddleware, patchQuestionAnswer);
router.get('/:projectId', authMiddleware, getQuestions);
router.post('/:projectId', authMiddleware, postQuestion);

module.exports = router;
