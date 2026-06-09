Cypress.on("uncaught:exception", () => false);

describe("FAQ Management", () => {
  beforeEach(() => {
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

    cy.visit("https://vimind.my.id/admin/faq");
  });

  it("Admin can add FAQ", () => {
    cy.contains("+ Tambah FAQ").click();
    cy.get(".faq-row-input").last().clear().type("Apa itu Vimind?");

    cy.get(".faq-textarea")
      .last()
      .type("Vimind adalah platform kesehatan mental.");

    cy.on("window:alert", (text) => {
    expect(text).to.contains("Berhasil disimpan!");
    });

    cy.contains("Simpan Perubahan").click();

  });

  it("Admin can update FAQ", () => {
    cy.get(".faq-toggle-btn").first().click();
    cy.get(".faq-row-input").last().clear().type("Apa itu Vimind terbaru?");

    cy.on("window:alert", (text) => {
    expect(text).to.contains("Berhasil disimpan!");
    });

    cy.contains("Simpan Perubahan").click();

  });

  it("Admin can delete FAQ", () => {
    cy.get(".faq-toggle-btn").eq(1).click();
    cy.get(".faq-delete-btn").last().click();
    cy.on("window:alert", (text) => {
      expect(text).to.contains("Berhasil dihapus!");
    });
    cy.contains("Ya, Hapus").click();
  });
});
