const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    //created in login middleware
    let token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// ------------------- Utility functions for authentication/authorization ------------------------------------

//list of registered users (following the pattern from the practice lab), type: [{username, password}]
const users = [];

/*
    Register new users - POST
    body expects {username, password}
*/
app.post("/register", (req, res) => {
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

/*
    Login with registered user - POST
    body expects {username, password}
*/
app.post("/login", (req, res) => {
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
// ------------------------ END utility functions for authentication/authorization ---------------------------------
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
