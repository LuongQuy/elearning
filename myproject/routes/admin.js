var express = require('express');
var router = express.Router();

router.get('/list', function(req, res, next) {
  res.render('list', {pageTitle: 'Danh sách lớp học'});
});

router.get('/add-new-user', function(req, res, next) {
  res.render('add-new-user', {pageTitle: 'Thêm mới user'});
});


module.exports = router;
