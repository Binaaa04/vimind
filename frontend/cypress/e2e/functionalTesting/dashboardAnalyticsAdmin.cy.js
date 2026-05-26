Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Dashboard Analytics", () => {
  it("Admin can view analytics dashboard", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Sign In").click();

    cy.get('input[type="email"]').type("admin@vimind.com");

    cy.get('input[type="password"]').type("adminvimind123");

    cy.contains("Login").click();

    cy.get('a[href="/admin/analytics"]').click();

    cy.url().should("include", "/admin/analytics");

    cy.contains("Dashboard Analytics").should("be.visible");
  });
});
