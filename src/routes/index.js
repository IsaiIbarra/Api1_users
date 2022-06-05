const { Router } = require('express');
const cors = require('cors');
const router = Router();

const mysqlConnection = require('../database');

router.use(cors());

//routes

//API get all users
router.get('/getUsers', (req, res) => {
  mysqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
    if (!err) {
      res.json({
        result: true,
        message: 'Successful Query!',
        users: rows,
      });
    } else {
      console.log(err);
    }
  });
});

//API get all roles
router.get('/getRoles', (req, res) => {
  mysqlConnection.query('SELECT * FROM roles', (err, rows, fields) => {
    if (!err) {
      res.json({
        result: true,
        message: 'Successful Query!',
        roles: rows,
      });
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
