var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});


router.get('/add', (req, res) => {
  res.render('add')
})

router.get('/edit', (req, res) => {
  res.render('edit')
})

router.get('/list', (req, res) => {
  res.render('list')
}) 
module.exports = router;
