var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

var app = express();
var session = require("express-session");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(session({ secret: "quy" }));
app.use(passport.initialize());
app.use(passport.session());

// setup database
const sequelize = require('sequelize');

const db = new sequelize({
  database: 'eclass',
  username: 'postgres',
  password: '1',
  host: 'localhost',
  port: 5433,
  dialect: 'postgres',
  dialectOptions: {
    ssl: false
  },
  define: {
    freezeTableName: true
  }
});
db.authenticate()
  .then(() => console.log('ket noi thanh cong!'))
  .catch(err => console.log(err.message));

const user = db.define('users', {
  username: sequelize.STRING,
  password: sequelize.STRING,
  email: sequelize.STRING,
  displayname: sequelize.STRING,
  image: sequelize.STRING,
  level: sequelize.SMALLINT
});

db.sync();

// user.findAll()
//   .then(users => console.log(user));

// end setup database

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(session({
//   secret: "secret",
//   saveUninitialized: true,
//   resave: true
// }))



// passport.deserializeUser(function (id, done) {
//   db.user.findById(id).then(function (user) {
//     done(null, user);
//   }).catch(function (err) {
//     console.log(err);
//   })
// });

// connect database
var pg = require('pg');
var config = {
  user: 'postgres',
  database: 'elearning',
  password: '1',
  host: 'localhost',
  port: 5433,
  max: 10,
  idleTimeoutMillis: 30000
}

var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    file.originalname = Date.now() + '-' + file.originalname;
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage }).single('uploadfile');

var pool = new pg.Pool(config);

// login
app.route('/login')
.get(function (req, res) {res.render('login', { pageTitle: 'Login' })})
.post(passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/list'}));


passport.use(new LocalStrategy(
  function (username, password, done) {
    user.findOne({ where:{ username: username } }).then(function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (name, done) {
  user.findOne({where: {username: name}}).then(function (err, user) {
    console.log(user);
    // done(null, user);
  });
});


// end login

function queryDatabase(sql) {
  pool.connect((err, client, done) => {
    if (err) console.log(err);
    client.query(sql, (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.end();
      }
    });
  });
}



app.get('/list', (req, res) => {
  pool.connect((err, client, done) => {
    if (err) console.log(err);
    client.query('select * from users', (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.end();
      }
      res.render('list', { pageTitle: 'Danh sách sinh viên', data: result });
    });
  });
});

app.get('/delete/:id', (req, res) => {
  pool.connect((err, client, done) => {
    if (err) console.log(err);
    client.query('delete from users where id =' + req.params.id, (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.end();
      }
      res.redirect('/list');
    });
  });
});

app.get('/add-new-user', (req, res) => {
  res.render('add-new-user', { pageTitle: 'Thêm người dùng mới' });
});

app.post('/add-new-user', urlencodedParser, (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
    } else {
      var displayName = req.body.displayname;
      var username = req.body.username;
      var password = req.body.password;
      var email = req.body.email;
      var level = req.body.level;
      var image = req.file.originalname;
      var sql = "insert into users(displayname, username, email, password, image, level) values('" + displayName + "', '" + username + "', '" + email + "', '" + password + "', '" + image + "', '" + level + "')";
      queryDatabase(sql);
      res.redirect('/add-new-user');
    }
  });
});

app.get('/edit-user/:id', (req, res) => {
  var sql = 'select * from users where id = ' + req.params.id;
  pool.connect((err, client, done) => {
    if (err) console.log(err);
    client.query(sql, (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.end();
      }
      res.render('edit-user', { pageTitle: 'Chỉnh sửa người dùng', data: result.rows[0] });
    });
  });
});

app.post('/edit-user/:id', urlencodedParser, (req, res) => {
  upload(req, res, function (err) {
    const displayName = req.body.displayname;
    const password = req.body.password;
    const email = req.body.email;
    const level = req.body.level;
    const id = req.params.id;
    if (typeof (req.file) != 'undefined') {
      var image = req.file.originalname;
      if (err) {
        console.log(err);
      } else {
        var sql = "UPDATE users set displayname='" + displayName + "', email='" + email + "', password='" + password + "', level='" + level + "', image='" + image + "' where id=" + id;
        pool.connect((err, client, done) => {
          if (err) console.log(err);
          client.query(sql, (err, result) => {
            done();
            if (err) {
              console.log(err);
              res.end();
            }
            res.redirect('/list');
          });
        });
        console.log(sql);
      }
    } else {
      var sql = "UPDATE users set displayname='" + displayName + "', email='" + email + "', password='" + password + "', level='" + level + "' where id =" + id;
      pool.connect((err, client, done) => {
        if (err) console.log(err);
        client.query(sql, (err, result) => {
          done();
          if (err) {
            console.log(err);
            res.end();
          }
          res.redirect('/list');
        });
      });
      console.log(sql);
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
