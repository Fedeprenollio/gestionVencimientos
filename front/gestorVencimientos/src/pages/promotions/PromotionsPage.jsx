import { Container } from "@mui/material";
import React from "react";
import PromotionList from "../../components/PromotionList";
import PromotionForm from "../../components/PromotionForm";

export const PromotionsPage = () => {
  return (
    <Container>
      <PromotionForm />
      <PromotionList />
    </Container>
  );
};
