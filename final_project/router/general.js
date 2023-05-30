const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const p_username = req.body.username;
  const p_password = req.body.password;
  // check if user is in user list based on username
  const isExistingUser = users.find((user) => user.username === p_username);
  if (!isExistingUser) {
    //user not in list
    users.push({ username: p_username, password: p_password }); //add new user
    res
      .status(200)
      .json({ message: "User successfully registered. You can now login!" });
  } else {
    return res.status(404).json({ message: "User already exists!" });
  }
});

// Get the book list available in the shop

const getBooksAsync = () =>
  new Promise((resolve, reject) => {
    resolve(books);
  });

public_users.get("/", function (req, res) {
  getBooksAsync().then((data) => res.send(JSON.stringify(data, null, 4)));
  // return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
const getIsbnAsync = (isbn) =>
  new Promise((resolve, reject) => {
    let book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found with ISBN " + isbn);
    }
  });

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getIsbnAsync(isbn)
    .then((book) => res.send(book))
    .catch((err) => res.send(err));
  // let book = books[isbn];
  // if (book) {
  //   return res.send(book);
  // } else {
  //   return res.status(300).json("Book with " + isbn + " isbn not found");
  // }
});

// Get book details based on author

const getAuthorAsync = (author) =>
  new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let book = [];
    keys.forEach((key) => {
      if (books[key]["author"] === author) {
        book.push(books[key]);
      }
    });
    if (book.length > 0) {
      resolve(book);
    } else {
      reject("Book not found with author " + author);
    }
  });

public_users.get("/author/:author", function (req, res) {
  const p_author = req.params.author;
  getAuthorAsync(p_author)
    .then((data) => res.send(data))
    .catch((err) => res.send(err));
});

// Get all books based on title
const getTitleAsync = (title) =>
  new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let book = [];
    keys.forEach((key) => {
      if (books[key]["title"] === title) {
        book.push(books[key]);
      }
    });
    if (book.length > 0) {
      resolve(book);
    } else {
      reject("No books found with title: " + title);
    }
  });

public_users.get("/title/:title", function (req, res) {
  const p_title = req.params.title;
  getTitleAsync(p_title)
    .then((data) => res.send(data))
    .catch((err) => res.send(err));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const keys = Object.keys(books);
  const p_isbn = req.params.isbn;

  const book = books[p_isbn];
  if (book) {
    res.send(book.reviews);
  } else {
    res.send("Did not find book for isbn " + p_isbn);
  }
});

module.exports.general = public_users;
