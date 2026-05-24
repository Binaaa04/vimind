Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Translate Flow", () => {
  it("User can change language to Chinese", () => {
    cy.visit("https://vimind.my.id/");

    // set translate cookie
    cy.window().then((win) => {
      win.document.cookie = "googtrans=/id/zh-CN";
    });

    cy.reload();

cy.contains("免费试用").should("be.visible");
  });
});
