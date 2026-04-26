import { useState, useEffect } from "react";
import {
  adminGetRules, adminUpsertRule, adminDeleteRule,
  adminGetSymptoms, adminUpsertSymptom, adminDeleteSymptom,
  adminGetDiseases, adminUpsertDisease, adminDeleteDisease,
} from "../services/api";
import "../css/AdminDashboard.css";

const AdminTest = ({ adminEmail }) => {
  const [rules, setRules] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!adminEmail) return;
    setLoading(true);
    try {
      const [r, s, d] = await Promise.all([
        adminGetRules(adminEmail),
        adminGetSymptoms(adminEmail),
        adminGetDiseases(adminEmail),
      ]);
      setRules(r.data || []);
      setSymptoms(s.data || []);
      setDiseases(d.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminEmail]);

  // ---- GENERIC DELETE ----
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Yakin mau menghapus data ini?`)) return;
    try {
      if (type === "rule") await adminDeleteRule(adminEmail, id);
      if (type === "symptom") await adminDeleteSymptom(adminEmail, id);
      if (type === "disease") await adminDeleteDisease(adminEmail, id);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  // ---- GENERIC SAVE FOR NEW/EDITED ----
  const handleSaveItem = async (type, item) => {
    try {
      if (type === "rule") await adminUpsertRule(adminEmail, item);
      if (type === "symptom") await adminUpsertSymptom(adminEmail, item);
      if (type === "disease") await adminUpsertDisease(adminEmail, item);
      alert("✔ Berhasil disimpan!");
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

  if (loading) return <p style={{ color: "#aaa", padding: 20 }}>Memuat data knowledge base...</p>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Knowledge Base Management</h1>
        <button onClick={fetchData} className="refresh-btn">🔄 Refresh Data</button>
      </div>

      {/* ================= RULE TABLE ================= */}
      <div className="section-header">
        <h3>Tabel CF (Rules)</h3>
        <button onClick={() => setRules([{ rule_id: 0, disease_id: 1, symptom_id: 1, cf_value: 0.5 }, ...rules])} className="add-btn">
          + Tambah Rule Baru
        </button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Penyakit (ID)</th>
              <th>Gejala (ID)</th>
              <th>Expert CF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((item, index) => (
              <tr key={item.rule_id || `new-rule-${index}`}>
                <td>{item.rule_id === 0 ? <span className="new-tag">NEW</span> : item.rule_id}</td>
                <td>
                  <input type="number" value={item.disease_id} onChange={(e) => {
                    const newRules = [...rules];
                    newRules[index].disease_id = parseInt(e.target.value);
                    setRules(newRules);
                  }} />
                </td>
                <td>
                  <input type="number" value={item.symptom_id} onChange={(e) => {
                    const newRules = [...rules];
                    newRules[index].symptom_id = parseInt(e.target.value);
                    setRules(newRules);
                  }} />
                </td>
                <td>
                  <input type="number" step="0.1" value={item.cf_value} onChange={(e) => {
                    const newRules = [...rules];
                    newRules[index].cf_value = parseFloat(e.target.value);
                    setRules(newRules);
                  }} />
                </td>
                <td>
                  <button onClick={() => handleSaveItem("rule", item)} className="mini-save-btn">Simpan</button>
                  {item.rule_id !== 0 && (
                    <button onClick={() => handleDelete("rule", item.rule_id)} className="mini-del-btn">Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= SYMPTOMS TABLE ================= */}
      <div className="section-header">
        <h3>Tabel Gejala (Symptoms / Pertanyaan)</h3>
        <button onClick={() => setSymptoms([{ id: 0, code: "G00", name: "" }, ...symptoms])} className="add-btn">
          + Tambah Gejala Baru
        </button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kode</th>
              <th>Nama Gejala / Pertanyaan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map((item, index) => (
              <tr key={item.id || `new-sym-${index}`}>
                <td>{item.id === 0 ? <span className="new-tag">NEW</span> : item.id}</td>
                <td>
                  <input type="text" value={item.code} onChange={(e) => {
                    const newSym = [...symptoms];
                    newSym[index].code = e.target.value;
                    setSymptoms(newSym);
                  }} />
                </td>
                <td>
                  <textarea value={item.name} onChange={(e) => {
                    const newSym = [...symptoms];
                    newSym[index].name = e.target.value;
                    setSymptoms(newSym);
                  }} style={{ width: "100%", color: "#333" }} />
                </td>
                <td>
                  <button onClick={() => handleSaveItem("symptom", item)} className="mini-save-btn">Simpan</button>
                  {item.id !== 0 && (
                    <button onClick={() => handleDelete("symptom", item.id)} className="mini-del-btn">Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DISEASES TABLE ================= */}
      <div className="section-header">
        <h3>Tabel Penyakit (Diseases)</h3>
        <button onClick={() => setDiseases([{ id: 0, name: "", description: "", solutions: "" }, ...diseases])} className="add-btn">
          + Tambah Penyakit Baru
        </button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Penyakit</th>
              <th>Deskripsi</th>
              <th>Solusi</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((item, index) => (
              <tr key={item.id || `new-dis-${index}`}>
                <td>{item.id === 0 ? <span className="new-tag">NEW</span> : item.id}</td>
                <td>
                  <input type="text" value={item.name} onChange={(e) => {
                    const newD = [...diseases];
                    newD[index].name = e.target.value;
                    setDiseases(newD);
                  }} />
                </td>
                <td>
                  <textarea value={item.description} onChange={(e) => {
                    const newD = [...diseases];
                    newD[index].description = e.target.value;
                    setDiseases(newD);
                  }} style={{ width: "100%", color: "#333" }} />
                </td>
                <td>
                  <textarea value={item.solutions} onChange={(e) => {
                    const newD = [...diseases];
                    newD[index].solutions = e.target.value;
                    setDiseases(newD);
                  }} style={{ width: "100%", color: "#333" }} />
                </td>
                <td>
                  <button onClick={() => handleSaveItem("disease", item)} className="mini-save-btn">Simpan</button>
                  {item.id !== 0 && (
                    <button onClick={() => handleDelete("disease", item.id)} className="mini-del-btn">Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; margin-bottom: 10px; }
        .add-btn { background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
        .refresh-btn { background: #8B5CF6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .mini-save-btn { background: #3B82F6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px; }
        .mini-del-btn { background: #EF4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
        .new-tag { background: #FBBF24; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .table-box table textarea { font-family: inherit; font-size: 12px; padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
      `}} />
    </div>
  );
};

export default AdminTest;