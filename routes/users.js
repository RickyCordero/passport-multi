const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const _ = require('lodash');

const { ensureUserAuthenticated } = require('../config/auth');

// User model
const Game = require('../models/Game');
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Register page
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    // Check required fields
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    // Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors, name, email, password, password2
        });
    } else {
        // Validation passed
        // Make sure user does not exist
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        errors, name, email, password, password2
                    });
                } else {
                    const newUser = new User({
                        name, email, password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hash of password
                            newUser.password = hash;
                            // Save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        }))
                }
            })
    }
});

// // Dashboard Page
// router.get('/dashboard', ensureUserAuthenticated, (req, res) => {
//     res.render('dashboard', {
//         name: req.user.name
//     });
// });

// Create game
router.get('/createGame', ensureUserAuthenticated, (req, res) => {
    res.render('createGame');
});

/**
 * Determins if a game name is valid
 * @param {String} name - The name to be checked
 */
const isValidGameName = name => {
    return true;
}

// Create game handler
router.post('/createGame', ensureUserAuthenticated, (req, res, next) => {
    // passport.authenticate('user-login', {
    //     successRedirect: '/users/dashboard',
    //     failureRedirect: '/users/login',
    //     failureFlash: true
    // })(req, res, next);
    const hostName = req.user.name;
    const { name } = req.body;
    let errors = [];

    // Check required fields
    if (!name) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    // Check required fields
    if (!isValidGameName(name)) {
        errors.push({ msg: `Invalid game name '${name}'` });
    }

    if (errors.length > 0) {
        res.render('createGame', {
            errors, name
        });
    } else {
        // Validation passed
        // Make sure user does not exist
        const g = new Game({
            host: [req.user],
            name: name,
            pin: Math.floor(Math.random() * 90000) + 10000, // new pin for game
            guests: []
        });
        g.save()
            .then(game => {
                req.flash('success_msg', 'You have created the game successfully');
                res.redirect('/dashboard');
            })
            .catch(err => console.log(err));
    }
});

// Login handler
router.post('/login', (req, res, next) => {
    passport.authenticate('user-login', {
        // successRedirect: '/users/dashboard',
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout handle
router.get('/logout', ensureUserAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// Get all games for this user
router.get('/game', ensureUserAuthenticated, (req, res) => {
    Game.findOne({ host: req.user })
        .then(game => {
            if (game) {
                const obj = { ..._.pick(game, ['name', 'pin', 'guests']) };
                obj.guests = obj.guests.map(guest => _.pick(guest, 'name'));
                res.send(obj);
            }
        })
        .catch(err => console.log(err));
});

// Get all games for this user
router.get('/game/:pin', ensureUserAuthenticated, (req, res) => {
    // Find game where user is host (host must've already created)
    Game.findOne({ host: req.user, pin: req.params.pin })
        .then(game => {
            if (game) {
                res.render('gameView');
            } else {
                res.render('dashboard', {
                    name: req.user.name
                });
            }
        })
        .catch(err => console.log(err));
});

// Get all games for this user
router.get('/deleteGame/:pin', ensureUserAuthenticated, (req, res) => {
    // Find game where user is host (host must've already created)
    Game.deleteOne({ host: req.user, pin: req.params.pin })
        .then(stuff => {
            console.log(stuff);
            req.flash('success_msg', 'You have deleted the game successfully');
            res.redirect('/dashboard');
        })
        
});


module.exports = router;