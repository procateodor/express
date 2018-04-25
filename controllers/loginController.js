var bodyParser = require('body-parser');
var validate = require("validate.js");

var nodemailer = require('nodemailer');
var myEmail = 'teoboy11@gmail.com';
var myPass = 'qvoxizstzbktvizr';

var crypto = require("crypto");

var setCookie = require('set-cookie-parser');
var cookieParser = require('cookie-parser');

var async = require('async');

// Validators
var constraints = {
    input: {
        format: {
        pattern: "[a-z0-9]+",
        flags: "i",
        message: "can only contain a-z and 0-9",
        },
        length: {
            is: 15,
            message: "matricol incorrect"
        }
    },
    username: {
        format: {
        pattern: "[a-z0-9]+",
        flags: "i",
        message: "can only contain a-z and 0-9",
        }
    },
    email: {
        format: {
        pattern: "[a-z0-9@.]+",
        flags: "i",
        message: "can only contain a-z and 0-9",
        },
        length: {
            minimum: 6,
            message: "to short"
        }
    },
    password: {
        format: {
        pattern: "[a-z0-9]+",
        flags: "i",
        message: "can only contain a-z and 0-9",
        },
        length: {
            minimum: 6,
            message: "to short"
        }
    }
};

// Connect to database
var mongoose = require('mongoose');
// mongoose.connect('mongodb://teo:1234@ds255329.mlab.com:55329/ip');
mongoose.connect('mongodb+srv://teo:1234@teo-ue75n.mongodb.net/test');

// Create a schema - like blueprint
var conturiSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
var conturiConectateSchema = new mongoose.Schema({
    token: String,
    username: String
});
var registerSchema = new mongoose.Schema({
    tokenId: String,
    email: String
});
var studentiSchema = new mongoose.Schema({
    nr_matricol: String,
    email: String
});

var Conturi = mongoose.model('Conturi', conturiSchema);
var ConturiConectate = mongoose.model('Conturi_conectate', conturiConectateSchema);
var Register = mongoose.model('Register', registerSchema);
var Studenti = mongoose.model('Studenti', studentiSchema);

var urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function (app) {
    
    app.get('/', function (req, res) {
        var cookie = req.cookies.userToken;

        if (cookie) {
            res.render('logged');
        } else {
            res.render('index');
        }
        // res.clearCookie('cookie_name');
    });

    app.post('/verifCreditans', urlencodedParser, function (req, res) {
        var data = req.body.matricol;
    
        var userEmail = "";

        if (validate({input: data}, constraints)) {
            var set = validate({input: data}, constraints); 
            response.end("error");
        } else {
            var find = {
                nr_matricol: req.body.matricol
            }

            Studenti.find(find, function (err, data) {
                if (err) {
                    throw err;
                }

                if (!data.length > 0) {
                    res.end('not exists');
                } else {
                    userEmail = data[0].email;

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: myEmail,
                            pass: myPass
                        }
                    }).on('error', err => console.log(err));

                    var tokenId = crypto.randomBytes(10).toString('hex');

                    var mailOptions = {
                        from: myEmail,
                        to: userEmail,
                        subject: 'Email from app!',
                        html: '<a href="http://127.0.0.1:3000/register/register.html?userId=' + tokenId + '">Continue registration!</a>'
                    };

                    var register = {
                        email: userEmail
                    }

                    Register.find(register).remove(function (err, data) {
                        if (err) {
                            throw err;
                        }
                    });

                    var registerData = {
                        tokenId: tokenId,
                        email: userEmail
                    }

                    var newRegister = Register(registerData).save(function (err, data) {
                        if (err) {
                            throw err;
                        }
                    });

                    // transporter.sendMail(mailOptions, function(err, data){
                    //     if (err) {
                    //         console.log(error);
                    //     } else {
                    //         console.log('Email sent: ' + data.response);
                    //     }
                    // });
    
                    res.end('success');
                }
            });
        }
    });

    app.get('/register/register.html', function (req, res) {
        res.render('register');
    });

    app.post('/token', urlencodedParser, function (req, res) {
        var token = req.body.value;

        Register.find({tokenId: token}, function (err, data) {
            var userEmail = data[0].email;
            res.end(userEmail);
        });
    });

    app.post('/accept', urlencodedParser, function (req, res) {
        var ok = true;

        var counter = 0;

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;

        var user = {
            email: email,
            username: username,
            password: password
        }

        if (validate({username: username}, constraints)) {
            ok = false;

            res.end('error');
        }

        var send = function () {
            if (ok) {
                var tokenId = crypto.randomBytes(10).toString('hex');
                
                var cont = {
                    username: username,
                    email: email,
                    password: password
                }

                var contConectat = {
                    token: tokenId,
                    username: username
                }

                var contNew = Conturi(cont).save(function (err, data) {
                    if (err) {
                        throw err;
                    }
                });

                res.end();
            }
        }

        Conturi.find({email: email}, function (err, data) {
            if (err) {
                throw err;
            }

            counter++;

            if (data.length > 0) {
                ok = false;

                counter--;

                res.end('email');
            }

            if (counter === 2) {
                send();
            }
        });

        Conturi.find({username: username}, function (err, data) {
            if (err) {
                throw err;
            }

            counter++;

            if (data.length > 0) {
                ok = false;

                counter--;

                res.end('user');
            }

            if (counter === 2) {
                send();
            }
        });

        
    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.post('/validateLogin', urlencodedParser, function (req, res) {
        var userInfo = {
            email: req.body.email,
            password: req.body.password
        }

        var username;

        var ok = true;

        if (validate({email: userInfo.email}, constraints)) {
            ok = false;

            res.end('error');
        }

        if (validate({password: userInfo.password}, constraints)) {
            ok = false;

            res.end('error');
        }

        Conturi.find(userInfo, function (err, data) {
            if (err) {
                throw err;
            }

            if (!data.length > 0) {
                ok = false;
                res.end('email');
            } else {
                username = data.username;

                if (ok) {
                    var tokenId = crypto.randomBytes(10).toString('hex');
    
                    var data = {
                        token: tokenId,
                        username: username
                    }
                    
                    var newCont = ConturiConectate(data).save(function (err, data) {
                        if (err) {
                            throw err;
                        }
                    });
    
                    res.cookie('userToken', tokenId);
                    res.end();
                }
            }
        });
    });
}