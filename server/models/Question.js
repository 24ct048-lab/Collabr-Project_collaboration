const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        answer: {
            type: String,
            default: '',
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
