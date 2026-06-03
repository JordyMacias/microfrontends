import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SedeHero from '../components/SedeHero';
import SedeMenu from '../components/SedeMenu';
import SedePedido from '../components/SedePedido';
import { obtenerMenuPorSede, inicializarMenu } from '../services/menuService';
import type { MenuItem } from '../types';
import tastyCentralImg from '../assets/Tastycentral.jpg';
import tastyExpressImg from '../assets/tastyexpress.png';
import tastyComedorImg from '../assets/Tastycomedor.jpg';
import '../styles/tasty.css';

const SEDE_CONFIG: Record<string, { nombre: string; imagen: string; descripcion: string; menuDefault: MenuItem[] }> = {
  'tasty-central': {
    nombre: 'Tasty Central',
    imagen: tastyCentralImg,
    descripcion: 'El corazón de la universidad te espera con los mejores sabores',
    menuDefault: [
      { id: 1, nombre: 'Hamburguesa Clásica', precio: 5.50, categoria: 'Platos Principales', sede: 'Tasty Central', descripcion: 'Jugosa hamburguesa con carne 100% res, lechuga, tomate, cebolla y nuestra salsa especial.', ingredientes: 'Carne de res, pan artesanal, lechuga, tomate, cebolla, queso, salsa especial', imagen: '' },
      { id: 2, nombre: 'Pizza Margarita', precio: 6.00, categoria: 'Platos Principales', sede: 'Tasty Central', descripcion: 'Pizza tradicional italiana con tomate, mozzarella fresca y albahaca.', ingredientes: 'Masa artesanal, salsa de tomate, mozzarella, albahaca fresca', imagen: '' },
      { id: 3, nombre: 'Ensalada César', precio: 4.50, categoria: 'Ensaladas', sede: 'Tasty Central', descripcion: 'Fresca ensalada con lechuga romana, crutones, parmesano y aderezo césar casero.', ingredientes: 'Lechuga romana, crutones, queso parmesano, aderezo césar', imagen: '' },
      { id: 4, nombre: 'Sandwich de Pollo', precio: 4.00, categoria: 'Platos Principales', sede: 'Tasty Central', descripcion: 'Sandwich de pollo a la plancha con vegetales frescos y mayonesa.', ingredientes: 'Pechuga de pollo, pan integral, lechuga, tomate, mayonesa', imagen: '' },
      { id: 5, nombre: 'Sopa del Día', precio: 3.50, categoria: 'Sopas', sede: 'Tasty Central', descripcion: 'Sopa casera preparada diariamente con ingredientes frescos.', ingredientes: 'Varía según el día', imagen: '' },
      { id: 6, nombre: 'Jugo Natural', precio: 2.00, categoria: 'Bebidas', sede: 'Tasty Central', descripcion: 'Jugo natural de frutas frescas de temporada.', ingredientes: 'Frutas frescas de temporada', imagen: '' },
      { id: 7, nombre: 'Café Americano', precio: 1.50, categoria: 'Bebidas', sede: 'Tasty Central', descripcion: 'Café americano recién preparado, caliente y aromático.', ingredientes: 'Café 100% arábica', imagen: '' },
      { id: 8, nombre: 'Postre del Día', precio: 3.00, categoria: 'Postres', sede: 'Tasty Central', descripcion: 'Postre casero preparado diariamente por nuestro chef.', ingredientes: 'Varía según el día', imagen: '' }
    ]
  },
  'tasty-express': {
    nombre: 'Tasty Express',
    imagen: tastyExpressImg,
    descripcion: 'Comida rápida y deliciosa para estudiantes con prisa',
    menuDefault: [
      { id: 1, nombre: 'Combo Express', precio: 5.00, categoria: 'Combos', sede: 'Tasty Express', descripcion: 'Combo completo con hamburguesa, papas fritas y bebida. Perfecto para estudiantes con prisa.', ingredientes: 'Hamburguesa, papas fritas, bebida a elección', imagen: '' },
      { id: 2, nombre: 'Hot Dog', precio: 3.50, categoria: 'Platos Principales', sede: 'Tasty Express', descripcion: 'Hot dog clásico con salchicha premium, cebolla, tomate y salsas.', ingredientes: 'Salchicha premium, pan, cebolla, tomate, mostaza, ketchup', imagen: '' },
      { id: 3, nombre: 'Nachos con Queso', precio: 4.00, categoria: 'Aperitivos', sede: 'Tasty Express', descripcion: 'Nachos crujientes bañados en queso derretido y jalapeños.', ingredientes: 'Nachos, queso cheddar, jalapeños', imagen: '' },
      { id: 4, nombre: 'Wrap de Pollo', precio: 4.50, categoria: 'Platos Principales', sede: 'Tasty Express', descripcion: 'Wrap de pollo a la plancha con vegetales frescos y aderezo especial.', ingredientes: 'Pechuga de pollo, tortilla de harina, lechuga, tomate, aderezo', imagen: '' },
      { id: 5, nombre: 'Papas Fritas', precio: 2.50, categoria: 'Acompañamientos', sede: 'Tasty Express', descripcion: 'Papas fritas crujientes y doradas, perfectas como acompañamiento.', ingredientes: 'Papas, aceite, sal', imagen: '' },
      { id: 6, nombre: 'Refresco', precio: 1.50, categoria: 'Bebidas', sede: 'Tasty Express', descripcion: 'Refresco frío de tu sabor favorito.', ingredientes: 'Refresco de cola, naranja o limón', imagen: '' },
      { id: 7, nombre: 'Café Express', precio: 1.80, categoria: 'Bebidas', sede: 'Tasty Express', descripcion: 'Café expresso intenso y energizante, ideal para estudiar.', ingredientes: 'Café expresso', imagen: '' },
      { id: 8, nombre: 'Brownie', precio: 2.50, categoria: 'Postres', sede: 'Tasty Express', descripcion: 'Brownie de chocolate casero, húmedo y delicioso.', ingredientes: 'Chocolate, harina, huevos, mantequilla', imagen: '' }
    ]
  },
  'tasty-comedor': {
    nombre: 'Tasty Comedor',
    imagen: tastyComedorImg,
    descripcion: 'Platos tradicionales y caseros para toda la comunidad universitaria',
    menuDefault: [
      { id: 1, nombre: 'Arroz con Pollo', precio: 4.50, categoria: 'Platos Principales', sede: 'Tasty Comedor', descripcion: 'Tradicional arroz con pollo ecuatoriano, preparado con receta casera y mucho sabor.', ingredientes: 'Arroz, pollo, cebolla, ajo, pimiento, comino, achiote', imagen: '' },
      { id: 2, nombre: 'Seco de Carne', precio: 5.00, categoria: 'Platos Principales', sede: 'Tasty Comedor', descripcion: 'Seco de carne guisado con cerveza, servido con arroz, menestra y plátano maduro.', ingredientes: 'Carne de res, cerveza, cebolla, ajo, comino, arroz, menestra, plátano', imagen: '' },
      { id: 3, nombre: 'Encebollado', precio: 4.00, categoria: 'Platos Principales', sede: 'Tasty Comedor', descripcion: 'Sopa tradicional ecuatoriana con pescado, yuca, cebolla y cilantro.', ingredientes: 'Pescado, yuca, cebolla colorada, cilantro, tomate, limón', imagen: '' },
      { id: 4, nombre: 'Ceviche', precio: 5.50, categoria: 'Platos Principales', sede: 'Tasty Comedor', descripcion: 'Fresco ceviche de pescado con cebolla, tomate, cilantro y limón.', ingredientes: 'Pescado fresco, cebolla, tomate, cilantro, limón, sal', imagen: '' },
      { id: 5, nombre: 'Caldo de Gallina', precio: 3.50, categoria: 'Sopas', sede: 'Tasty Comedor', descripcion: 'Caldo nutritivo de gallina criolla con verduras y fideos.', ingredientes: 'Gallina criolla, zanahoria, cebolla, fideos, cilantro', imagen: '' },
      { id: 6, nombre: 'Colada Morada', precio: 2.00, categoria: 'Bebidas', sede: 'Tasty Comedor', descripcion: 'Bebida tradicional ecuatoriana preparada con frutas y especias.', ingredientes: 'Mora, piña, naranjilla, canela, clavo de olor, harina de maíz', imagen: '' },
      { id: 7, nombre: 'Jugo de Naranja', precio: 1.50, categoria: 'Bebidas', sede: 'Tasty Comedor', descripcion: 'Jugo natural de naranja recién exprimido, rico en vitamina C.', ingredientes: 'Naranjas frescas', imagen: '' },
      { id: 8, nombre: 'Flan de Leche', precio: 2.50, categoria: 'Postres', sede: 'Tasty Comedor', descripcion: 'Flan casero de leche condensada, suave y cremoso.', ingredientes: 'Leche condensada, huevos, azúcar, vainilla', imagen: '' }
    ]
  }
};

export default function Sede() {
  const { sedeId } = useParams<{ sedeId: string }>();
  const navigate = useNavigate();
  const [section, setSection] = useState<'menu' | 'pedido'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const sedeConfig = sedeId ? SEDE_CONFIG[sedeId] : null;

  useEffect(() => {
    if (!sedeId || !sedeConfig) {
      navigate('/');
      return;
    }

    inicializarMenu();
    cargarMenu();

    // Verificar cambios en localStorage
    const interval = setInterval(() => {
      cargarMenu();
    }, 2000);

    return () => clearInterval(interval);
  }, [sedeId]);

  const cargarMenu = () => {
    if (!sedeConfig) return;

    const menuAdmin = obtenerMenuPorSede(sedeConfig.nombre);
    if (menuAdmin.length > 0) {
      setMenuItems(menuAdmin);
    } else {
      setMenuItems(sedeConfig.menuDefault);
    }
  };

  const agregarAlCarrito = (_itemId: number) => {
    // Este método ahora es manejado por los componentes hijos
    // Aquí solo lo dejamos para mantener la interfaz consistente
  };

  if (!sedeConfig) return null;

  const categorias = Array.from(new Set(menuItems.map(item => item.categoria)));
  const menuAgrupado = categorias.reduce((acc, categoria) => {
    acc[categoria] = menuItems.filter(item => item.categoria === categoria);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <>
      <SedeHero sede={sedeConfig} />

      <main className="content">
        <div className="container">
          <div className="sede-actions">
            <button className="btn-primary btn-action" onClick={() => setSection('pedido')}>
              Realizar Pedido
            </button>
            <button className="btn-outline btn-action" onClick={cargarMenu} title="Actualizar menú">
              🔄 Actualizar Menú
            </button>
          </div>

          {section === 'menu' && (
            <SedeMenu 
              sedeNombre={sedeConfig.nombre}
              categorias={categorias}
              productos={menuAgrupado}
              onAgregarProducto={agregarAlCarrito}
            />
          )}

          {section === 'pedido' && (
            <SedePedido 
              sedeNombre={sedeConfig.nombre}
              categorias={categorias}
              productos={menuAgrupado}
              onAgregarAlCarrito={agregarAlCarrito}
            />
          )}
        </div>
      </main>
    </>
  );
}
