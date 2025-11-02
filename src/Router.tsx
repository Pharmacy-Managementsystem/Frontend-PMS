import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

const Layout = lazy(() => import("./Components/Layout/Layout"));
const Dashboard = lazy(() => import("./Pages/Dashboards/Dashboard"));
const Login = lazy(() => import("./Pages/Login/Login"));
const NotFoundPage = lazy(() => import("./Pages/NotFound/NotFoundPage"));
const Setting = lazy(() => import("./Pages/Setting/Setting"));
const Management = lazy(() => import("./Pages/Management/Management"));
const Inventory = lazy(() => import("./Pages/Inventory/Inventory"));
const Purchase = lazy(() => import("./Pages/Purchase/Purchase"));
const Contacts = lazy(() => import("./Pages/Contacts/Contacts"));

const routers = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },

  {
    path: "/Dashboard",
    element: <Layout />,
    children: [
      { path: "home", element: <Dashboard /> },
      { path: "setting", element: <Setting /> },
      { path: "management", element: <Management /> },
      { path: "inventory", element: <Inventory /> },
      { path: "purchase", element: <Purchase /> },
      { path: "contacts", element: <Contacts /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default routers;
