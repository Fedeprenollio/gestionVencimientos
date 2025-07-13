import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Divider,
  List,
  ListItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const sections = [
  { id: "inicio", title: "Inicio y navegación" },
  { id: "productos", title: "Gestión de productos" },
  { id: "vencimientos", title: "Vencimientos" },
  { id: "stock", title: "Stock" },
  { id: "list", title: "Listas" },
  { id: "etiquetas", title: "Etiquetas y precios" },
  { id: "ventas", title: "Ventas y análisis" },
  { id: "sucursales", title: "Sucursales y usuarios" },
  { id: "escaneo", title: "Códigos de barras y escáner" },
  { id: "faq", title: "Preguntas frecuentes" },
];

export default function TutorialPage() {
  return (
    <Box p={3} maxWidth="800px" mx="auto">
      <Typography variant="h4" gutterBottom>
        Guía de uso de la aplicación
      </Typography>

      <Typography variant="h6" mt={2}>
        Índice
      </Typography>
      <List dense>
        {sections.map((sec) => (
          <ListItem key={sec.id}>
            <Link href={`#${sec.id}`} underline="hover">
              {sec.title}
            </Link>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {sections.map((sec) => (
        <Accordion key={sec.id} id={sec.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{sec.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderSectionContent(sec.id)}</AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function renderSectionContent(id) {
  switch (id) {
    case "inicio":
      return (
        <Typography>
          Navegá fácilmente por el panel principal. Desde aquí podés acceder a
          productos, recuentos, análisis y más.
        </Typography>
      );

    case "productos":
      return (
        <ul style={{ paddingLeft: 16 }}>
          <li>Agregá productos manualmente o escaneando con cámara.</li>
          <li>
            Editá nombre, stock, precio y códigos alternativos.{" "}
            <Link href="/" underline="hover">
              Ir al listado
            </Link>
          </li>
          <li>Buscá productos por nombre o código de barras.</li>
          <li>
            Importá nuevos productos creados por la administración, y actualizá
            precios y stock de tu sucursal.{" "}
            <Link href="/products/import" underline="hover">
              Ir a Importar
            </Link>
            . Solo necesitás descargar el stock actual desde PLEX, elegir la
            sucursal y guardarlo como archivo Excel.
          </li>
        </ul>
      );
    case "vencimientos":
      return (
        <ul style={{ paddingLeft: 16 }}>
          <li>
            Cargá medicamentos próximos a vencer escaneando con celular (solo
            Android) o con lector desde PC.
          </li>
          <li>
            También podés cargar medicamentos con sobre stock, marcando{" "}
            <strong>“Marcar como OverStock”</strong>.{" "}
            <Link
              href="/lotes/cargar"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ir a Cargar Vencimientos
            </Link>
          </li>
          <li>
            Listá productos próximos a vencer para tener un control y
            exportarlos a Excel.{" "}
            <Link
              href="/expiring"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ver productos por vencer
            </Link>
          </li>
        </ul>
      );
    case "stock":
      return (
        <ul style={{ paddingLeft: 16 }}>
          <li>
            <strong>Buscar stock en sucursales:</strong> permite subir archivos
            de pedidos a droguería en formato <code>.txt</code> y buscar si un
            medicamento que vendemos en nuestra sucursal (con rotación) lo tiene
            otra sucursal como próximo a vencer o en sobre stock. Esto permite
            <strong> rotar productos que no se mueven</strong> y evitar
            vencimientos. (Previamente hay que generar un excel con prodcutos a
            vencer{" "}
            <Link
              href="/expiring"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ver productos por vencer
            </Link>{" "}
            )
            <br />
            <Link
              href="/lotes/cargar"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ir a rotación de stock
            </Link>
          </li>
          <li style={{ marginTop: 8 }}>
            <strong>Ventas sin stock:</strong> al subir el Excel de movimientos
            recientes de Plex junto con el stock de nuestra sucursal, el sistema
            identifica productos vendidos que no fueron repuestos. Esto permite
            <strong> anticipar posibles pérdidas de ventas</strong>.
            <br />
            <Link
              href="/stock/stockAnalysiss"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ver análisis de stock
            </Link>
          </li>
        </ul>
      );
    case "list":
      return (
        <ul style={{ paddingLeft: 16 }}>
          <li>
            <strong>Listas de seguimiento de precios:</strong> permite generar
            listas por sector del local (ej: Desodorantes masculinos, Pastas
            dentales, etc). Luego, al actualizar precios, el sistema te muestra
            qué productos tuvieron cambios desde el último etiquetado, ayudando
            a <strong>ahorrar tiempo</strong>. También genera un archivo{" "}
            <code>.txt</code> compatible con el sistema de etiquetas de Plex.
            <br />
            Además, permite hacer seguimiento de ventas descargando movimientos
            desde Plex, para detectar <strong>productos sin rotación</strong> o
            con <strong>stock bajo</strong>.
            <br />
            <Link
              href="/lists"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ver listas de seguimiento
            </Link>
          </li>

          <li style={{ marginTop: 12 }}>
            <strong>Generador de etiquetas promocionales:</strong> ideal para
            campañas como Dermaglós, Bagó, etc.
            <br />
            Podés importar el archivo Excel enviado desde administración (con
            columnas <em>Codebar</em>, <em>Unitario</em> y <em>Descuento</em>),
            y el sistema carga automáticamente los productos con el descuento
            correspondiente.
            <br />
            Hay dos tipos de etiquetas disponibles: <strong>
              clásicas
            </strong> y <strong>especiales</strong> (más grandes).
            <br />
            Si el archivo contiene muchos productos y sabés que no todos están
            disponibles, podés subir un archivo de stock reciente generado desde
            Plex (desde{" "}
            <Link href="/products/import" target="_blank" rel="noopener">
              Productos / Importar productos
            </Link>
            ) para que el sistema discrimine qué etiquetas generar{" "}
            <strong>con stock</strong> y <strong>sin stock</strong>.
            <br />
            <Link href="/tags" underline="hover" target="_blank" rel="noopener">
              Ir al generador de etiquetas
            </Link>
          </li>

          <li style={{ marginTop: 12 }}>
            <strong>Listas de control de stock:</strong> útil cuando se solicita
            desde administración el stock actual de una línea de productos.
            <br />
            Se puede generar una lista rápida, cargar productos escaneando o
            manualmente, y luego exportar un Excel para enviar. También permite
            analizar ventas y stock de los productos cargados, como en el caso
            anterior.
            <br />
            <Link
              href="/stock-count"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Crear lista de control de stock
            </Link>
          </li>

          <li style={{ marginTop: 12 }}>
            <strong>Listas de devolución a droguerías:</strong> permite cargar
            productos próximos a vencer para devolución. Se puede seleccionar un
            mes de vencimiento y escanear lo que se encuentra en góndola para
            validar si aún está presente.
            <br />
            Si un producto no se encuentra, puede haberse vendido o estar mal
            ubicado. En el futuro se incorporará análisis de ventas para
            asegurar un tratamiento adecuado.
            <br />
            <Link
              href="/lists/drug-returns"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              Ir a devoluciones a droguería
            </Link>
          </li>
        </ul>
      );

    case "etiquetas":
      return (
        <Typography>
          - Generá etiquetas con precio actual o promocional.
          <br />
          - Elegí el diseño: oferta, clásico, grande.
          <br />- Imprimí por producto o en lote.
        </Typography>
      );

    // case "ventas":
      return (
        <Typography>
          - Subí un Excel con movimientos de venta.
          <br />
          - Identificá productos vendidos, vencidos o sin movimiento.
          <br />
          - Filtrá por listas personalizadas o stock total.
          <br />- Mostrá resultados en tabla ordenable.
        </Typography>
      );

    // case "sucursales":
    //   return (
    //     <Typography>
    //       - Cada usuario pertenece a una sucursal.
    //       <br />
    //       - El administrador puede ver todas.
    //       <br />
    //       - Los usuarios comunes ven sólo su sucursal.
    //       <br />- Filtrá productos y movimientos por sucursal.
    //     </Typography>
    //   );

    case "escaneo":
      return (
        <Typography>
          - Usá el escáner con cámara del celular o lector externo.
          <br />
          - Escaneá para buscar productos o agregarlos al sistema.
          <br />- Compatible en formularios, etiquetas y recuento. (Apto Androide)
        </Typography>
      );

    case "faq":
      return (
        <Typography>
          <strong>¿Qué pasa si el producto ya existe?</strong>
          <br />
          Lo podés editar o actualizar.
          <br />
          <br />
          <strong>¿Puedo usarlo sin internet?</strong>
          <br />
          No, requiere conexión para sincronizar con la base de datos.
          <br />
          <br />
          <strong>¿Qué hago si el escáner no responde?</strong>
          <br />
          Verificá permisos de cámara o intentá con otro dispositivo.
        </Typography>
      );

    default:
      return null;
  }
}
