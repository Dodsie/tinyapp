/*
Configurations
Functions/Variables
*/
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


//functions.
const generateRandomString = () => {
  let string = Math.random().toString(36).slice(7);
  return string;
};

const usersPasswordSearch = (password, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].password === password) {
      return userDatabase[user].password;
    }
  }
  return undefined;
};

const usersEmailAddressSearch = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].email;
    }
  }
  return undefined;
};

// Users Object/Database.
const users = {
  "userRandomID": { id: "userRandomID", email: "user@example.com", password: "123" },
  "user2RandomID": { id: "user2RandomID", email: "user2@example.com", password: "1234" }
};

// Database Variable

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


///////////////////////////////////////////////////////
// Routing
app.get("/", (req, res) => {
  res.send("Hello!");
});
// Routes urls to the urls page/ routes cookie information to the index/client side.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    userObject: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//routing to urls/new
app.get("/urls/new", (req, res) => {
  console.log(users);
  const templateVars = { userObject: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

// Submit form to shorten URL, Generates/adds URLs to URL DB.
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


// short URL page, shows the longURL/shortURL(hyperlink to go to the site).
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    userObject: users[req.cookies.user_id]};
  res.render("urls_show", templateVars);
});

//Routing : hello page
app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b> World</></body></html>\n");
});
//Redirects to longURL. Ex.(/u/a4fcd2) --> http://www.google.com
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//deletes URL from database, redirection to /urls page.
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  for (let url in urlDatabase) {
    if (url === shortURL) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
});
// register page
app.get("/register", (req,res) => {
  const templateVars = { userObject: users[req.cookies.user_id] };
  res.render("urls_register",templateVars);
});
// register post with conditions
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;
  
  if (!candidateEmail || !candidatePassword) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Username/Password Fields must NOT be empty.</h3>");
    return;
  }

  if (candidateEmail === usersEmailAddressSearch(candidateEmail, users)) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> This email is already in use. Please Login.</h3>");
    return;
  }

  users[id] = { id: id, email: candidateEmail, password: candidatePassword};
  res.cookie("user_id", users[id].id);
  res.redirect("/urls");
});

//login
app.get("/login", (req, res) => {
  const templateVars = { userObject: users[req.cookies.user_id] };
  res.render("urls_login",templateVars);
});

// login post with conditions
app.post("/login", (req, res) => {
  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;
  const emailCheck = usersEmailAddressSearch(candidateEmail, users);
  const passwordCheck = usersPasswordSearch(candidatePassword, users);
  if (candidateEmail !== emailCheck) {
    res.statusCode = 403;
    res.send("Email is not registered!");
    return;
  } if (candidateEmail === emailCheck && candidatePassword !== passwordCheck) {
    res.statusCode = 403;
    res.send("Password invalid");
    return;
  } if (candidateEmail === emailCheck && candidatePassword === passwordCheck) {
    for (let user in users) {
      res.cookie("user_id", users[user].id);
    }
    res.redirect("/urls");
  }
});


//update/edit existing shortURL with (edited) LongURL.
app.post("/urls/:shortURL/update", (req,res) => {
  console.log(req.body);
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});
  
//logout will clear cookies on the current session matiching user_id.
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// listens on port specified, returns a log when/where sucessfully listening.
app.listen(PORT,() => {
  console.log(`Server is listening on ${PORT}!`);
});