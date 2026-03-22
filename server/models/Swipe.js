const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        action: {
            type: String,
            enum: ['interested', 'pass'],
            required: true
        }
    },
    { timestamps: true }
);

swipeSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const Swipe = mongoose.model('Swipe', swipeSchema);

module.exports = Swipe;
