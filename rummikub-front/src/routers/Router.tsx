import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Room from '@/pages/Room';

function Router() {
  const routes: RouteObject[] = [
    {
      Component: Layout,
      children: [
        { index: true, Component: Home },
        { path: '/room/:roomCode', Component: Room },
      ],
    },
  ];

  const router = createBrowserRouter([...routes]);

  return <RouterProvider router={router} />;
}

export default Router;
