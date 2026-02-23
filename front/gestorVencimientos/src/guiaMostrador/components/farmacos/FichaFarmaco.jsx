// import {
//   Card,
//   CardContent,
//   Divider,
//   Box
// } from "@mui/material";

// import HeaderFarmaco from "./HeaderFarmaco";
// import SeccionDosis from "./SeccionDosis";
// import SeccionAlertas from "./SeccionAlertas";
// import SeccionFormas from "./SeccionFormas";
// import SeccionEmbarazo from "./SeccionEmbarazo";
// import SeccionPreguntas from "./SeccionPreguntas";
// import SeccionLineaComercial from "./SeccionLineaComercial";

// export default function FichaFarmaco({ farmaco,tipoPaciente }) {
// console.log("farmaco",farmaco)
//   if (!farmaco) return null;

//   return (
//     <Card sx={{ maxWidth: 800, margin: "auto", mt: 3 }}>
//       <CardContent>

//         <HeaderFarmaco farmaco={farmaco} />

//         <Divider sx={{ my: 2 }} />

//        <SeccionDosis farmaco={farmaco} tipoPaciente={tipoPaciente} />

//        <SeccionLineaComercial  farmaco={farmaco} />

//         <Divider sx={{ my: 2 }} />

//         <SeccionAlertas farmaco={farmaco} />

//         <Divider sx={{ my: 2 }} />

//         <SeccionEmbarazo farmaco={farmaco} />

//         <Divider sx={{ my: 2 }} />

//         <SeccionPreguntas farmaco={farmaco} />

//         <Divider sx={{ my: 2 }} />

//         <SeccionFormas farmaco={farmaco} />

//       </CardContent>
//     </Card>
//   );
// }

import {
  Card,
  CardContent,
  Divider,
} from "@mui/material";

import HeaderFarmaco from "./HeaderFarmaco";
import SeccionDosis from "./SeccionDosis";
import SeccionAlertas from "./SeccionAlertas";
import SeccionFormas from "./SeccionFormas";
import SeccionEmbarazo from "./SeccionEmbarazo";
import SeccionPreguntas from "./SeccionPreguntas";
import SeccionLineaComercial from "./SeccionLineaComercial";
import SeccionEquivalentes from "./SeccionEquivalentes";
import SeccionEducacionGrupo from "./SeccionEducacionGrupo";

export default function FichaFarmaco({ farmaco, tipoPaciente }) {
  if (!farmaco) return null;

  return (
    <Card sx={{ maxWidth: 800, margin: "auto", mt: 3, boxShadow: 3 }}>
      <CardContent>


        {/* 1. EDUCACIÓN AL PÚBLICO (Jerarquía por grupo) */}
      {/* <SeccionEducacionGrupo claseId={farmaco.claseTerapeutica} /> */}
        {/* ENCABEZADO: Nombre, Grupo y Riesgo */}
        <HeaderFarmaco farmaco={farmaco} />

        {/* EQUIVALENCIAS: Aparece solo si hay un grupoEquivalencia */}
        <SeccionEquivalentes farmacoActual={farmaco} />

        <Divider sx={{ my: 2 }} />

        {/* DOSIS: Con lógica adulto/pediátrico */}
        <SeccionDosis farmaco={farmaco} tipoPaciente={tipoPaciente} />

        <Divider sx={{ my: 2 }} />

        {/* LINEA COMERCIAL: Para ver variantes como Migral II, etc. */}
        <SeccionLineaComercial farmaco={farmaco} />

        <Divider sx={{ my: 2 }} />

        <SeccionAlertas farmaco={farmaco} />

        <Divider sx={{ my: 2 }} />

        <SeccionEmbarazo farmaco={farmaco} />

        <Divider sx={{ my: 2 }} />

        <SeccionPreguntas farmaco={farmaco} />

        <Divider sx={{ my: 2 }} />

        <SeccionFormas farmaco={farmaco} />
      </CardContent>
    </Card>
  );
}