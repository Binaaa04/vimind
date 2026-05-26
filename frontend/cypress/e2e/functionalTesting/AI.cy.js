Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("AI Chat Feature", () => {
  it("User can send message to AI", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Sign In").click();

    cy.get('input[type="email"]').type("sabrinarahmadini60@gmail.com");

    cy.get('input[type="password"]').type("123456");

    cy.contains("Login").click();

    cy.get(".emoji", { timeout: 10000 }).should("be.visible");

    cy.get(".emoji").first().click();

    cy.get(".chatbot-float-btn").click();

    cy.get(".chatbot-input-field").type("Saya merasa cemas");

    cy.get(".chatbot-send-btn").click();

    cy.contains("AI").should("be.visible");
  });
});