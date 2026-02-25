import "../App.css";
import illustration from "../assets/illustration.png";

const Register = () => {
  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="card-content">
          
          <div className="card-left">
            <img src={illustration} alt="illustration" />
          </div>

          <div className="card-right">
            <div className="logo">💜 Vimind</div>
            <div className="subtitle">
              Butuh akun baru? mari kita buat
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                className="input-field"
              />
            </div>

            <button className="primary-btn">Daftar</button>

            <div className="small-text">
              Sudah punya akun? Login
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;