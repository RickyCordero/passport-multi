const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Passport config
require('./config/passport')(passport);

// DB Config
const URI = require('./config/key').MongoURI;

mongoose.connect(URI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Expose the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Bodyparser
// allows us to get data from our form using request.body
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
// allows us to use request.flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use(cookieParser());

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/guest', require('./routes/guest'));

// Handle non-existant routes
app.use((req, res, next) => {
    res.status(404);
    res.render('error', { error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));