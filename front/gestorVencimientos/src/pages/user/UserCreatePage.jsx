// pages/UserCreatePage.jsx
import React from "react";

import axios from "axios";
import UserCreateForm from "../../components/user/form/UserCreateForm";

export default function UserCreatePage() {
  const handleUserSubmit = async (data) => {
    const token = localStorage.getItem("token"); // o donde lo guardes

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Usuario creado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al crear el usuario");
    }
  };

  return <UserCreateForm onSubmit={handleUserSubmit} />;
}
