import { useEffect, useState } from "react";
import axios from "axios";
import MonthExpirationScanner from "./MonthExpirationScanner";
import ReturnListManager from "../../components/returnList/ReturnListManager";

const VencimientosPage = () => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      const res = await axios.get( import.meta.env.VITE_API_URL +"/branches");
      setBranches(res.data);
    };
    fetchBranches();
  }, []);

  return <ReturnListManager branches={branches} />;
};

export default VencimientosPage;
