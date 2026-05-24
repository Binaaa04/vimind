describe("Guest Diagnosis Flow", () => {
  function answerQuestions() {
    // klik semua circle pertama tiap soal
    cy.get(".circles").each(($group) => {
      cy.wrap($group).find(".circle").first().click({ force: true });
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

  it("Guest can test and login to see result", () => {
    cy.visit("https://vimind.my.id/");

    cy.contains("Coba Tes Gratis").click();

    answerQuestions();
    cy.contains("Lanjutkan ke Hasil").click();
    cy.contains("Masuk Sekarang").click();

    // login
    cy.contains("Login");

    cy.get('input[type="email"]').type("sabrinarahmadini60@gmail.com");

    cy.get('input[type="password"]').type("123456");

    cy.contains("Login").click();

     cy.get(".emoji", { timeout: 10000 }).should("be.visible");

     cy.get(".emoji").first().click();

         cy.contains("Berikan Penilaian Tes").click();

         cy.get(".star").eq(4).click();

         cy.get("textarea").type("Website sangat membantu dan mudah digunakan");

         cy.contains("Kirim Ulasan").click();

    cy.contains("Lihat Rangkuman di Dashboard").click();
  });
});
