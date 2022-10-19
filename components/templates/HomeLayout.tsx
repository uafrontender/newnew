/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { LayoutGroup } from 'framer-motion';

import GeneralTemplate from './General';

interface IHomeLayout {
  children: React.ReactNode;
}

const HomeLayout: React.FC<IHomeLayout> = (props) => {
  const { children } = props;

  // TODO: fix Error boundary issue (not on top)
  return (
    <LayoutGroup>
      <GeneralTemplate
      // restrictMaxWidth={true}
      >
        {children}
      </GeneralTemplate>
    </LayoutGroup>
  );
};

export default HomeLayout;
