// MainTabs.jsx
import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import ProductLabelManager from "./ProductLabelManager";
import BranchListSelector from "../ProductList/ProductListList";

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
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={tabIndex}
        onChange={(e, newVal) => setTabIndex(newVal)}
        aria-label="Pestañas principales"
      >
        <Tab label="Listas de etiquetas" id="tab-0" aria-controls="tabpanel-0" />
        <Tab label="Generador de etiquetas" id="tab-1" aria-controls="tabpanel-1" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
       <BranchListSelector/>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <ProductLabelManager />
      </TabPanel>
    </Box>
  );
}
