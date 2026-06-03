import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { MenuItem, CarritoItem } from '../types';

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
    window.dispatchEvent(new CustomEvent('carrito-updated', { detail: items }));
  } catch (e) {
    console.error('Error saving carrito:', e);
  }
};

interface SedePedidoProps {
  sedeNombre: string;
  categorias: string[];
  productos: Record<string, MenuItem[]>;
  onAgregarAlCarrito: (itemId: number) => void;
}

const SedePedido: FC<SedePedidoProps> = ({ sedeNombre, categorias, productos, onAgregarAlCarrito }) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>(loadCarritoFromStorage);

  useEffect(() => {
    console.log('Carrito cambió, guardando en localStorage:', carrito);
    saveCarritoToStorage(carrito);
    
    // Verificar que se guardó correctamente
    const verificado = loadCarritoFromStorage();
    console.log('Carrito verificado después de guardar:', verificado);
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
    console.log('🔵 Botón "Ir a Realizar Pedido" clickeado');
    
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega items antes de confirmar.');
      return;
    }

    console.log('=== INICIANDO NAVEGACIÓN A PEDIDO ===');
    console.log('Carrito antes de navegar:', carrito);
    console.log('Cantidad de items:', carrito.length);
    
    // Guardar en el storage de React (útil dentro del MF React)
    saveCarritoToStorage(carrito);

    // Verificar que se guardó correctamente
    const carritoVerificado = loadCarritoFromStorage();
    console.log('Carrito verificado después de guardar:', carritoVerificado);
    
    if (carritoVerificado.length === 0) {
      console.error('ERROR: El carrito no se guardó correctamente');
      alert('Error al guardar el carrito. Por favor intenta de nuevo.');
      return;
    }

    // IMPORTANTE: React (5173) y Vue (5174) NO comparten localStorage.
    // Enviamos el carrito al Angular (parent) para que Vue lo reciba.
    const setCarritoMessage = { type: 'set-carrito', items: carritoVerificado, sede: sedeNombre };
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(setCarritoMessage, '*');
        console.log('✅ Carrito enviado al parent (Angular) para Vue');
      } catch (e) {
        console.error('❌ Error enviando carrito al parent:', e);
      }
    }

    // Redirigir a la página de pedidos de Vue (a través del shell de Angular)
    // Enviar mensaje al parent (Angular) para navegar
    console.log('window.parent:', window.parent);
    console.log('window.top:', window.top);
    console.log('window === window.parent:', window === window.parent);
    
    const message = { type: 'navigate', route: '/pedido' };
    console.log('Mensaje a enviar:', message);
    
    let mensajeEnviado = false;
    
    // Intentar enviar mensaje al parent
    if (window.parent && window.parent !== window) {
      try {
        console.log('✅ Enviando mensaje de navegación al parent');
        window.parent.postMessage(message, '*');
        mensajeEnviado = true;
        console.log('✅ Mensaje enviado a window.parent');
      } catch (error) {
        console.error('❌ Error al enviar mensaje a parent:', error);
      }
    }
    
    // También intentar con window.top por si acaso
    if (window.top && window.top !== window && window.top !== window.parent) {
      try {
        window.top.postMessage(message, '*');
        mensajeEnviado = true;
        console.log('✅ Mensaje también enviado a window.top');
      } catch (error) {
        console.error('❌ Error al enviar mensaje a top:', error);
      }
    }
    
    // Si no se pudo enviar mensaje, usar fallback directo
    if (!mensajeEnviado) {
      console.log('⚠️ No se pudo enviar mensaje, usando navegación directa');
      // Intentar navegar directamente en el parent si existe
      if (window.parent && window.parent !== window) {
        try {
          (window.parent as any).location.href = '/pedido';
        } catch (e) {
          console.error('Error al navegar parent directamente:', e);
          // Último recurso: navegar en la ventana actual
          window.location.href = '/pedido';
        }
      } else {
        window.location.href = '/pedido';
      }
    } else {
      // Esperar un momento para ver si la navegación funciona
      setTimeout(() => {
        console.log('Verificando si la navegación funcionó...');
        // Si después de 1 segundo aún estamos aquí, usar fallback
        if (window.location.pathname !== '/pedido') {
          console.log('⚠️ La navegación por mensaje no funcionó, usando fallback');
          if (window.parent && window.parent !== window) {
            try {
              (window.parent as any).location.href = '/pedido';
            } catch (e) {
              window.location.href = '/pedido';
            }
          } else {
            window.location.href = '/pedido';
          }
        }
      }, 1000);
    }
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const agregarAlCarrito = (itemId: number) => {
    const item = Object.values(productos).flat().find(i => i.id === itemId);
    if (!item) {
      console.error('Item no encontrado:', itemId);
      return;
    }

    console.log('Agregando item al carrito:', item);

    setCarrito(prev => {
      const itemEnCarrito = prev.find(i => i.id === itemId);
      let nuevoCarrito;
      
      if (itemEnCarrito) {
        nuevoCarrito = prev.map(i =>
          i.id === itemId ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      } else {
        nuevoCarrito = [...prev, { ...item, cantidad: 1 }];
      }
      
      console.log('Carrito actualizado:', nuevoCarrito);
      return nuevoCarrito;
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
                      className="btn-cantidad"
                      onClick={() => actualizarCantidad(item.id, -1)}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      className="btn-cantidad"
                      onClick={() => actualizarCantidad(item.id, 1)}
                    >
                      +
                    </button>
                    <button
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
            <button className="btn-primary" onClick={confirmarPedido}>
              Ir a Realizar Pedido
            </button>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              Completa tus datos para finalizar el pedido
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SedePedido;
