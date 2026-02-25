import "../App.css";
import illustration from "../assets/illustration.png";

const Success = () => {
  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="card-content">
          
          <div className="card-left">
            <img src={illustration} alt="illustration" />
          </div>

          <div className="card-right">
            <div className="logo">💜 Vimind</div>
            <h3>Selamat, email berhasil dibuat</h3>
            <br />
            <button className="primary-btn">
              Lengkapi profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Success;