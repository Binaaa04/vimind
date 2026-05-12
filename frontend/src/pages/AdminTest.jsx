import { useState, useEffect } from "react";
import {
  adminGetRules, adminUpsertRule, adminDeleteRule,
  adminGetSymptoms, adminUpsertSymptom, adminDeleteSymptom,
  adminGetDiseases, adminUpsertDisease, adminDeleteDisease,
} from "../services/api";
import "../css/AdminTest.css";

const AdminTest = ({ adminEmail }) => {
  const [rules, setRules] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  // UX State untuk inline editing
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editingSymptomId, setEditingSymptomId] = useState(null);
  const [editingDiseaseId, setEditingDiseaseId] = useState(null);

  // Helper untuk mendapatkan nama berdasarkan ID
  const getDiseaseName = (id) => diseases.find(d => d.id === id)?.name || `Unknown (ID: ${id})`;
  const getSymptomName = (id) => {
    const s = symptoms.find(sym => sym.id === id);
    return s ? `[${s.code}] ${s.name}` : `Unknown (ID: ${id})`;
  };

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
      if (type === "rule") {
        await adminUpsertRule(adminEmail, item);
        setEditingRuleId(null);
      }
      if (type === "symptom") {
        await adminUpsertSymptom(adminEmail, item);
        setEditingSymptomId(null);
      }
      if (type === "disease") {
        await adminUpsertDisease(adminEmail, item);
        setEditingDiseaseId(null);
      }
      // alert("✔ Berhasil disimpan!"); // Hilangkan alert agar flow lebih cepat
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

  const handleCancelEdit = (type) => {
    if (type === "rule") setEditingRuleId(null);
    if (type === "symptom") setEditingSymptomId(null);
    if (type === "disease") setEditingDiseaseId(null);
    fetchData(); // Reset perubahan yang belum di-save
  };

  if (loading) return <p className="test-loading">Memuat data knowledge base...</p>;

  return (
    <div className="admin-test-container">
      <div className="admin-test-header">
        <h1>Knowledge Base Management</h1>
        <button onClick={fetchData} className="btn-refresh">
          Refresh Data
        </button>
      </div>

      {/* ================= RULE TABLE ================= */}
      <div className="section-header">
        <h3>Tabel CF (Rules)</h3>
        <button 
          onClick={() => setRules([{ rule_id: 0, disease_id: 1, symptom_id: 1, cf_value: 0.5 }, ...rules])} 
          className="btn-add"
        >
          + Tambah Rule Baru
        </button>
      </div>
      <div className="test-table-container">
        <table className="test-table">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Rule ID</th>
              <th style={{ width: "25%" }}>Penyakit (ID)</th>
              <th style={{ width: "25%" }}>Gejala (ID)</th>
              <th style={{ width: "25%" }}>Expert CF</th>
              <th style={{ width: "15%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((item, index) => {
              const isEditing = editingRuleId === item.rule_id || item.rule_id === 0;
              return (
              <tr key={item.rule_id || `new-rule-${index}`}>
                <td>{item.rule_id === 0 ? <span className="tag-new">NEW</span> : item.rule_id}</td>
                <td>
                  {isEditing ? (
                    <select 
                      className="test-input"
                      value={item.disease_id || ""} 
                      onChange={(e) => {
                        const newRules = [...rules];
                        newRules[index].disease_id = parseInt(e.target.value);
                        setRules(newRules);
                      }} 
                    >
                      <option value="" disabled>Pilih Penyakit...</option>
                      {diseases.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{getDiseaseName(item.disease_id)}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select 
                      className="test-input"
                      value={item.symptom_id || ""} 
                      onChange={(e) => {
                        const newRules = [...rules];
                        newRules[index].symptom_id = parseInt(e.target.value);
                        setRules(newRules);
                      }} 
                    >
                      <option value="" disabled>Pilih Gejala...</option>
                      {symptoms.map(s => <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>)}
                    </select>
                  ) : (
                    getSymptomName(item.symptom_id)
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input 
                      type="number" 
                      step="0.1" 
                      className="test-input"
                      value={item.cf_value} 
                      onChange={(e) => {
                        const newRules = [...rules];
                        newRules[index].cf_value = parseFloat(e.target.value);
                        setRules(newRules);
                      }} 
                    />
                  ) : (
                    <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{item.cf_value}</span>
                  )}
                </td>
                <td>
                  <div className="test-actions">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveItem("rule", item)} className="btn-save">Save</button>
                        <button onClick={() => handleCancelEdit("rule")} className="btn-cancel" style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Batal</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingRuleId(item.rule_id)} className="btn-edit" style={{ background: '#f1f5f9', color: '#8b5cf6', border: '1px solid #ddd6fe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                        <button 
                          onClick={() => handleDelete("rule", item.rule_id)} 
                          className="btn-delete-icon" 
                          title="Hapus"
                          style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* ================= SYMPTOMS TABLE ================= */}
      <div className="section-header">
        <h3>Tabel Gejala (Symptoms / Pertanyaan)</h3>
        <button 
          onClick={() => setSymptoms([{ id: 0, code: "G00", name: "" }, ...symptoms])} 
          className="btn-add"
        >
          + Tambah Gejala Baru
        </button>
      </div>
      <div className="test-table-container">
        <table className="test-table">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>ID</th>
              <th style={{ width: "20%" }}>Kode</th>
              <th style={{ width: "55%" }}>Nama Gejala / Pertanyaan</th>
              <th style={{ width: "15%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map((item, index) => {
              const isEditing = editingSymptomId === item.id || item.id === 0;
              return (
              <tr key={item.id || `new-sym-${index}`}>
                <td>{item.id === 0 ? <span className="tag-new">NEW</span> : item.id}</td>
                <td>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="test-input"
                      value={item.code} 
                      onChange={(e) => {
                        const newSym = [...symptoms];
                        newSym[index].code = e.target.value;
                        setSymptoms(newSym);
                      }} 
                    />
                  ) : (
                    <span style={{ fontWeight: 600, color: '#64748b' }}>{item.code}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <textarea 
                      className="test-textarea"
                      value={item.name} 
                      onChange={(e) => {
                        const newSym = [...symptoms];
                        newSym[index].name = e.target.value;
                        setSymptoms(newSym);
                      }} 
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  <div className="test-actions">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveItem("symptom", item)} className="btn-save">Save</button>
                        <button onClick={() => handleCancelEdit("symptom")} className="btn-cancel" style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Batal</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingSymptomId(item.id)} className="btn-edit" style={{ background: '#f1f5f9', color: '#8b5cf6', border: '1px solid #ddd6fe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                        <button 
                          onClick={() => handleDelete("symptom", item.id)} 
                          className="btn-delete-icon"
                          title="Hapus"
                          style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* ================= DISEASES TABLE ================= */}
      <div className="section-header">
        <h3>Tabel Penyakit (Diseases)</h3>
        <button 
          onClick={() => setDiseases([{ id: 0, name: "", description: "", solutions: "" }, ...diseases])} 
          className="btn-add"
        >
          + Tambah Penyakit Baru
        </button>
      </div>
      <div className="test-table-container">
        <table className="test-table">
          <thead>
            <tr>
              <th style={{ width: "5%" }}>ID</th>
              <th style={{ width: "20%" }}>Nama Penyakit</th>
              <th style={{ width: "30%" }}>Deskripsi</th>
              <th style={{ width: "30%" }}>Solusi</th>
              <th style={{ width: "15%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((item, index) => {
              const isEditing = editingDiseaseId === item.id || item.id === 0;
              return (
              <tr key={item.id || `new-dis-${index}`}>
                <td>{item.id === 0 ? <span className="tag-new">NEW</span> : item.id}</td>
                <td>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="test-input"
                      value={item.name} 
                      onChange={(e) => {
                        const newD = [...diseases];
                        newD[index].name = e.target.value;
                        setDiseases(newD);
                      }} 
                    />
                  ) : (
                    <span style={{ fontWeight: 700, color: '#1e1b4b' }}>{item.name}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <textarea 
                      className="test-textarea"
                      value={item.description} 
                      onChange={(e) => {
                        const newD = [...diseases];
                        newD[index].description = e.target.value;
                        setDiseases(newD);
                      }} 
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#475569' }}>{item.description}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <textarea 
                      className="test-textarea"
                      value={item.solutions} 
                      onChange={(e) => {
                        const newD = [...diseases];
                        newD[index].solutions = e.target.value;
                        setDiseases(newD);
                      }} 
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#475569' }}>{item.solutions}</span>
                  )}
                </td>
                <td>
                  <div className="test-actions">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveItem("disease", item)} className="btn-save">Save</button>
                        <button onClick={() => handleCancelEdit("disease")} className="btn-cancel" style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Batal</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingDiseaseId(item.id)} className="btn-edit" style={{ background: '#f1f5f9', color: '#8b5cf6', border: '1px solid #ddd6fe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                        <button 
                          onClick={() => handleDelete("disease", item.id)} 
                          className="btn-delete-icon"
                          title="Hapus"
                          style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTest;