const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const { ensureGuestAuthenticated } = require('../config/auth');

// User model
const Guest = require('../models/Guest');
const Game = require('../models/Game');

// Join page
router.get('/join', (req, res) => {
    res.render('join');
});

// Register page
router.get('/register', (req, res) => {
    res.render('registerGuest');
});

// // Dashboard Page
// router.get('/dashboard', ensureGuestAuthenticated, (req, res) => {
//     // console.log(req);
//     res.render('guestDashboard', {
//         name: ""
//     });
// });

// // Login handle
// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/dashboard',
//         failureRedirect: '/users/login',
//         failureFlash: true
//     })(req, res, next);
// });

// Login handle
router.post('/join', (req, res, next) => {
    passport.authenticate('guest-login', {
        successRedirect: '/dashboard',
        failureRedirect: '/guest/join',
        failureFlash: true
    })(req, res, next);
});

// Leave party handler
router.get('/leave', ensureGuestAuthenticated, (req, res) => {
    // Game.findOne({ pin: req.user.pin })
    //     .then(game => {
    //         if (game) {
    //             game.guests = game.guests.filter(g => g.name != req.user.name);
    //             game.save()
    //                 .then(stuff => {
    //                     req.logout();
    //                     req.flash('success_msg', 'You have left the game');
    //                     res.redirect('/guest/join');
    //                 })
    //                 .catch(err => console.log(err));
    //             } else {
    //                 req.flash('error_msg', 'No such game');
    //                 res.redirect('/dashboard');
    //             }
    //         })
    //         .catch(err => console.log(err));
    req.logout();
    req.flash('success_msg', 'You have left the game');
    res.redirect('/guest/join');
});

/**
 * Determines if a pin is valid
 * @param {String} pin - The pin to be checked
 */
const isValidPin = (pin) => {
    return true;
};
/**
 * Determines if a name is valid
 * @param {String} name - The name to be checked
 */
const isValidName = (name) => {
    return true;
};

router.post('/register', (req, res) => {
    const { name, pin } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !pin) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    // Check required fields
    if (!isValidName(name)) {
        errors.push({ msg: 'Invalid name' });
    }
    // Check required fields
    if (!isValidPin(pin)) {
        errors.push({ msg: 'Invalid pin' });
    }

    if (errors.length > 0) {
        res.render('registerGuest', {
            errors, name, pin
        });
    } else {
        // Initial validation passed
        // Make sure user does not exist
        Game.findOne({ pin: pin })
            .then(game => {
                if (game) {
                    const match = game.guests.find(guest => guest.name == name);
                    if (match) {
                        // Other user exists with name
                        errors.push({ msg: `Name '${name}' already taken in game with pin '${pin}'` });
                        res.render('registerGuest', {
                            errors, name, pin
                        });
                    } else {
                        const newGuest = new Guest({
                            name, pin
                        });
                        // Save guest
                        newGuest.save()
                            .then(guest => {
                                game.guests.push(newGuest);
                                game.save()
                                    .then(g => {
                                        req.flash('success_msg', 'You have signed up for the game successfully');
                                        res.redirect('/guest/join');
                                    })
                                    .catch(err => console.log(err));
                            })
                            .catch(err => console.log(err));
                    }
                } else {
                    errors.push({ msg: `Game with pin '${pin}' not found` });
                    res.render('registerGuest', {
                        errors, name, pin
                    });
                }
            })
            .catch(err => console.log(err));
    }
});

module.exports = router;