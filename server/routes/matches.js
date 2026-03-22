const express = require('express');
const Match = require('../models/Match');
const Project = require('../models/Project');
const User = require('../models/User');
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
                .populate('projectId', 'title');
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

    Match.findById(matchId).populate('projectId')
        .then(function(match) {
            if (!match) {
                return res.status(404).json({ error: 'Match not found' });
            }

            const creatorId = match.projectId.creatorId.toString();

            if (creatorId !== userId) {
                return res.status(403).json({ error: 'Not authorized to accept this match' });
            }

            match.status = 'accepted';
            return match.save();
        })
        .then(function(updatedMatch) {
            return Match.findById(updatedMatch._id)
                .populate('applicantId', 'name email bio skills')
                .populate('projectId', 'title');
        })
        .then(function(populatedMatch) {
            return res.json(populatedMatch);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

router.get('/incoming', authMiddleware, getIncomingMatches);
router.post('/:id/accept', authMiddleware, acceptMatch);

module.exports = router;
