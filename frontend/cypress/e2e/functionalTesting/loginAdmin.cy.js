Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Admin Login", () => {
  it("Admin can login successfully", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Sign In").click();

    const email = Cypress.env("ADMIN_EMAIL") || "admin@vimind.com";
    const password = Cypress.env("ADMIN_PASSWORD");

    cy.get('input[type="email"]').type(email);

    if (password) {
      cy.get('input[type="password"]').type(password);
    } else {
      throw new Error("ADMIN_PASSWORD is not set in Cypress environment variables");
    }

    cy.contains("Login").click();

    cy.contains("Dashboard", { timeout: 10000 }).should("be.visible");
  });
});
