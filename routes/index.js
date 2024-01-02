var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const saltRounds = 10;

/* GET home page. */
module.exports = function (db) {

  router.get('/', (req, res) => {
    res.render('users/index')
  });

  router.post('/', async (req, res) => {

    try {
      const { email, password } = req.body
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      if (rows.length == 0) {
        new Error(`email doesn't exist`)
        res.redirect('/')
      };
      const passBag = rows[0].password
      const passwordMatch = bcrypt.compareSync(password, passBag)
      if (!passwordMatch) {
        new Error('password wrong')
        res.redirect('/')
      };
      req.session.user = passBag
      res.redirect('/users')
    } catch (error) {
      console.log(error)
    }
  })

  router.get('/register', function (req, res, next) {
    console.log(req.body)
    res.render('users/register');
  });

  router.post('/register', async (req, res) => {
    const { email, password, repassword } = req.body;

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
  router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
    })
  })
  return router
}