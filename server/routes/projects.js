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
    const imageUrl = req.body.imageUrl;
    const groupLink = req.body.groupLink;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const newProject = new Project({
        creatorId: userId,
        title: title,
        description: description,
        techStack: techStack || [],
        imageUrl: imageUrl || '',
        groupLink: typeof groupLink === 'string' ? groupLink.trim() : ''
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

function updateProjectDetails(req, res) {
    const userId = req.user.userId;
    const projectId = req.params.id;
    const body = req.body;

    Project.findOne({ _id: projectId, creatorId: userId })
        .then(function(project) {
            if (!project) {
                res.status(404).json({ error: 'Project not found or not authorized' });
                return null;
            }

            if (body.title !== undefined) {
                project.title = String(body.title).trim();
            }
            if (body.description !== undefined) {
                project.description = String(body.description).trim();
            }
            if (body.techStack !== undefined) {
                if (Array.isArray(body.techStack)) {
                    project.techStack = body.techStack.map(function(t) { return String(t).trim(); }).filter(function(t) { return t.length > 0; });
                } else if (typeof body.techStack === 'string') {
                    project.techStack = body.techStack.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t.length > 0; });
                }
            }
            if (body.imageUrl !== undefined) {
                project.imageUrl = String(body.imageUrl).trim();
            }
            if (body.groupLink !== undefined) {
                project.groupLink = String(body.groupLink).trim();
            }

            if (!project.title || !project.description) {
                res.status(400).json({ error: 'Title and description cannot be empty' });
                return null;
            }

            return project.save();
        })
        .then(function(updated) {
            if (!updated) {
                return;
            }
            return res.json(updated);
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
router.patch('/:id/status', authMiddleware, updateProjectStatus);
router.patch('/:id', authMiddleware, updateProjectDetails);
router.get('/:id', authMiddleware, getProjectById);

module.exports = router;
