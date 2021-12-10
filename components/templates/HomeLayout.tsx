import React from 'react';
import { AnimateSharedLayout } from 'framer-motion';

import ErrorBoundary from '../organisms/ErrorBoundary';
import GeneralTemplate from './General';

const HomeLayout: React.FC = (props) => {
  const { children } = props;

  return (
    <ErrorBoundary>
      <AnimateSharedLayout>
        <GeneralTemplate>
          {children}
        </GeneralTemplate>
      </AnimateSharedLayout>
    </ErrorBoundary>
  );
};

export default HomeLayout;
