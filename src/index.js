const express = require('express');
const res = require('express/lib/response');
const app = express();
const morgan = require('morgan');

//settings
app.set('port', process.env.PORT || 5000);

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
app.use(require('./routes/index'));

//starting the server
app.listen(5000, () => {
  console.log('Server on PORT 5000');
});
