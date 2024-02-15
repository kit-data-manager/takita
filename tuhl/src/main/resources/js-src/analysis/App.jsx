import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from './routes/Layout';
import Analysis, { loader as analysisLoader, action as analyisAction } from './routes/Analysis';
import AuxiliaryText from './routes/AuxiliaryText';
import Conceptualizing from './routes/Conceptualizing';
import Linking from './routes/Linking';
import Mapping from './routes/Mapping';
import Propositions from './routes/Propositions';
import ErrorPage from './routes/ErrorPage';
import { normalizeBasename } from './utils';

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          element: <Analysis />,
          action: analyisAction,
          loader: analysisLoader,
          id: 'analysis',
          path: 'analysis',
          children: [
            {
              path: ':analysisId',
              element: <AuxiliaryText />,
            },
            {
              path: ':analysisId/textvariant',
              element: <AuxiliaryText />,
            },
            {
              path: ':analysisId/propositions',
              element: <Propositions />,
            },
            {
              path: ':analysisId/openmapping',
              element: <Mapping open />,
            },
            {
              path: ':analysisId/completemapping',
              element: <Mapping />,
            },
            {
              path: ':analysisId/linking',
              element: <Linking />,
            },
            {
              path: ':analysisId/conceptualizing',
              element: <Conceptualizing />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: normalizeBasename(window.ANALYSIS_TOOL_BASENAME),
  },
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
