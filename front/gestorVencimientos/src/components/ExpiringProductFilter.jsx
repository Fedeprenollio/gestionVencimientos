import { useState } from 'react';

export default function ExpiringProductFilter({ onFilter }) {
  const [from, setFrom] = useState('');
  const [months, setMonths] = useState(6);
  const [branch, setBranch] = useState('');
  const [type, setType] = useState('');

  const applyFilter = () => {
    onFilter({ from, months, branch, type });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h3>Filtrar productos por vencimiento</h3>

      <div>
        <label>Desde (fecha):</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
      </div>

      <div>
        <label>Meses a futuro:</label>
        <input type="number" value={months} onChange={e => setMonths(e.target.value)} min={1} />
      </div>

      <div>
        <label>Sucursal:</label>
        <select value={branch} onChange={e => setBranch(e.target.value)}>
          <option value="">Todas</option>
          <option value="sucursal1">Sucursal 1</option>
          <option value="sucursal2">Sucursal 2</option>
          <option value="sucursal3">Sucursal 3</option>
        </select>
      </div>

      <div>
        <label>Tipo:</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="">Todos</option>
          <option value="medicamento">Medicamento</option>
          <option value="perfumeria">Perfumería</option>
        </select>
      </div>

      <button onClick={applyFilter}>Aplicar filtro</button>
    </div>
  );
}
