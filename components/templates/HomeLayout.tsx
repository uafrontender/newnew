/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { LayoutGroup } from 'framer-motion';

import GeneralTemplate from './General';
import BaseLayout from './BaseLayout';

interface IHomeLayout {
  children: React.ReactNode;
}

const HomeLayout: React.FC<IHomeLayout> = (props) => {
  const { children } = props;

  return (
    <BaseLayout>
      <LayoutGroup>
        <GeneralTemplate
        // restrictMaxWidth={true}
        >
          {children}
        </GeneralTemplate>
      </LayoutGroup>
    </BaseLayout>
  );
};

export default HomeLayout;
