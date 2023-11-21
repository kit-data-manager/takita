import React from 'react';
import { useRouteError } from 'react-router-dom';

import Header from '../components/header';
import { AnalysisSidebar } from '../components/sidebar';
import { ErrorMessages } from '../components/errors';
import { StyledLayout } from './Layout';

import { Message } from '../data/models';
import { normalizeBasename } from '../utils';


function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const messages = [
    new Message({
      text: error.statusText || error.message,
      type: 'regular'
    }),
  ];

  return (
    <StyledLayout className='error-page'>
      <AnalysisSidebar segments={[{label: 'Error', routes: []}]} />
      <div className='analysis-content analysis-error'>
        <Header target={normalizeBasename(window.ANALYSIS_TOOL_BASENAME)} />
        <ErrorMessages messages={messages} className='main-content-area' />
      </div>
    </StyledLayout>
  );
}

export default ErrorPage;
