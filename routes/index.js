var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
