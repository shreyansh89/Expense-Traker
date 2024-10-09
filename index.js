const express = require('express');

const port = 8000;

const passport = require('passport')

const session = require('express-session');

const upload = require('./config/fileUpload');
const db = require('./config/mongoose');
const jwt = require('./config/passport-jwt-stratergy');

const app = express();
app.use(
    session({
        name: "jwt",
        secret: "jwt",
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 100,
        },
    })
)

app.use(passport.initialize());
app.use(passport.session())

app.use(express.urlencoded());


app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));

app.listen(port, (err) => {
    if (err) {
        console.log("server not running");
        return false;
    }
    console.log("server is running in "+port);
    
})