import React, { useEffect, useState } from "react";
import { IconButton, Badge, Menu, MenuItem, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useBranchStore from "../store/useBranchStore"; // para obtener sucursal seleccionada
import axios from "axios";
import usePromoStore from "../store/usePromoStore";

export default function PromoNotifications() {
  const { selectedBranchId } = useBranchStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const promotions = usePromoStore((s) => s.promotions);
  const setPromotions = usePromoStore((s) => s.setPromotions); // si tu store lo define

  useEffect(() => {
    if (!selectedBranchId) return;

    const fetchPromos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/promotions/expired`,
          { params: { branchId: selectedBranchId } }
        );
        setPromotions(res.data); // <- usando el setter del store
      } catch (error) {
        console.error("Error fetching expired promotions", error);
      }
    };

    fetchPromos();
  }, [selectedBranchId]);

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/promotions/expired`,
        { params: { branchId: selectedBranchId } }
      );
      setPromotions(res.data);
    } catch (error) {
      console.error("Error fetching expired promotions", error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  console.log("promo", promotions);
  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={promotions.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {promotions.length === 0 && (
          <MenuItem disabled>
            No hay promociones vencidas o próximas a vencer
          </MenuItem>
        )}
        {promotions.map((promo) => (
          <MenuItem key={promo._id} onClick={handleClose}>
            <Typography variant="body2" fontWeight="bold">
              {promo.title}
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, color: "gray" }}>
              Vence el{" "}
              {new Date(promo.endDate).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
