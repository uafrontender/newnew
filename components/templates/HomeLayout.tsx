import React from 'react';
import { LayoutGroup } from 'framer-motion';

import ErrorBoundary from '../organisms/ErrorBoundary';
import GeneralTemplate from './General';

interface IReactFunction {
  children: React.ReactNode;
}
const HomeLayout: React.FC<IReactFunction> = ({ children }) => (
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
export default HomeLayout;
