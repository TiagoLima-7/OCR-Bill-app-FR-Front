import users from '../constants/usersTests'

describe("constants/userTest", () => {
  test("should export an array", () => {
    expect(Array.isArray(users)).toBe(true);
  });

  test("should contain exactly 4 emails", () => {
    expect(users.length).toBe(4);
  });

  test("should contain valid billed email addresses", () => {
    users.forEach(email => {
      expect(email).toMatch(/@billed\.com$/);
    });
  });

  test("should match the expected list of users", () => {
    expect(users).toEqual([
      "cedric.hiely@billed.com",
      "christian.saluzzo@billed.com",
      "jean.limbert@billed.com",
      "joanna.binet@billed.com",
    ]);
  });
});
