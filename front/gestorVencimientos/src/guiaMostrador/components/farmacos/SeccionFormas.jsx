import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalculadorPediatrico from "./CalculadorPediatrico";

export default function SeccionFormas({ farmaco, forma }) {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Formas farmacéuticas
      </Typography>

      {farmaco?.formasFarmaceuticas?.map((forma, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {forma.tipo}
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {forma.descripcionSimple}
            </Typography>
            <Typography>
              Inicio: {forma.velocidadInicio}
            </Typography>
            <Typography>
              Observación: {forma.observaciones}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <CalculadorPediatrico
  farmaco={farmaco}
  forma={forma}
/>
    </>
  );
}