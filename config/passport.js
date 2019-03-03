const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load Models
const Guest = require('../models/Guest');
const User = require('../models/User');

function SessionConstructor(userId, userGroup, details) {
    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details;
}

module.exports = function (passport) {
    passport.use('user-login',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match User
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );
    passport.use('guest-login',
        new LocalStrategy({ usernameField: 'name', passwordField: 'pin' }, (name, pin, done) => {
            // Match User
            Guest.findOne({ name: name, pin: pin })
                .then(guest => {
                    if (guest) {
                        return done(null, guest);
                    } else {
                        return done(null, false, { message: `Guest with name '${name}' not found or game with pin '${pin}' not found` });
                    }
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser((userObject, done) => {
        // userObject could be a Model1, or a Model2, or a Model3, ... 
        let userGroup = "model1";
        let userPrototype = Object.getPrototypeOf(userObject);

        if (userPrototype === User.prototype) {
            userGroup = "model1";
        } else if (userPrototype === Guest.prototype) {
            userGroup = "model2";
        }

        let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
        done(null, sessionConstructor);
    });

    passport.deserializeUser((sessionConstructor, done) => {
        if (sessionConstructor.userGroup == 'model1') {
            User.findOne({
                _id: sessionConstructor.userId
            }, '-localStrategy.password', (err, user) => { // When using string syntax, prefixing a path with - will flag that path as excluded.
                done(err, user);
            });
        } else if (sessionConstructor.userGroup == 'model2') {
            Guest.findOne({
                _id: sessionConstructor.userId
            }, '-localStrategy.pin', (err, guest) => { // When using string syntax, prefixing a path with - will flag that path as excluded.
                done(err, guest);
            });
        }
    });

}
