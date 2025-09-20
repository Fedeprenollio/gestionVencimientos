import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import ProductLabelManager from "./ProductLabelManager";
import BranchListSelector from "../ProductList/ProductListList";
import CartelConsumoInmediato from "./CartelConsumoInmediato"; // 👈 nuevo componente que haremos
import { useLocation } from "react-router-dom";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function MainTabs() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialTab = parseInt(query.get("tab")) || 0;

  const [tabIndex, setTabIndex] = useState(initialTab);

  useEffect(() => {
    const newTab = parseInt(query.get("tab"));
    if (!isNaN(newTab)) setTabIndex(newTab);
  }, [location.search]);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={tabIndex}
        onChange={(e, newVal) => setTabIndex(newVal)}
        aria-label="Pestañas principales"
      >
        <Tab label="Listas de etiquetas" id="tab-0" aria-controls="tabpanel-0" />
        <Tab label="Generador de etiquetas" id="tab-1" aria-controls="tabpanel-1" />
        <Tab label="Consumo inmediato" id="tab-2" aria-controls="tabpanel-2" /> {/* 🆕 Nueva pestaña */}
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <BranchListSelector />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <ProductLabelManager />
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <CartelConsumoInmediato /> {/* 👈 Nuevo componente */}
      </TabPanel>
    </Box>
  );
}
