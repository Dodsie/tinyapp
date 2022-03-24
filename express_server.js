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
const urlsForUser = (userID, database) => {
  const results = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === userID) {
      results[shortURL] = database[shortURL];
    }
  }
  return results;
};

const findShortURL = (shortURL, database) => {
  for (const URL in database) {
    if (URL === shortURL) {
      return shortURL;
    }
    return undefined;
  }
};


// Users Object/Database.
const users = {
  "userRandomID": { id: "userRandomID", email: "user@example.com", password: "123" },
  "user2RandomID": { id: "user2RandomID", email: "user2@example.com", password: "1234" }
};

// Database Variable

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID",  },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" } // <---
};


///////////////////////////////////////////////////////
// Routing
app.get("/", (req, res) => {
  res.send("Hello!");
});
// Routes urls to the urls page/ routes cookie information to the index/client side.
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID || !users[userID]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Must <a href='/login'>login</a> or  <a href='/register'>register</a> to view URLs</h3>");
    return;
  }
  const usersURLs = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: usersURLs,
    userObject: users[userID] };
  res.render("urls_index", templateVars);
});

//routing to urls/new
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
  const templateVars = { userObject: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
  
});

// Submit form to shorten URL, Generates/adds URLs to URL DB.
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userIdentifier = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL: longURL, userID: userIdentifier}; // <---
  res.redirect(`/urls/${shortURL}`);
});


// short URL page, shows the longURL/shortURL(hyperlink to go to the site).
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> This Short URL does NOT exist</h3>");
    return;
  }
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL,
    userObject: users[userID]};
  res.render("urls_show", templateVars);
  
});

//update/edit existing shortURL with (edited) LongURL.
app.post("/urls/:shortURL/update", (req,res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.shortURL;

  if (!userID || !users[userID]) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Must <a href='/login'>login</a> or  <a href='/register'>register</a> to edit your URLs</h3>");
    return;
  }
  if (userID !== urlDatabase[shortURL].userID) {
    res.statusCode = 400;
    res.send("<h2> Error : 400 <h2> <br> <h3> Cannot edit other users URLs </h3>");
    return;
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});



//Routing : hello page
app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b> World</></body></html>\n");
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
  const userID = req.cookies.user_id;

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
      delete urlDatabase[shortURL]; // <---
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
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
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
    res.send("<h2> Error : 400 <h2> <br> <h3> Must be <a href='/register'>registered</a> to login</h3>");
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


  
//logout will clear cookies on the current session matiching user_id.
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// listens on port specified, returns a log when/where sucessfully listening.
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}!`);
});