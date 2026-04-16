import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import "../css/AdminDashboard.css";

const AdminTest = () => {
  const [rules, setRules] = useState([
    { ruleId: 1, diseaseId: 1, symptomId: 75, cf: 0.0 },
    { ruleId: 2, diseaseId: 1, symptomId: 35, cf: 0.0 },
    { ruleId: 3, diseaseId: 1, symptomId: 98, cf: 0.0 },
  ]);

  const [symptoms, setSymptoms] = useState([
    { name: "Gejala", desc: "Deskripsi" },
    { name: "Gejala", desc: "Deskripsi" },
  ]);

  const [diseases, setDiseases] = useState([
    { name: "Disease", desc: "Deskripsi", solution: "Solusi" },
    { name: "Disease", desc: "Deskripsi", solution: "Solusi" },
  ]);

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <h1>Knowledge Base Management</h1>

        {/* ================= RULE TABLE ================= */}
        <h3>Tabel CF</h3>
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Rules ID</th>
                <th>Disease ID</th>
                <th>Symptoms ID</th>
                <th>CF Value</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((item, index) => (
                <tr key={index}>
                  <td>{item.ruleId}</td>
                  <td>{item.diseaseId}</td>
                  <td>{item.symptomId}</td>
                  <td>
                    <input
                      type="number"
                      value={item.cf}
                      step="0.1"
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[index].cf = e.target.value;
                        setRules(updated);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submit-btn">Submit</button>
        </div>

        {/* ================= SYMPTOMS ================= */}
        <h3>Tabel Gejala</h3>
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Gejala</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {symptoms.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input value={item.name} />
                  </td>
                  <td>
                    <input value={item.desc} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submit-btn">Submit</button>
        </div>

        {/* ================= DISEASE ================= */}
        <h3>Tabel Disease</h3>
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Disease</th>
                <th>Deskripsi</th>
                <th>Solusi</th>
              </tr>
            </thead>
            <tbody>
              {diseases.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input value={item.name} />
                  </td>
                  <td>
                    <input value={item.desc} />
                  </td>
                  <td>
                    <input value={item.solution} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submit-btn">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default AdminTest;