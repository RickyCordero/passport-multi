module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Must be a user or guest to view this resource');
        res.redirect('/');
    },
    ensureUserAuthenticated: function (req, res, next) {
        // TODO: Determine how to make this from guest authentication
        if (req.isAuthenticated() && req.user.role == "user") {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/users/login');
    },
    ensureGuestAuthenticated: function (req, res, next) {
        // TODO: Determine how to make this from guest authentication
        // req.cookies
        if (req.isAuthenticated() && req.user.role == "guest") {
            return next();
        } else {
            req.flash('error_msg', 'Please join a game to access this resource');
            res.redirect('/guest/join');
        }
    },
}