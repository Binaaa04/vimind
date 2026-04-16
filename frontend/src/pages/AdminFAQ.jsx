import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import "../css/AdminDashboard.css";

const AdminFAQ = () => {
  const [faq, setFaq] = useState(
    Array.from({ length: 8 }, () => ({
      question: "",
      answer: "",
    }))
  );

  const handleChange = (index, field, value) => {
    const updated = [...faq];
    updated[index][field] = value;
    setFaq(updated);
  };

  const handleSubmit = (index) => {
    console.log("FAQ disimpan:", faq[index]);
    alert(`Pertanyaan ${index + 1} disimpan`);
  };

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <h1>Custom FAQ</h1>

        {faq.map((item, index) => (
          <div key={index} className="faq-card">
            <h3>Pertanyaan {index + 1}</h3>

            <div className="faq-input-group">
              <input
                type="text"
                placeholder="Masukkan Pertanyaan"
                value={item.question}
                onChange={(e) =>
                  handleChange(index, "question", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Masukkan Jawaban"
                value={item.answer}
                onChange={(e) =>
                  handleChange(index, "answer", e.target.value)
                }
              />

              <button onClick={() => handleSubmit(index)}>
                Submit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFAQ;