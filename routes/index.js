var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
module.exports = function (db) {

  router.get('/', (req, res) => {
    res.render('users/index' , { errorMessage: req.flash('errorMessage'), successMessage: req.flash('successMessage') })
  });

  router.post('/', async (req, res) => {

     try {
      const { email, password } = req.body
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])

      if (rows.length == 0) {
        req.flash('errorMessage', `Email doesn't exist`)
        return res.redirect('/')
      };

      const storedPass = rows[0].password
      const passwordMatch = bcrypt.compareSync(password, storedPass)

      if (!passwordMatch) {
        req.flash('errorMessage', 'Password is wrong')
        return res.redirect('/')
      };

      req.session.user = { email: rows[0].email, userid: rows[0].id }
      res.redirect('/users')
    } catch (error) {
      console.log(error)
      return res.redirect('/')
    }
  })

  router.get('/register', (req, res) => {
    res.render('users/register', { errorMessage: req.flash('errorMessage'), successMessage: req.flash('successMessage') })
  })

  router.post('/register', async (req, res) => {
    const { email, password, repassword } = req.body
    try {
      if (password !== repassword) {
        req.flash('errorMessage', `password doesn't match`)
        res.redirect('/register')
        return
      }

      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      if (rows.length > 0) {
        req.flash('errorMessage', `Email already exist`)
        res.redirect('/register')
        return
      }      

      const hash = bcrypt.hashSync(password, saltRounds);
      const { rows: users } = await db.query('INSERT INTO users(email, password) VALUES ($1, $2) returning *', [email, hash])
      req.flash('successMessage', `Successfully registered, please sign in!`)
      res.redirect('/')
    } catch (error) {
      req.flash('errorMessage', `An error occured while processing data, please try again`)
      res.redirect('/register')
    }

  })


  router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
    })
  })
  return router
}