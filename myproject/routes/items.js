var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/list', function(req, res, next) {
  res.render('./layouts/items/list');
});

module.exports = router;
