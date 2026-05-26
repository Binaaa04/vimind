Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Export Report Feature", () => {
  it("User can export report", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Sign In").click();

    cy.get('input[type="email"]').type("sabrinarahmadini60@gmail.com");

    cy.get('input[type="password"]').type("123456");

    cy.contains("Login").click();

    cy.get(".emoji", { timeout: 10000 }).should("be.visible");

    cy.get(".emoji").first().click();

    cy.contains("Lihat Rangkuman").click();

    cy.contains("Ekspor Laporan").click();
  });
});
