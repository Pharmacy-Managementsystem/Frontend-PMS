import { createBrowserRouter } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import Dashboard from './Pages/Dashboards/Dashboard';
import Login from './Pages/Login/Login';
import NotFoundPage from './Pages/NotFound/NotFoundPage';
import Setting from './Pages/Setting/Setting';
import Management from './Pages/Management/Management';
import Inventory from './Pages/Inventory/Inventory';
import Purchase from './Pages/Purchase/Purchase';
import Sales from './Pages/Sales/Sales';
import Contacts from './Pages/Contacts/Contacts';


const routers = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
 
  {
    path: '/Dashboard',
    element: <Layout />,
    children: [
        { path: 'home', element: <Dashboard /> },
      {path: 'setting', element: <Setting /> },
      { path: 'management', element: <Management /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'purchase', element: <Purchase /> },
      { path: 'sales', element: <Sales /> },
      { path: 'contacts', element: <Contacts /> },
      
    ],
  },
   { path: '*', element: <NotFoundPage /> },
]);

export default routers;