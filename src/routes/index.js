const { Router } = require('express');
const cors = require('cors');
const router = Router();

const mysqlConnection = require('../database');

router.use(cors());

//routes

//API get all users
router.get('/getUsers', (req, res) => {
  mysqlConnection.query(
    'SELECT * FROM users INNER JOIN roles ON roles.id_rol = users.id_rol WHERE active_use = 1',
    (err, rows, fields) => {
      if (!err) {
        res.json({
          result: true,
          message: 'Successful Query!',
          users: rows,
        });
      } else {
        console.log(err);
      }
    }
  );
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

//API sign in
router.post('/signIn', (req, res) => {
  const { email_use, password_use } = req.body;

  //Valid if the password is correct
  //The tries increment in DB and in localstorage in the frontend, foru users registered and unregistered
  mysqlConnection.query(
    'SELECT * FROM users WHERE email_use = ? and password_use = ? and active_use = 1',
    [email_use, password_use],
    (err, rows, fields) => {
      if (!err) {
        //Valid if have results
        if (rows.length > 0) {
          if (rows[0].tries_use > 4) {
            res.json({
              result: false,
              message: 'You have exceeded the limit of tries!!',
            });
          } else {
            //Restart tries
            mysqlConnection.query(
              'UPDATE users set tries_use = 0 WHERE email_use = ?',
              [email_use],
              (err, rows, fields) => {
                if (!err) {
                  //For increment the tries for the user
                  mysqlConnection.query(
                    'SELECT * FROM users INNER JOIN roles ON roles.id_rol = users.id_rol WHERE email_use = ?',
                    [email_use],
                    (err, rows, fields) => {
                      if (!err) {
                        res.json({
                          result: true,
                          message: 'You have logged in!',
                          user: rows[0],
                        });
                      } else {
                        console.log(err);
                      }
                    }
                  );
                } else {
                  console.log(err);
                }
              }
            );
          }
        } else {
          //For increment the tries for the user
          mysqlConnection.query(
            'UPDATE users set tries_use = tries_use + 1 WHERE email_use = ?',
            [email_use],
            (err, rows, fields) => {
              if (!err) {
                //For increment the tries for the user
                mysqlConnection.query(
                  'SELECT * FROM users WHERE email_use = ?',
                  [email_use],
                  (err, rows, fields) => {
                    if (!err) {
                      if (rows.length > 0) {
                        if (rows[0].tries_use > 4) {
                          res.json({
                            result: false,
                            message: 'You have exceeded the limit of tries!!',
                          });
                        } else {
                          res.json({
                            result: false,
                            message: 'Wrong data',
                          });
                        }
                      } else {
                        res.json({
                          result: false,
                          message: 'Wrong data',
                        });
                      }
                    } else {
                      console.log(err);
                    }
                  }
                );
              } else {
                console.log(err);
              }
            }
          );
        }
      } else {
        console.log(err);
      }
    }
  );
});

//API for valid user session
router.post('/validUser', (req, res) => {
  const { id_use } = req.body;

  mysqlConnection.query(
    'SELECT * FROM users INNER JOIN roles ON roles.id_rol = users.id_rol WHERE id_use = ? and active_use = 1',
    [id_use],
    (err, rows, fields) => {
      if (!err) {
        if (rows.length > 0) {
          res.json({
            result: true,
            message: 'User is valid!',
            user: rows[0],
          });
        } else {
          res.json({
            result: false,
            message: 'User is invalid!',
          });
        }
      } else {
        console.log(err);
      }
    }
  );
});

//API for restart tries DB for exam
router.get('/restartTries', (req, res) => {
  mysqlConnection.query(
    'UPDATE users SET tries_use = 0',
    (err, rows, fields) => {
      if (!err) {
        res.json({
          result: true,
          message: 'Tries restarted!',
        });
      } else {
        console.log(err);
      }
    }
  );
});

//API for valid user session
router.post('/getUserEdit', (req, res) => {
  const { id_use } = req.body;

  mysqlConnection.query(
    'SELECT * FROM users INNER JOIN roles ON roles.id_rol = users.id_rol WHERE id_use = ?',
    [id_use],
    (err, rowsUs, fields) => {
      if (!err) {
        mysqlConnection.query('SELECT * FROM roles', (err, rowsRol, fields) => {
          if (!err) {
            res.json({
              result: true,
              message: 'Successful Query!',
              roles: rowsRol,
              user: rowsUs[0],
            });
          } else {
            console.log(err);
          }
        });
      } else {
        console.log(err);
      }
    }
  );
});

//API for edit user information
router.post('/editUser', (req, res) => {
  const {
    id_use_session,
    id_use,
    name_use,
    email_use,
    id_rol,
    password_use,
    confirm_password,
  } = req.body;

  mysqlConnection.query(
    'SELECT * FROM users INNER JOIN roles ON roles.id_rol = users.id_rol WHERE id_use = ? ',
    [id_use_session],
    (err, rows, fields) => {
      if (!err) {
        if (rows.length > 0) {
          // Valid to edit only your own user if your role is “user”, or all of them if your role is “admin”
          if (rows[0].name_rol == 'user' && id_use_session != id_use) {
            res.json({
              result: true,
              message: 'You are not an user valid for do this!',
              user: rowsUs[0],
            });
          } else {
            if (password_use != confirm_password) {
              res.json({
                result: false,
                message: "The passwords aren't the same!",
              });
            } else {
              //Valid if the user change password
              const query =
                password_use != ''
                  ? 'UPDATE users SET name_use = ?, email_use = ?, id_rol = ?, password_use = ? WHERE id_use = ?'
                  : 'UPDATE users SET name_use = ?, email_use = ?, id_rol = ? WHERE id_use = ?';

              const data =
                password_use != ''
                  ? [name_use, email_use, id_rol, password_use, id_use]
                  : [name_use, email_use, id_rol, id_use];

              mysqlConnection.query(query, data, (err, rowsUs, fields) => {
                if (!err) {
                  res.json({
                    result: true,
                    message: 'The user was updated!',
                    user: rowsUs[0],
                  });
                } else {
                  console.log(err);
                }
              });
            }
          }
        } else {
        }
      } else {
        console.log(err);
      }
    }
  );
});

//API for delete user
router.post('/deleteUser', (req, res) => {
  const { id_use_session, id_use } = req.body;

  mysqlConnection.query(
    'SELECT * FROM users INNER JOIN roles ON roles.id_rol = users.id_rol WHERE id_use = ? ',
    [id_use_session],
    (err, rows, fields) => {
      if (!err) {
        if (rows.length > 0) {
          //Valid to delete users if your role is “admin”, and you cannot delete your own user.
          if (rows[0].name_rol == 'user') {
            res.json({
              result: true,
              message: 'You are not an user valid for do this!',
              user: rowsUs[0],
            });
          } else if (rows[0].name_rol == 'admin' && id_use_session == id_use) {
            res.json({
              result: true,
              message: 'You are not an user valid for do this!',
              user: rowsUs[0],
            });
          } else {
            mysqlConnection.query(
              'UPDATE users SET active_use = 0 WHERE id_use = ?',
              [id_use],
              (err, rows, fields) => {
                if (!err) {
                  res.json({
                    result: true,
                    message: 'The user was delete!',
                  });
                } else {
                  console.log(err);
                }
              }
            );
          }
        } else {
        }
      } else {
        console.log(err);
      }
    }
  );
});

module.exports = router;
