const bcrypt = require('bcryptjs');
const usersEmailAddressSearch = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].email;
    }
  }
  return undefined;
};

const fetchUserDataFromEmail = (candidateEmail, users) => {
  let results = {};
  for (let user in users) {
    if (users[user].email === candidateEmail) {
      return results = users[user];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let string = Math.random().toString(36).slice(7);
  return string;
};

const authenticateUser = function(email, password, userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      //if the email matches, then only we check the password
      if (bcrypt.compareSync(password, userDatabase[user].password)) {
        return userDatabase[user];
      }
    }
  }
  return false;
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

module.exports = {
  usersEmailAddressSearch,
  fetchUserDataFromEmail,
  generateRandomString,
  urlsForUser,
  authenticateUser
};