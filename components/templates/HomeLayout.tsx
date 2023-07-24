import React from 'react';
import { LayoutGroup } from 'framer-motion';
import styled from 'styled-components';

import GeneralTemplate from './General';

interface IHomeLayout {
  restrictMaxWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const HomeLayout: React.FC<IHomeLayout> = ({
  restrictMaxWidth,
  children,
  className,
}) => (
  <LayoutGroup>
    <SGeneralTemplate restrictMaxWidth={restrictMaxWidth} className={className}>
      {children}
    </SGeneralTemplate>
  </LayoutGroup>
);

const SGeneralTemplate = styled(GeneralTemplate)`
  & > main {
    padding-bottom: 0;
  }
`;

export default HomeLayout;
