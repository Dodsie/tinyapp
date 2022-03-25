/*
Configurations
Functions/Variables
*/
const bcrypt = require('bcryptjs');
const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const helpers = require('./helpers');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["hello", "goodbye"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const generateRandomString = helpers.generateRandomString;
const usersEmailAddressSearch = helpers.usersEmailAddressSearch;
const urlsForUser = helpers.urlsForUser;
const authenticateUser = helpers.authenticateUser;
// Users Object/Database.
const users = {};
const urlDatabase = {};


////////////////////////////////////////////////////////// ROUTING //////////////////////////////////////////////////////////////
//HOME PAGE
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.redirect('/urls');
});
//URLS PAGE
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  // if user is not logged in or in database
  if (!userID || !users[userID]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Must <a href='/login'>login</a> or  <a href='/register'>register</a> to view/create URLs</h3>");
    return;
  }
  // creates new url within current userID database.
  const usersURLs = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: usersURLs,
    userObject: users[userID] };
  res.render("urls_index", templateVars);
});
// will create a new URL and add it to the database.
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userIdentifier = req.session.userID;
  urlDatabase[shortURL] = {longURL: longURL, userID: userIdentifier}; // <---
  res.redirect(`/urls/${shortURL}`);
});

// URLS/NEW (renders_index)
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/login');
  }
  const templateVars = { userObject: users[userID]};
  res.render("urls_new", templateVars);
});

// short URL page, shows the longURL/shortURL(hyperlink to go to the site).
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  //if user is not logged in or not in database
  if (!userID || !users[userID]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Must <a href='/login'>login</a> or  <a href='/register'>register</a> to access URLs</h3>");
    return;
  }
  //if shortURL does not exist
  if (!urlDatabase[shortURL]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> This Short URL does NOT exist</h3>");
    return;
  }
  // if shortURL exist but not in current users URLs
  if (userID !== urlDatabase[shortURL].userID) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> This ShortURL does not exist in your URLs library </h3>");
    return;
  }
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL,
    userObject: users[userID]};
  res.render("urls_show", templateVars);
  
});

//update/edit existing shortURL with (edited) LongURL.
app.post("/urls/:shortURL/update", (req,res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  //if user is not logged in or user has been deleted.
  if (!userID || !users[userID]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Must <a href='/login'>login</a> or  <a href='/register'>register</a> to edit your URLs</h3>");
    return;
  }
  // if user does not own the specified shortURL they cannot edit this.
  if (userID !== urlDatabase[shortURL].userID) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Cannot edit other users URLs </h3>");
    return;
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});


//Redirects to longURL. Ex.(/u/a4fcd2) --> http://www.google.com
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> This Short URL does NOT exist</h3>");
    return;
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
    
  
  
});

//deletes URL from database, redirection to /urls page.
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  const userID = req.session.userID;

  if (!userID || !users[userID]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Must <a href='/login'>login</a> or  <a href='/register'>register</a> to delete your URLs</h3>");
    return;
  }
  if (userID !== urlDatabase[shortURL].userID) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Cannot delete other users URLs </h3>");
    return;
  }

  for (let url in urlDatabase) {
    if (url === shortURL) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
});

// register page -- renders with urls_register.ejs
app.get("/register", (req,res) => {
  const userID = req.session.userID;
  if (userID) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { userObject: users[req.session.userID] };
  res.render("urls_register",templateVars);
});
// register post with conditions
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(candidatePassword, 10); // <---
  //if email or password are empty
  if (!candidateEmail || !candidatePassword) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Username/Password Fields must NOT be empty.</h3>");
    return;
  }
  // if email is already in use
  if (candidateEmail === usersEmailAddressSearch(candidateEmail, users)) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> This email is already in use. Please Login.</h3>");
    return;
  }
  // if user is not in database - sucess creates new user.
  users[id] = { id: id, email: candidateEmail, password: hashedPassword};
  req.session.userID = users[id].id;
  res.redirect("/urls");
});

//Login
app.get("/login", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  }
  const templateVars = { userObject: users[req.session.userID] };
  res.render("urls_login",templateVars);
});

//login post/form
app.post("/login", (req, res) => {
  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;

  //1. if the email or password is null
  if (!candidateEmail || !candidatePassword) {
    res.send("<h2> Error : 403 <h2> <br> <h3> Username or Password fields cannot be empty</h3>");
  }
  //2. Check for the User Credentials i.e. email and password
  let user = authenticateUser(candidateEmail, candidatePassword, users);
  if (user) {
    //if autheniticator passes, user is found password is matching (success)
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    //Else the User credentials don't match or the user does not exists
    res.statusCode = 403;
    res.send("<h2> Error : 403 <h2> <br> <h3> Username or Password is Incorrect</h3>");
  
  }
});

  
// POST - LOGOUT - Will clear session cookie/Logout user.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//  Establishes server connection on port specified.
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}!`);
});