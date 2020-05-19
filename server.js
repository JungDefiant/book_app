'use strict';

const express = require('express');
// const superagent = require('superagent');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/hello', (req, res) => {
  res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
