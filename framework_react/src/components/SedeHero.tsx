import type { FC } from 'react';

interface SedeHeroProps {
  sede: {
    nombre: string;
    imagen: string;
    descripcion: string;
  };
}

const SedeHero: FC<SedeHeroProps> = ({ sede }) => {
  return (
    <section className="sede-hero">
      <div className="sede-banner">
        <img src={sede.imagen} alt={sede.nombre} />
        <div className="sede-overlay">
          <h1>{sede.nombre}</h1>
          <p>{sede.descripcion}</p>
        </div>
      </div>
    </section>
  );
};

export default SedeHero;
