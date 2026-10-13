import { lazy } from "react";

const menuConfig = [
  {
    path: "/iReact/CommodityProcurement",
    component: lazy(
      () => import("../pages/commodityProc/ReqDashboardPage.jsx"),
    ),
  },
];

export default menuConfig;
