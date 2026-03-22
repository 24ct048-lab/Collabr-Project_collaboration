const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        applicantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
