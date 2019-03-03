const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', (req, res) => {
    res.render('welcome', { req });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    if (req.user && req.user.role == "user") {
        // Dashboard Page
        res.render('dashboard', {
            name: req.user.name
        });
    } else if (req.user && req.user.role == "guest") {
        res.render('guestDashboard', {
            name: req.user.name
        });
    }
});

module.exports = router;