const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  let user = users.find((user) => user.username === username);
  return user ? true : false;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  let user = users.find(
    (user) => user.username === p_username && user.password === p_password
  );
  return user ? true : false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const p_username = req.body.username;
  const p_password = req.body.password;

  if (!p_username || !p_password) {
    return res
      .status(404)
      .json({ message: "Please enter both username and password!" });
  }

  const isValidUser = users.find(
    (user) => user.username === p_username && user.password === p_password
  );

  if (isValidUser) {
    let accessToken = jwt.sign({ data: p_password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, p_username };
    res.status(200).send("User successfully logged in");
  } else {
    res.status(204).send("Incorrect credentials!");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const session_user = req.session.authorization.p_username;
  const q_review = req.query.review;

  if (!book) {
    res.send("Book not found with isbn " + isbn);
  }

  // type = {username: review}
  const bookReviews = book["reviews"];
  bookReviews[session_user] = q_review;

  res.status(201).send("Review added/updated:\n" + JSON.stringify(book));
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const session_user = req.session.authorization.p_username;

  if (!book) {
    res.send("Book not found with isbn " + isbn);
  }

  const before = { ...book.reviews };
  delete book.reviews[session_user];
  const after = book.reviews;

  res.status(202).json({
    message: "Delete successful",
    before: before,
    after: after,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
