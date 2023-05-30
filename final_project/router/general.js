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
public_users.get("/", function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    return res.send(book);
  } else {
    return res.status(300).json("Book with " + isbn + " isbn not found");
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const keys = Object.keys(books);
  const p_author = req.params.author;
  let book = [];
  keys.forEach((key) => {
    if (books[key]["author"] === p_author) {
      book.push(books[key]);
    }
  });
  if (book.length > 0) {
    return res.send(book);
  } else {
    return res
      .status(300)
      .json({ message: `Book with  ${p_author}  not found` });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const keys = Object.keys(books);
  const p_title = req.params.title;

  let book = [];
  keys.forEach((key) => {
    if (books[key]["title"] === p_title) {
      book.push(books[key]);
    }
  });
  if (book.length > 0) {
    return res.send(book);
  } else {
    return res.send("No books found with title: " + p_title);
  }
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
