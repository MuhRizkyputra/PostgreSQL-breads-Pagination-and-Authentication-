var express = require('express');
var router = express.Router();
var moment = require('moment');


module.exports = function (db) {
router.get('/add', (req, res) => {
  res.render('add')
})

router.get('/edit', (req, res) => {
  res.render('edit')
})

router.get('/', (req, res) => {
  res.render('list')
}) 

router.get('/upload', (req, res) => {
  res.render('upload')
}) 

return router
}
