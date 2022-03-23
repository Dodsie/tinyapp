// app configuration
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//functon for generating new string.
const generateRandomString = () => {
  let string = Math.random().toString(36).slice(7);
  return string;
};
// Database Variable
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Browse Responses.
//reponse when home page is requested
app.get("/", (req, res) => {
  res.send("Hello!");
});
// response to urls page/renders urlDatabase with EJS/Client side index file.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// response to urls/new page renders page with urls.new.ejs.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

// response when requesting localhost:port/hello
app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b> World</></body></html>\n");
});
//redirect to longURL when short URL is applied in the /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  for (let url in urlDatabase) {
    if (url === shortURL) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
});

//update
app.post("/urls/:shortURL/update", (req,res) => {
  console.log(req.body);
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});
  





// listens on port specified, returns a log when sucessfully listening.
app.listen(PORT,() => {
  console.log(`Example app listening on ${PORT}!`);
});