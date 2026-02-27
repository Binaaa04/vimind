import { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/logovimind.png";
import logo from "../assets/logovimind2.png";
import "../App.css";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.confirm) {
      alert("Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirm) {
      alert("Password tidak sama");
      return;
    }

    console.log("Reset password:", form);

    // simulasi success
    navigate("/reset-success");
  };

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* LEFT IMAGE */}
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        {/* RIGHT FORM */}
        <div className="card-right">

          <img src={logo} alt="logo" className="reset-logo"/>

          <h3 className="reset-title">Reset password</h3>

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="input-field"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password baru"
              className="input-field"
              value={form.password}
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirm"
              placeholder="Konfirmasi password baru"
              className="input-field"
              value={form.confirm}
              onChange={handleChange}
            />

            <button type="submit" className="primary-btn">
              Kembali ke Halaman Login
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;