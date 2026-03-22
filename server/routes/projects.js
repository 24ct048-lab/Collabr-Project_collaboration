const express = require('express');
const Project = require('../models/Project');
const Swipe = require('../models/Swipe');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getFeed(req, res) {
    const userId = req.user.userId;

    Swipe.find({ userId: userId }).select('projectId')
        .then(function(swipes) {
            const swipedProjectIds = swipes.map(function(swipe) {
                return swipe.projectId;
            });

            return Project.find({
                _id: { $nin: swipedProjectIds },
                creatorId: { $ne: userId },
                status: 'open'
            }).populate('creatorId', 'name bio skills');
        })
        .then(function(projects) {
            return res.json(projects);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function createProject(req, res) {
    const userId = req.user.userId;
    const title = req.body.title;
    const description = req.body.description;
    const techStack = req.body.techStack;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const newProject = new Project({
        creatorId: userId,
        title: title,
        description: description,
        techStack: techStack || []
    });

    newProject.save()
        .then(function(savedProject) {
            return res.status(201).json(savedProject);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function getMyProjects(req, res) {
    const userId = req.user.userId;

    Project.find({ creatorId: userId })
        .then(function(projects) {
            return res.json(projects);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function getProjectById(req, res) {
    const projectId = req.params.id;

    Project.findById(projectId).populate('creatorId', 'name bio skills')
        .then(function(project) {
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            return res.json(project);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

function updateProjectStatus(req, res) {
    const userId = req.user.userId;
    const projectId = req.params.id;
    const status = req.body.status;

    if (!status || (status !== 'open' && status !== 'closed')) {
        return res.status(400).json({ error: 'Status must be open or closed' });
    }

    Project.findOne({ _id: projectId, creatorId: userId })
        .then(function(project) {
            if (!project) {
                return res.status(404).json({ error: 'Project not found or not authorized' });
            }
            project.status = status;
            return project.save();
        })
        .then(function(updatedProject) {
            return res.json(updatedProject);
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

router.get('/feed', authMiddleware, getFeed);
router.post('/', authMiddleware, createProject);
router.get('/mine', authMiddleware, getMyProjects);
router.get('/:id', authMiddleware, getProjectById);
router.patch('/:id/status', authMiddleware, updateProjectStatus);

module.exports = router;
