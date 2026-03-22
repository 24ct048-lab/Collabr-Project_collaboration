const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        techStack: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open'
        }
    },
    { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
