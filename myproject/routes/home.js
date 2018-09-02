var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', {pageTitle: 'Dash board'});
});

module.exports = router;
