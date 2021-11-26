import React from 'react';
import { AnimateSharedLayout } from 'framer-motion';

import GeneralTemplate from './General';

const HomeLayout: React.FC = (props) => {
  const { children } = props;

  return (
    <AnimateSharedLayout>
      <GeneralTemplate>
        {children}
      </GeneralTemplate>
    </AnimateSharedLayout>
  );
};

export default HomeLayout;
