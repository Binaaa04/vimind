Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Translate", () => {
  it("User can change language to Chinese", () => {
    cy.visit("https://vimind.my.id/");

    cy.window().then((win) => {
      win.document.cookie = "googtrans=/id/zh-CN";
    });

    cy.reload();

    cy.wait(5000);

    cy.contains("免费试用").should("be.visible");
  });
});
