import "../App.css";
import illustration from "../assets/illustration.png";

const Login = () => {
  return (
    <div className="page-wrapper">
      <div className="card">
        
        <div className="card-left">
          <img src={illustration} alt="illustration" />
        </div>

        <div className="card-right">
          <div className="logo">💜 Vimind</div>
          <div className="subtitle">
            Bagaimanakah kesehatan mentalmu hari ini?
          </div>

          <input type="email" placeholder="Email Address" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />

          <div className="forgot">Lupa Password?</div>

          <button className="primary-btn">Login</button>

          <div className="small-text">
            Belum punya akun? Daftar sekarang
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;