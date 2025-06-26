// hooks/useLoading.js
import { useState } from "react";

export default function useLoading() {
  const [loading, setLoading] = useState(false);

  const withLoading = async (callback) => {
    setLoading(true);
    try {
      await callback(); // ejecuta la función pasada
    } finally {
      setLoading(false);
    }
  };

  return { loading, withLoading };
}
