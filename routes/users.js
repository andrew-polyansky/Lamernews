var express = require('express');
var router = express.Router();
var User = require('./../models/user.js').User;

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
        var error = new Error('Not Found');
        error.status = 404;
        next(error);
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
