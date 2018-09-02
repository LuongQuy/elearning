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

user.create({
    username: 'quyluong',
    password: 'quyluong',
    email: 'abc@gmail.com',
    displayname: 'luongquy',
    image: 'upload/1.png',
    level: 1
}).then(user => console.log(user.get({plain: true})));