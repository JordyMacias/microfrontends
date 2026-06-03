import type { FC } from 'react';
import type { MenuItem } from '../types';

interface GestionMenuProps {
  menuItemsFiltrados: MenuItem[];
  categorias: string[];
  filters: {
    sede: string;
    categoria: string;
    search: string;
    estadoPedido: string;
    sedePedido: string;
    estadoReserva: string;
    fechaReserva: string;
  };
  onChangeFilters: (newFilters: GestionMenuProps['filters']) => void;
  onAgregarItem: () => void;
  onEditarItem: (item: MenuItem) => void;
  onEliminarItem: (id: number) => void;
}

const GestionMenu: FC<GestionMenuProps> = ({
  menuItemsFiltrados,
  categorias,
  filters,
  onChangeFilters,
  onAgregarItem,
  onEditarItem,
  onEliminarItem
}) => {
  return (
    <section className="admin-section active">
      <div className="section-header">
        <h2>Gestión de Menú</h2>
        <button className="btn-primary" onClick={onAgregarItem}>
          + Agregar Item
        </button>
      </div>

      <div className="admin-filters">
        <select
          className="admin-select"
          value={filters.sede}
          onChange={(e) => onChangeFilters({ ...filters, sede: e.target.value })}
        >
          <option value="">Todas las sedes</option>
          <option value="Tasty Central">Tasty Central</option>
          <option value="Tasty Express">Tasty Express</option>
          <option value="Tasty Comedor">Tasty Comedor</option>
        </select>
        <select
          className="admin-select"
          value={filters.categoria}
          onChange={(e) => onChangeFilters({ ...filters, categoria: e.target.value })}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          className="admin-input"
          placeholder="Buscar en el menú..."
          value={filters.search}
          onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="menu-admin-grid">
        {menuItemsFiltrados.length === 0 ? (
          <p className="empty-state">No hay items en el menú. Agrega el primero haciendo clic en "Agregar Item".</p>
        ) : (
          menuItemsFiltrados.map(item => (
            <div key={item.id} className="menu-admin-card">
              <div className="menu-admin-image">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.nombre} />
                ) : (
                  <div className="image-placeholder">
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="menu-admin-info">
                <h3>{item.nombre}</h3>
                <div className="menu-admin-meta">
                  <span className="badge-sede">{item.sede}</span>
                  <span className="badge-categoria">{item.categoria}</span>
                  <span className="badge-precio">${item.precio.toFixed(2)}</span>
                </div>
                <p className="menu-admin-desc">{item.descripcion}</p>
                <div className="menu-admin-actions">
                  <button className="btn-edit" onClick={() => onEditarItem(item)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => onEliminarItem(item.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default GestionMenu;
