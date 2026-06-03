import { useState } from 'react';
import type { FC } from 'react';
import type { ReservaDatos } from '../services/reservaService';
import { crearReserva } from '../services/reservaService';

interface SedeReservaProps {
  sedeNombre: string;
  maxDate: string;
}

const SedeReserva: FC<SedeReservaProps> = ({ sedeNombre, maxDate }) => {
  const [reservaForm, setReservaForm] = useState<ReservaDatos>({
    nombre: '',
    email: '',
    telefono: '',
    fechaReserva: '',
    horaReserva: '',
    personas: 1,
    sede: ''
  });

  const handleReservaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fechaReserva = new Date(reservaForm.fechaReserva);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      alert('Por favor selecciona una fecha válida.');
      return;
    }

    crearReserva({
      ...reservaForm,
      sede: sedeNombre
    });

    alert(
      `¡Reserva confirmada!\n\nNombre: ${reservaForm.nombre}\nFecha: ${reservaForm.fechaReserva}\nHora: ${reservaForm.horaReserva}\nPersonas: ${reservaForm.personas}\n\nTe enviaremos un correo de confirmación a ${reservaForm.email}`
    );

    setReservaForm({
      nombre: '',
      email: '',
      telefono: '',
      fechaReserva: '',
      horaReserva: '',
      personas: 1,
      sede: ''
    });
  };

  return (
    <section className="reserva-section">
      <h2 className="section-title">Reservar Mesa</h2>
      <div className="form-container">
        <form onSubmit={handleReservaSubmit} className="reserva-form">
          <div className="form-group">
            <label htmlFor="nombreReserva">Nombre completo</label>
            <input
              type="text"
              id="nombreReserva"
              value={reservaForm.nombre}
              onChange={(e) => setReservaForm({ ...reservaForm, nombre: e.target.value })}
              required
              placeholder="Tu nombre"
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailReserva">Correo electrónico</label>
            <input
              type="email"
              id="emailReserva"
              value={reservaForm.email}
              onChange={(e) => setReservaForm({ ...reservaForm, email: e.target.value })}
              required
              placeholder="tu@correo.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefonoReserva">Teléfono</label>
            <input
              type="tel"
              id="telefonoReserva"
              value={reservaForm.telefono}
              onChange={(e) => setReservaForm({ ...reservaForm, telefono: e.target.value })}
              required
              placeholder="0999999999"
            />
          </div>
          <div className="form-group">
            <label htmlFor="fechaReserva">Fecha</label>
            <input
              type="date"
              id="fechaReserva"
              min={maxDate}
              value={reservaForm.fechaReserva}
              onChange={(e) => setReservaForm({ ...reservaForm, fechaReserva: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="horaReserva">Hora</label>
            <input
              type="time"
              id="horaReserva"
              value={reservaForm.horaReserva}
              onChange={(e) => setReservaForm({ ...reservaForm, horaReserva: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="personasReserva">Número de personas</label>
            <input
              type="number"
              id="personasReserva"
              min="1"
              max="10"
              value={reservaForm.personas}
              onChange={(e) => setReservaForm({ ...reservaForm, personas: Number.parseInt(e.target.value, 10) })}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Confirmar Reserva
          </button>
        </form>
      </div>
    </section>
  );
};

export default SedeReserva;
