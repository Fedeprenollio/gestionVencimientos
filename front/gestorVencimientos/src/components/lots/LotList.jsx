// components/lots/LotList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import dayjs from 'dayjs';
import ExpiringProductList from '../products/ExpiringProductList';

const LotList = () => {
  // const [lots, setLots] = useState([]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     const res = await axios.get(  `${import.meta.env.VITE_API_URL}/products`);
  //     console.log("RES",res)
  //     setLots(res.data);
  //   };
  //   fetch();
  // }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Lotes próximos a vencer</Typography>
     
      <ExpiringProductList/>
    </Box>
  );
};

export default LotList;
