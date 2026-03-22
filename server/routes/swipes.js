const express = require('express');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function recordSwipe(req, res) {
    const userId = req.user.userId;
    const projectId = req.body.projectId;
    const action = req.body.action;

    if (!projectId || !action) {
        return res.status(400).json({ error: 'projectId and action are required' });
    }

    if (action !== 'interested' && action !== 'pass') {
        return res.status(400).json({ error: 'action must be interested or pass' });
    }

    Project.findById(projectId)
        .then(function(project) {
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const newSwipe = new Swipe({
                userId: userId,
                projectId: projectId,
                action: action
            });

            return newSwipe.save()
                .then(function(savedSwipe) {
                    if (action !== 'interested') {
                        return res.status(201).json({ swipe: savedSwipe });
                    }

                    const newMatch = new Match({
                        projectId: projectId,
                        applicantId: userId,
                        status: 'pending'
                    });

                    return newMatch.save()
                        .then(function(savedMatch) {
                            return res.status(201).json({
                                swipe: savedSwipe,
                                match: savedMatch
                            });
                        });
                });
        })
        .catch(function(error) {
            if (error.code === 11000) {
                return res.status(409).json({ error: 'Already swiped on this project' });
            }
            return res.status(500).json({ error: error.message });
        });
}

router.post('/', authMiddleware, recordSwipe);

module.exports = router;
