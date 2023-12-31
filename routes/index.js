var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
module.exports = function (db) {
  router.get('/', function (req, res, next) {
    res.render('users/index');
  });

  router.get('/register', function (req, res, next) {
    console.log(req.body)
    res.render('users/register');
  });

  router.post('/register', async (req, res) => {
    const { email, password, repassword } = req.body;
    console.log(req.body, 'INIIII')
    try {
      if (password !== repassword) throw new Error(`Password doesn't match`)
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      console.log(rows)
      if (rows.length > 0) throw new Error(`email already exist`)
      const hash = bcrypt.hashSync(password, saltRounds);
      const { rows: users } = await db.query('INSERT INTO users(email, password) VALUES ($1, $2) returning *', [email, hash])
      res.redirect('/')
    } catch (error) {
      res.send(error.massage)
    }

  })
  return router
}