Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("Tracking new Diagnosis Flow", () => {
  function answerQuestions() {
    // klik semua circle pertama tiap soal
    cy.get(".circles").each(($group) => {
      cy.wrap($group).find(".circle").eq(2).click({ force: true });
    });

    cy.wait(500);

    // cek tombol next
    cy.get("body").then(($body) => {
      if ($body.text().includes("Halaman Selanjutnya")) {
        cy.contains("Halaman Selanjutnya").should("not.be.disabled").click();

        answerQuestions();
      } else {
        cy.contains("Selesai & Lihat Hasil").click();
      }
    });
  }

  it("User can do adaptive test and see history", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Sign In").click();

    cy.get('input[type="email"]').type("sabrinarahmadini60@gmail.com");

    cy.get('input[type="password"]').type("123456");
    cy.contains("Login").click();

    cy.get(".emoji", { timeout: 10000 }).should("be.visible");

    cy.get(".emoji").first().click();

    cy.contains("Cek Kondisi Mentalmu").click();
    cy.contains("Mulai Deteksi Penyakit Baru").click();
    cy.contains("Mulai").click();

    answerQuestions();

    cy.wait(500);
cy.contains("Lanjutkan ke Hasil", { timeout: 10000 })
  .should("be.visible")
  .click();
    cy.contains("Lihat Rangkuman di Dashboard").click();
    cy.contains("Lihat Rangkuman").click();
    cy.get(".item-detail-btn").first().click();

    cy.contains("Saran Perbaikan").should("be.visible");

    cy.contains("Lihat Rangkuman di Dashboard").click();
    cy.contains("Lihat Rangkuman").click();
    cy.contains("Ekspor Laporan").should("be.visible").click();
  });
});
