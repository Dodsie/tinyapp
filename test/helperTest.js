const { assert } = require('chai');

const { fetchUserDataFromEmail } = require('../helpers');

const testUsers = {
  "randomIdAlpha": {id: "randomIdAlpha", email: "alpha@example.com", password: "Alpha1"},
  "randomIdBravo": {id: "randomIdBravo", email: "bravo@example.com", password: "Bravo2"},
};

describe('fetchUserDataFromEmail', () => {
  it('Should return a user object with a valid email', () => {
    const user = fetchUserDataFromEmail("alpha@example.com", testUsers);
    const expectedResult = {id: "randomIdAlpha", email: "alpha@example.com", password: "Alpha1"};
    assert.deepEqual(user, expectedResult);
  });
  it('Should return undefined when any user object does not include a valid email', () => {
    const user = fetchUserDataFromEmail("charlie@example.com", testUsers);
    const expectedResult = undefined;
    assert.deepEqual(user, expectedResult);
  });
});
