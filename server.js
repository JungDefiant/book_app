'use strict';

const express = require('express');
const dotenv = require('dotenv');
const superagent = require('superagent');

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/hello', (req, res) => {
  res.render('pages/index');
});

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.post('/searches/new', (req, res) => {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  const { query, type } = req.body.search;
  let queryParam = '';

  if (type === 'author') queryParam += 'inauthor';
  else if (type === 'title') queryParam += 'intitle';

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
      res.render('pages/error', { 'error': error });
    });
});

function Book(bookInfo) {
  this.title = bookInfo.title ? bookInfo.title : 'Book Title';
  this.authors = bookInfo.authors ? bookInfo.authors : 'No author';
  this.description = bookInfo.description ? bookInfo.description : 'No description';

  // if (bookInfo.imageLinks) {
  //   console.log(bookInfo.imageLinks);
  //   if (bookInfo.imageLinks.smallThumbnail) {
  //     if (bookInfo.imageLinks.smallThumbnail[4] === ':') {
  //       bookInfo.imageLinks.smallThumbnail = bookInfo.imageLinks.smallThumbnail.split(':').join('s:');
  //     }
  //   }
  //   this.img_url = bookInfo.imageLinks.smallThumbnail ? bookInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  // }

  if (bookInfo.imageLinks.smallThumbnail) {
    if (bookInfo.imageLinks.smallThumbnail[4] === ':') {
      bookInfo.imageLinks.smallThumbnail = bookInfo.imageLinks.smallThumbnail.split(':').join('s:');
    }
  }

  this.img_url = bookInfo.imageLinks.smallThumbnail ? bookInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
