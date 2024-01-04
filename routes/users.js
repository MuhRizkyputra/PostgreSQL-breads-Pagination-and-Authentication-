var express = require('express');
const { isLoggedIn } = require('../helper/util.js')
var router = express.Router();
var moment = require('moment');


module.exports = function (db) {

  router.get('/', (req, res) => {
    res.render('list')
  })

  router.get('/add', isLoggedIn, (req, res) => {
    res.render('add', {data: {}})
  })

  router.post('/add', isLoggedIn, (req, res) => {
    const title = req.body.title
    const userId = req.session.user.userid
    db.query('INSERT INTO todos(title, userid) VALUES ($1, $2)', [title, userId], (err) => {
      if (err) return res.send(err)
      res.redirect('/users')
    })
    console.log(title)
    console.log(userId)
  })

  router.get('/edit', isLoggedIn, (req, res) => {
    res.render('edit')
  })



  router.get('/upload', isLoggedIn, (req, res) => {
    res.render('upload')
  })

  return router
}
