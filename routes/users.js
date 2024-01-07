var express = require('express');
const { isLoggedIn } = require('../helper/util.js')
var router = express.Router();
var moment = require('moment');
const path = require('path');
const { error } = require('console');
const { title } = require('process');


module.exports = function (db) {

  router.get('/', isLoggedIn, async (req, res) => {

    const { page = 1, title, startdate, enddate, complete, type_search, sort } = req.query;
    const limit = 5
    const offset = (page - 1) * limit
    let sql = 'SELECT * FROM todos WHERE userid = $1'
    const params = []
    const { rows: profil } = await db.query(`SELECT * FROM "users" WHERE id = $1`, [req.session.user.userid])
    params.push(req.session.user.userid)
    db.query(sql, params, (err, { rows: data }) => {
      if (err) res.send(err)
      else
        res.render('list', { data, moment, offset, profil: profil[0] })
    })
  })


  router.get('/add', isLoggedIn, (req, res) => {
    res.render('add', { data: {} })
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

  router.get('/edit/:id', isLoggedIn, (req, res) => {
    const id = req.params.id
    db.query('SELECT * FROM todos WHERE id = $1', [id], (err, { rows: data }) => {
      if (err) return res.send(err)
      res.render('edit', { data, moment })
    })
  })

  router.post('/edit/:id', isLoggedIn, (req, res) => {
    const id = req.params.id
    const { title, deadline, complete } = req.body

    if (!title || !deadline) {
      return res.status(400).send('Title and deadline are required');
    }

    // Validasi deadline jika diperlukan (gunakan format yang sesuai dengan kebutuhan aplikasi Anda)
    const isValidDeadline = moment(deadline, 'YYYY-MM-DD HH:mm', true).isValid();
    if (!isValidDeadline) {
      return res.status(400).send('Invalid deadline format');
    }
    
      db.query('UPDATE todos SET title = $1 , complete = $2 , deadline = $3 WHERE id = $4', [title, Boolean(complete), deadline, id], (err, data) => {
        if (err) return res.send(err)
        res.redirect('/users')
      })
    })
  router.get('/delete/:index', isLoggedIn, (req, res) => {
    const index = req.params.index;
    db.query(`DELETE FROM todos WHERE id = $1`, [index], (err) => {
      if (err) res.send(err)
      else res.redirect('/users')
    })
  })

  router.get('/upload', isLoggedIn, (req, res) => {
    res.render('upload')
  })


  // router.post('/upload', function (req, res) {
  //   let sampleFile;
  //   let uploadPath;

  //   if (!req.files || Object.keys(req.files).length === 0) {
  //     return res.status(400).send('No files were uploaded.');
  //   }

  //   sampleFile = req.files.avatar;
  //   uploadPath = path.join(__dirname, '..', 'public', 'images', sampleFile.name)
  //   // console.log(uploadPath)

  //   sampleFile.mv(uploadPath, function (err) {
  //     if (err)
  //       return res.status(500).send(err);

  //     res.send('File uploaded!');
  //   });
  // });

  return router
}
