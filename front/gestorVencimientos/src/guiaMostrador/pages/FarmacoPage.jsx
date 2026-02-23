import { useLocation, useParams } from "react-router-dom";
import { farmacosData } from "../data/farmacos";
import FichaFarmaco from "../components/farmacos/FichaFarmaco";
import { Typography } from "@mui/material";

export default function FarmacoPage() {
  const { id } = useParams();
  const location = useLocation();
const tipoPaciente = location.state?.tipoPaciente || "adulto";
console.log("FarmacoPage", tipoPaciente)
  const farmaco = farmacosData.find(f => f.id === id);
console.log("FarmacoPage farmaco", farmaco)

  if (!farmaco) {
    return <Typography>Fármaco no encontrado</Typography>;
  }
return (
<FichaFarmaco farmaco={farmaco} tipoPaciente={tipoPaciente} />

)
}