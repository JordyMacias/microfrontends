import { useNavigate } from 'react-router-dom';
import bannerImg from '../assets/banner.jpg';
import tastyCentralImg from '../assets/Tastycentral.jpg';
import tastyExpressImg from '../assets/tastyexpress.png';
import tastyComedorImg from '../assets/Tastycomedor.jpg';
import '../styles/tasty.css';

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero-banner">
        <div className="banner-container">
          <img src={bannerImg} alt="Banner Comida" className="banner-img" />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Sabores que inspiran</h1>
              <p>Descubre platos creados para aprender y disfrutar en cada una de nuestras sedes universitarias.</p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Sedes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Platos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Disponible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="content">
        <div className="container">
          <h2 className="section-title">Nuestras sucursales</h2>

          <div className="main-grid">
            <div className="sucursales-container">
              <button type="button" className="card card-clickable" onClick={() => navigate('/sede/tasty-central')}>
                <img src={tastyCentralImg} alt="Tasty Central" />
                <div className="card-footer">Tasty Central</div>
              </button>
              <button type="button" className="card card-clickable" onClick={() => navigate('/sede/tasty-express')}>
                <img src={tastyExpressImg} alt="Tasty Express" />
                <div className="card-footer">Tasty Express</div>
              </button>
              <button type="button" className="card card-clickable" onClick={() => navigate('/sede/tasty-comedor')}>
                <img src={tastyComedorImg} alt="Tasty Comedor" />
                <div className="card-footer">Tasty Comedor</div>
              </button>
            </div>

            <aside className="cta-sidebar">
              <div className="cta-card">
                <h3>¿Cómo funciona?</h3>
                <div className="how-it-works">
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <h4>Elige tu sede</h4>
                      <p>Selecciona la cafetería más cercana a ti</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <h4>Explora el menú</h4>
                      <p>Descubre nuestros deliciosos platos</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <h4>Reserva o pide</h4>
                      <p>Reserva una mesa o realiza tu pedido</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
