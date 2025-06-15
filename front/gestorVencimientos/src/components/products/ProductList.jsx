export default function ProductList({ products }) {
    if (!products.length) return <p>No hay productos próximos a vencer.</p>;
    console.log("products",products)
    return (
      <table border="1" cellPadding="5">
        <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Vence</th></tr></thead>
        <tbody>
          {products?.map(p => (
            <tr key={p._id}>
              <td>{p.barcode}</td>
              <td>{p.name}</td>
              <td>{p.type}</td>
              <td>{new Date(p.expirationDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  