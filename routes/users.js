var express = require('express');
const { isLoggedIn } = require('../helper/util.js')
var router = express.Router();
var moment = require('moment');


module.exports = function (db) {

  router.get('/', (req, res) => {
    res.render('list')
  })


  router.get('/add', isLoggedIn, (req, res) => {
    res.render('add')
  })

  router.get('/edit', isLoggedIn, (req, res) => {
    res.render('edit')
  })



  router.get('/upload', isLoggedIn, (req, res) => {
    res.render('upload')
  })

  return router
}
