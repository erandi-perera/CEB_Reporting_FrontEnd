import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import LoginPage from "./pages/LoginPage";
import Layout from "./Layout";
import UserDetails from "./pages/UserDetails";
import MaterialDetails from "./mainTopics/inventory/MaterialDetails";
import ReportRoutes from "./routes/ReportRoutes";
import CostCenterTrial from "./mainTopics/TrialBalance/CostCenterTrial";
// import SelectCostCenterTrial from "./mainTopics/TrialBalance/SelectCostCeneterTrial";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/user"
          element={
            <Layout>
              <UserDetails />
            </Layout>
          }
        />

        <Route
          path="/report/inventory/material-details/:matCd"
          element={
            <Layout>
              <MaterialDetails />
            </Layout>
          }
        />

        <Route
          path="/report/TrialBalance/costcenters"
          element={
            <Layout>
              <CostCenterTrial />
            </Layout>
          }
        />

       {/* <Route
  path="/report/TrialBalance/select-cost-center/:compId"
  element={
    <Layout>
      <SelectCostCenterTrial />
    </Layout>
  }
/> */}


        {ReportRoutes()}
      </Routes>

      <ToastContainer />
    </>
  );
}

export default App;
