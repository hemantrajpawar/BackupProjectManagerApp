import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PurchaseOrderTable from "../../components/commodityProc/ReqDashboard";
import CommodityReqService from "../../services/commodityProc/CommodityReqService";

const PurchaseOrderPage = () => {
  // Fetch Document Number on component mount
  useEffect(() => {
    fetchDocNumber();
  }, []);

  // Fetch Document Number
  const fetchDocNumber = async () => {
    try {
      setLoading(true);
      const response = await CommodityReqService.GetDocNo();

      if (response?.status_Code === 200 && response?.data) {
        setDocNumber(response.data.doc_No);
      } else {
        throw new Error("Failed to fetch document number");
      }
    } catch (error) {
      console.error("Error fetching document number:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to fetch document number. Please refresh the page.",
        confirmButtonColor: "#10b981",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf5ec] py-8 px-4">
      <div className="max-w-[95%] mx-auto">{/* Header */}</div>
    </div>
  );
};

export default PurchaseOrderPage;
