/*
Configurations
Functions/Variables
*/
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const req = require('express/lib/request');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


//functon for generating new string.
const generateRandomString = () => {
  let string = Math.random().toString(36).slice(7);
  return string;
};
const templateVars = {
  username: req.cookies["username"],
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
// urls page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// urls/new page, create a new shortUrl page.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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

// login
app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie('username', req.body['username']);
  res.redirect("/urls");
});



// listens on port specified, returns a log when sucessfully listening.
app.listen(PORT,() => {
  console.log(`Example app listening on ${PORT}!`);
});