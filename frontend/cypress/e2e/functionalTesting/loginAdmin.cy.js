Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Admin Login", () => {
  it("Admin can login successfully", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Sign In").click();

    cy.get('input[type="email"]').type("admin@vimind.com");

    cy.get('input[type="password"]').type("adminvimind123");

    cy.contains("Login").click();

    cy.contains("Dashboard", { timeout: 10000 }).should("be.visible");
  });
});
