Cypress.on("uncaught:exception", () => {
  return false;
});

describe("CRUD Banner Functional Testing - ViMind Admin", () => {
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

    cy.wait(3000);
  });

  it("Create New Banner", () => {
    cy.contains("+ Tambah Banner Baru").click();

    cy.wait(2000);

    cy.get(".banner-fields input:visible")
      .eq(0)
      .clear()
      .type("Banner Cypress Testing");

    cy.get(".banner-fields input:visible")
      .eq(1)
      .clear()
      .type("https://google.com");

    cy.get(".banner-fields input:visible")
      .eq(2)
      .clear()
      .type("https://images.unsplash.com/photo-1506744038136-46273834b3fb");

    cy.contains("Submit Perubahan").click();

    cy.contains("Banner Cypress Testing").should("exist");
  });

  it("Read Banner Data", () => {
    cy.get(".banner-card-row").should("exist");

    cy.contains("Aktif").should("exist");
  });

  it("Update Existing Banner", () => {
    cy.get(".banner-expand-btn").first().click();

    cy.wait(1000);

    cy.get(".banner-fields input:visible")
      .eq(0)
      .clear()
      .type("Updated Banner Cypress");

    cy.contains("Submit Perubahan").click();

    cy.contains("Updated Banner Cypress").should("exist");
  });

  it("Delete Banner", () => {
    cy.get(".delete-btn").first().click();

    cy.contains("Ya, Hapus").click();

    cy.wait(3000);

    cy.get(".banner-card-row").should("exist");
  });

  it("Toggle Banner Status", () => {
    cy.get(".status-toggle-btn").first().click();

    cy.wait(2000);

    cy.get(".banner-card-row").should("exist");
  });

  it("Expand and Collapse Banner Form", () => {
    cy.get(".banner-expand-btn").first().click();

    cy.contains("Preview Tampilan Banner").should("be.visible");

    cy.get(".banner-expand-btn").first().click();
  });
});
