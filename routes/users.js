var express = require('express');
const { isLoggedIn } = require('../helper/util.js')
var router = express.Router();
var moment = require('moment');
const path = require('path');

module.exports = function (db) {

  router.get('/', isLoggedIn, async (req, res, next) => {

    const { page = 1, title, startdate, enddate, complete, operator } = req.query;
    const limit = 5
    const params = []
    const queris = []
    const paramscount = []
    const offset = (page - 1) * limit
    const { rows: profil } = await db.query(`SELECT * FROM "users" WHERE id = $1`, [req.session.user.userid])
    const sortBy = ['title', 'complete', 'deadline'].includes(req.query.sortBy) ? req.query.sortBy : 'id'
    const sortMode = req.query.sortMode === 'asc' ? 'asc' : 'desc';
    params.push(req.session.user.userid)
    paramscount.push(req.session.user.userid)

    if (title) {
      queris.push(`title ILIKE '%' || $${params.length + 1} || '%'`)
      params.push(title)
      paramscount.push(title)
    }

    if (startdate && enddate) {
      queris.push(`deadline BETWEEN $${params.length + 1} and $${params.length + 2}::TIMESTAMP + INTERVAL '1 DAY - 1 SECOND' `)
      params.push(startdate, enddate)
      paramscount.push(startdate, enddate)
    } else if (startdate) {
      queris.push(`deadline >= $${params.length + 1}`)
      params.push(startdate)
      paramscount.push(startdate)
    } else if (enddate) {
      queris.push(`deadline <= $${params.length + 1}::TIMESTAMP + INTERVAL '1 DAY - 1 SECOND'`)
      params.push(enddate)
      paramscount.push(enddate)
    }

    if (complete) {
       queris.push(` complete = $${params.length +1}`)
       params.push(complete)
       paramscount.push(complete)
    }

    let sql = 'SELECT * FROM todos WHERE userid = $1'
    let sqlcount = `SELECT COUNT (*) as total FROM todos WHERE userid = $1`

    if (queris.length > 0) {
      sql += ` AND (${queris.join(`${operator}`)})`
      sqlcount += ` AND (${queris.join(`${operator}`)})`
    }

    sql += ` ORDER BY ${sortBy} ${sortMode}`

    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)
  
    db.query(sqlcount, paramscount, (err, data) => {
      if (err) res.send(err)
      const url = req.url == '/' ? `/?page=${page}&sortBy=${sortBy}&sortMode=${sortMode}` : req.url
      const total = data.rows[0].total
      const pages = Math.ceil(total / limit)
      db.query(sql, params, (err, { rows: data }) => {
        if (err) res.send(err)
        else
          res.render('list', { data, query: req.query, pages ,page, url  , moment, offset, sortMode , sortBy, profil: profil[0] })
      })
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

    db.query('UPDATE todos SET title = $1 , complete = $2 , deadline = $3 WHERE id = $4', [title, Boolean(complete), deadline, id], (err, data) => {
      if (err) return res.send(err)
      res.redirect('/users')
    })
  })
  router.get('/delete/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;
    db.query(`DELETE FROM todos WHERE id = $1`, [id], (err) => {
      if (err) res.send(err)
      else res.redirect('/users')
    })
  })

  router.get('/upload', isLoggedIn, async (req, res) => {
    const { rows: profil } = await db.query(`SELECT * FROM users WHERE id = $1`, [req.session.user.userid])
    res.render('upload', { pp: profil[0].avatar })
  })

  router.post('/upload', isLoggedIn, function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const avatar = req.files.avatar;
    const fileName = `${Date.now()}-${avatar.name}`
    uploadPath = path.join(__dirname, '..', 'public', 'images', fileName);

    avatar.mv(uploadPath, async function (err) {
      if (err)
        return res.status(500).send(err);
      const { rows } = await db.query(`UPDATE users SET avatar = $1 WHERE id = $2`, [fileName, req.session.user.userid])
      res.redirect('/users')
    });
  });

  return router
}