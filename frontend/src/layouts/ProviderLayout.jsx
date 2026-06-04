import { Outlet } from 'react-router-dom';
import ProviderNavbar from '../components/ProviderNavbar/ProviderNavbar';
import './ProviderLayout.css';

const ProviderLayout = () => (
  <div className="provider-layout">
    <ProviderNavbar />
    <main className="provider-layout-main">
      <Outlet />
    </main>
  </div>
);

export default ProviderLayout;
