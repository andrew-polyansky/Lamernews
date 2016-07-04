var express = require('express');
var router = express.Router();
var User = require('./../models/user.js').User;
var HttpError = require('./../error').HttpError;

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
        res.end("");
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

  User.findOne({username: username}).exec()
    .then(function(user){
      if (user) {
        if (user.checkPassword(password)) { //... 200 OK
          return user;
        } else { //... 403 Forbidden
          next(new HttpError(403, "Пароль неверен"));
        }
      } else {
         user = new User({username: username, password: password, email: email});
        return user.save()
          .then(function(user){
            return user;
          }).catch(function(err){
            console.log(err);
            next(err);
         });
      }
    })
    .then(function(user) {
      req.session.user = user._id;
      res.send({}); // может быть объект с инфо о пользователе
    })
    .catch(function(err){
      console.log(err);
      next(err);
    });

});

module.exports = router;


// , function(err, user){
//   if(err) return next(err);
//   if (!user) {
//     var error = new Error('Not Found');
//     error.status = 404;
//     next(error);
//   } else {
//     res.json(user);
//   }
//
// }
