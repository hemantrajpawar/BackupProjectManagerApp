import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";
import { Download } from "lucide-react";

const CommodityReqService = {
  GetDocNo: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.CommodityProcurement.CommodityProcurementDocNo,
      );
      return response;
    } catch (error) {
      console.error("Error fetching Doc number:", error);
      throw error;
    }
  },
};

export default CommodityReqService;
