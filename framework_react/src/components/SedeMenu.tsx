import type { FC } from 'react';
import type { MenuItem } from '../types';

interface SedeMenuProps {
  sedeNombre: string;
  categorias: string[];
  productos: Record<string, MenuItem[]>;
  onAgregarProducto?: (itemId: number) => void;
}

const SedeMenu: FC<SedeMenuProps> = ({ sedeNombre, categorias, productos, onAgregarProducto }) => {
  return (
    <section className="menu-section">
      <h2 className="section-title">Menú de {sedeNombre}</h2>
      <div className="menu-grid">
        {categorias.map(categoria => (
          <div key={categoria} className="categoria-section">
            <h3 className="categoria-title">{categoria}</h3>
            <div className="menu-items-grid">
              {productos[categoria].map(item => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-image">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }} />
                    ) : (
                      <div className="image-placeholder">
                        <span>
                          📷 Imagen no disponible
                          <small>El administrador puede cargar una imagen aquí</small>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="menu-item-content">
                    <div className="menu-item-header">
                      <h4>{item.nombre}</h4>
                      <p className="menu-item-precio">${item.precio.toFixed(2)}</p>
                    </div>
                    <p className="menu-item-categoria">{item.categoria}</p>
                    <p className="menu-item-descripcion">{item.descripcion}</p>
                    {item.ingredientes && (
                      <p className="menu-item-ingredientes">
                        <strong>Ingredientes:</strong> {item.ingredientes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SedeMenu;
