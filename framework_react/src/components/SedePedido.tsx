import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { MenuItem, CarritoItem } from '../types';
import { isEmbeddedInShell, postToParent, postToTop } from '@shared/config/messaging';

const CARRITO_STORAGE_KEY = 'carritoItems';

const loadCarritoFromStorage = (): CarritoItem[] => {
  try {
    const stored = localStorage.getItem(CARRITO_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading carrito:', e);
  }
  return [];
};

const saveCarritoToStorage = (items: CarritoItem[]) => {
  try {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(items));
    globalThis.dispatchEvent(new CustomEvent('carrito-updated', { detail: items }));
  } catch (e) {
    console.error('Error saving carrito:', e);
  }
};

function navigateParentToPedido(): void {
  const win = globalThis as unknown as Window;
  const message = { type: 'navigate', route: '/pedido' };

  if (isEmbeddedInShell()) {
    postToParent(message);
    if (win.top && win.top !== win && win.top !== win.parent) {
      postToTop(message);
    }
    return;
  }

  win.location.href = '/pedido';
}

function scheduleNavigationFallback(): void {
  const win = globalThis as unknown as Window;
  setTimeout(() => {
    if (win.location.pathname === '/pedido') {
      return;
    }
    navigateParentToPedido();
  }, 1000);
}

interface SedePedidoProps {
  sedeNombre: string;
  categorias: string[];
  productos: Record<string, MenuItem[]>;
  onAgregarAlCarrito: (itemId: number) => void;
}

const SedePedido: FC<SedePedidoProps> = ({ sedeNombre, categorias, productos, onAgregarAlCarrito }) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>(loadCarritoFromStorage);

  useEffect(() => {
    saveCarritoToStorage(carrito);
  }, [carrito]);

  const actualizarCantidad = (itemId: number, cambio: number) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;

      if (item.cantidad + cambio <= 0) {
        return prev.filter(i => i.id !== itemId);
      }

      return prev.map(i =>
        i.id === itemId ? { ...i, cantidad: i.cantidad + cambio } : i
      );
    });
  };

  const removerDelCarrito = (itemId: number) => {
    setCarrito(prev => prev.filter(i => i.id !== itemId));
  };

  const confirmarPedido = () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega items antes de confirmar.');
      return;
    }

    saveCarritoToStorage(carrito);
    const carritoVerificado = loadCarritoFromStorage();

    if (carritoVerificado.length === 0) {
      alert('Error al guardar el carrito. Por favor intenta de nuevo.');
      return;
    }

    if (isEmbeddedInShell()) {
      postToParent({
        type: 'set-carrito',
        items: carritoVerificado,
        sede: sedeNombre,
      });
    }

    navigateParentToPedido();
    scheduleNavigationFallback();
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const agregarAlCarrito = (itemId: number) => {
    const item = Object.values(productos).flat().find(i => i.id === itemId);
    if (!item) {
      console.error('Item no encontrado:', itemId);
      return;
    }

    setCarrito(prev => {
      const itemEnCarrito = prev.find(i => i.id === itemId);
      if (itemEnCarrito) {
        return prev.map(i =>
          i.id === itemId ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });

    onAgregarAlCarrito(itemId);
  };

  return (
    <section className="pedido-section">
      <h2 className="section-title">Realizar Pedido</h2>
      <div className="pedido-container">
        <div className="menu-pedido">
          <div className="menu-grid">
            {categorias.map(categoria => (
              <div key={categoria} className="categoria-section">
                <h3 className="categoria-title">{categoria}</h3>
                <div className="menu-items-grid">
                  {productos[categoria].map(item => (
                    <div key={item.id} className="menu-item-card">
                      <div className="menu-item-image">
                        {item.imagen ? (
                          <img src={item.imagen} alt={item.nombre} />
                        ) : (
                          <div className="image-placeholder">
                            <span>📷 Imagen no disponible</span>
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
                        <button
                          type="button"
                          className="btn-add-cart"
                          onClick={() => agregarAlCarrito(item.id)}
                        >
                          Agregar al Pedido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="carrito-container">
          <h3>Tu Pedido</h3>
          <div className="carrito">
            {carrito.length === 0 ? (
              <p className="carrito-vacio">Tu carrito está vacío</p>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="carrito-item">
                  <div className="carrito-item-info">
                    <h4>{item.nombre}</h4>
                    <p>${item.precio.toFixed(2)} x {item.cantidad}</p>
                  </div>
                  <div className="carrito-item-controls">
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => actualizarCantidad(item.id, -1)}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      type="button"
                      className="btn-cantidad"
                      onClick={() => actualizarCantidad(item.id, 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removerDelCarrito(item.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="carrito-item-subtotal">
                    <p>${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="carrito-total">
            <p>Total: ${total.toFixed(2)}</p>
            <button type="button" className="btn-primary" onClick={confirmarPedido}>
              Ir a Realizar Pedido
            </button>
            <p style={{ fontSize: '0.85rem', color: '#b3b3b3', marginTop: '10px', textAlign: 'center' }}>
              Completa tus datos para finalizar el pedido
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SedePedido;
