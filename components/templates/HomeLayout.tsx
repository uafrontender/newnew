/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { LayoutGroup } from 'framer-motion';

import ErrorBoundary from '../organisms/ErrorBoundary';
import GeneralTemplate from './General';

const HomeLayout: React.FC = (props) => {
  const { children } = props;

  return (
    <ErrorBoundary>
      <LayoutGroup>
        <GeneralTemplate
        // restrictMaxWidth={true}
        >
          {children}
        </GeneralTemplate>
      </LayoutGroup>
    </ErrorBoundary>
  );
};

export default HomeLayout;
