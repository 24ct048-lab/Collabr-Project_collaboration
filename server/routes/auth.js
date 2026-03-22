const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function register(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }

    bcrypt.hash(password, 10)
        .then(function(passwordHash) {
            const newUser = new User({
                name: name,
                email: email,
                passwordHash: passwordHash
            });

            return newUser.save();
        })
        .then(function(savedUser) {
            const token = jwt.sign(
                { userId: savedUser._id, email: savedUser.email, name: savedUser.name },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                token: token,
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email
                }
            });
        })
        .catch(function(error) {
            if (error.code === 11000) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(500).json({ error: error.message });
        });
}

function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    User.findOne({ email: email })
        .then(function(user) {
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            return bcrypt.compare(password, user.passwordHash)
                .then(function(isMatch) {
                    if (!isMatch) {
                        return res.status(401).json({ error: 'Invalid credentials' });
                    }

                    const token = jwt.sign(
                        { userId: user._id, email: user.email, name: user.name },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    return res.json({
                        token: token,
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email
                        }
                    });
                });
        })
        .catch(function(error) {
            return res.status(500).json({ error: error.message });
        });
}

router.post('/register', register);
router.post('/login', login);

module.exports = router;
