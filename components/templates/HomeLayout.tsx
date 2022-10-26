/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { LayoutGroup } from 'framer-motion';
import styled from 'styled-components';

import GeneralTemplate from './General';

interface IHomeLayout {
  children: React.ReactNode;
}

const HomeLayout: React.FC<IHomeLayout> = (props) => {
  const { children } = props;

  // TODO: fix Error boundary issue (not on top)
  return (
    <LayoutGroup>
      <SGeneralTemplate

      // restrictMaxWidth={true}
      >
        {children}
      </SGeneralTemplate>
    </LayoutGroup>
  );
};

const SGeneralTemplate = styled(GeneralTemplate)`
  & > main {
    padding-bottom: 0;
  }
`;

export default HomeLayout;
