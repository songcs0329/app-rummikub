import { Outlet } from 'react-router';

function Layout() {
  return (
    <div className="min-h-dvh overflow-hidden w-full bg-linear-to-b from-blue-800 to-indigo-900">
      <div className="max-w-105 mx-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
