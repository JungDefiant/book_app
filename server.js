'use strict';

const express = require('express');
const dotenv = require('dotenv');
const superagent = require('superagent');
const pg = require('pg');
dotenv.config();

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/', displaySavedBooks);

app.get('/books/:id', displaySingleBook);

app.get('/searches/new', displaySearchPage);

app.post('/searches/new', makeAndDisplaySearch);

function Book(bookInfo) {
  this.title = bookInfo.title ? bookInfo.title : 'Book Title';
  this.authors = bookInfo.authors ? bookInfo.authors : 'No author';
  this.description = bookInfo.description ? bookInfo.description : 'No description';

  if (bookInfo.imageLinks.smallThumbnail) {
    if (bookInfo.imageLinks.smallThumbnail[4] === ':') {
      bookInfo.imageLinks.smallThumbnail = bookInfo.imageLinks.smallThumbnail.split(':').join('s:');
    }
  }

  this.img_url = bookInfo.imageLinks.smallThumbnail ? bookInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}

function displaySavedBooks(req, res) {
  client.query('SELECT * FROM books')
    .then(result => {
      if(result.rows.length > 0) res.render('pages/index', { numBooks: result.rows.length, savedBooks: result.rows });
      else res.redirect('/searches/new');
    })
    .catch(console.log);
}

function displaySingleBook(req, res) {
  console.log(req.params.id);
  client.query(`SELECT * FROM books WHERE id = ${req.params.id}`)
    .then(result => {
      console.log(result.rows[0]);
      res.render('pages/books/show', { bookToDisplay: result.rows[0] });
    })
    .catch(console.log);
}

function saveBook(bookInfo) {
  // const sqlQuery = `INSERT INTO books (title, authors, description, img_url, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)`;
  // client.query(sqlQuery, bookInfo)
  //   .then(result => {

  //   })
}

function displaySearchPage(req, res) {
  res.render('pages/searches/new', { 'arrayBookItems': [] });
}

function makeAndDisplaySearch(req, res) {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  const { query, type } = req.body.search;
  let queryParam = 'in' + type;

  superagent.get(url)
    .query({
      q: queryParam + ':' + query
    })
    .then(result => {
      let bookList = result.body.items.map((val, ind) => {
        if (ind < 10) return new Book(result.body.items[ind].volumeInfo);
      });
      res.render('pages/searches/new', { 'arrayBookItems': bookList });
    })
    .catch(error => {
      displayErrorPage(res, error);
    });
}

function displayErrorPage(res, error) {
  res.render('pages/error', { 'error': error });
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
