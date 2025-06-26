// components/lots/LotList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import dayjs from 'dayjs';
import ExpiringProductList from '../products/ExpiringProductList';

const LotList = () => {
 
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6">Productos próximos a vencer</Typography>
     
      <ExpiringProductList/>
    </Box>
  );
};

export default LotList;
