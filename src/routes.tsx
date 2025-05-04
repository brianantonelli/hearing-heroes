import React from 'react';
import { RouteObject } from 'react-router-dom';
import App from './App';

// Lazy load components for better performance and code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Game = React.lazy(() => import('./pages/Game'));
const ParentArea = React.lazy(() => import('./pages/ParentArea'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading component for suspense fallback
const Loading = () => (
  <div className="loading-screen">
    <div className="loading-animation">Loading...</div>
  </div>
);

// Define routes
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<Loading />}>
            <Home />
          </React.Suspense>
        ),
      },
      {
        path: 'game',
        element: (
          <React.Suspense fallback={<Loading />}>
            <Game />
          </React.Suspense>
        ),
      },
      {
        path: 'parent',
        element: (
          <React.Suspense fallback={<Loading />}>
            <ParentArea />
          </React.Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <React.Suspense fallback={<Loading />}>
            <NotFound />
          </React.Suspense>
        ),
      },
    ],
  },
];