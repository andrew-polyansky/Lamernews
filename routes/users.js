var express = require('express');
var router = express.Router();
var User = require('./../models/user.js').User;
var HttpError = require('./../error').HttpError;
var AuthError = require('./../models/user').AuthError;

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({}, function(err, users){
    if(err) return next(err);
    res.json(users);
  });
  // res.send('respond with a resource');
});

router.get('/:username', function(req, res, next) { // :username => req.params.username
  User.findOne({username: req.params.username}).exec()
    .then(function(user){
      if (!user) {
        return next(404);
      } else {
        res.json(user);
        res.status(200).end();
      }
    })
    .catch(function(err){
      console.log(err);
      next(err);

    });
});

router.post('/:username', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  User.authorize(username, password, email, next)
    .then(function(user) { //... 200 OK
      req.session.user = user._id;
      res.status(200).send({}); // может быть объект с инфо о пользователе
    })
    .catch(function(err){
      console.log(err);
      if (err instanceof AuthError) {
        return next(new HttpError(403, err.message));
      } else {
        next(err);
      }

    });

});



module.exports = router;
