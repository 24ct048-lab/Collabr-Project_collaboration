const express = require('express');
const Match = require('../models/Match');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getIncomingMatches(req, res) {
    const userId = req.user.userId;

    Project.find({ creatorId: userId }).select('_id')
        .then(function(myProjects) {
            const myProjectIds = myProjects.map(function(p) {
                return p._id;
            });

            return Match.find({ projectId: { $in: myProjectIds } })
                .populate('applicantId', 'name email bio skills')
                .populate('projectId', 'title groupLink');
        })
        .then(function(matches) {
            return res.json(matches);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function getMyApplications(req, res) {
    const userId = req.user.userId;

    Match.find({ applicantId: userId })
        .sort({ updatedAt: -1 })
        .populate({
            path: 'projectId',
            select: 'title groupLink status creatorId',
            populate: { path: 'creatorId', select: 'name email' }
        })
        .then(function(matches) {
            return res.json(matches);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function acceptMatch(req, res) {
    const userId = req.user.userId;
    const matchId = req.params.id;
    const messageFromOwner = typeof req.body.messageFromOwner === 'string'
        ? req.body.messageFromOwner.trim()
        : '';

    Match.findById(matchId).populate('projectId')
        .then(function(match) {
            if (!match) {
                res.status(404).json({ error: 'Match not found' });
                return null;
            }

            const creatorId = match.projectId.creatorId.toString();

            if (creatorId !== String(userId)) {
                res.status(403).json({ error: 'Not authorized to accept this match' });
                return null;
            }

            match.status = 'accepted';
            match.messageFromOwner = messageFromOwner;
            return match.save();
        })
        .then(function(updatedMatch) {
            if (!updatedMatch) {
                return;
            }
            return Match.findById(updatedMatch._id)
                .populate('applicantId', 'name email bio skills')
                .populate('projectId', 'title groupLink');
        })
        .then(function(populatedMatch) {
            if (populatedMatch) {
                return res.json(populatedMatch);
            }
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

router.get('/incoming', authMiddleware, getIncomingMatches);
router.get('/my-applications', authMiddleware, getMyApplications);
router.post('/:id/accept', authMiddleware, acceptMatch);

module.exports = router;
