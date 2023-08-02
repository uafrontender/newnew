import React from 'react';
import { LayoutGroup } from 'framer-motion';
import styled, { css } from 'styled-components';

import GeneralTemplate from './General';

interface IHomeLayout {
  restrictMaxWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  noPaddingBottom?: boolean;
}

const HomeLayout: React.FC<IHomeLayout> = ({
  restrictMaxWidth,
  children,
  className,
  noPaddingBottom,
}) => (
  <LayoutGroup>
    <SGeneralTemplate
      restrictMaxWidth={restrictMaxWidth}
      className={className}
      noPaddingBottom={noPaddingBottom}
    >
      {children}
    </SGeneralTemplate>
  </LayoutGroup>
);

const SGeneralTemplate = styled(GeneralTemplate)<{
  noPaddingBottom?: boolean;
}>`
  ${({ noPaddingBottom }) =>
    noPaddingBottom
      ? css`
          main {
            padding-bottom: 0;
          }
        `
      : null}
`;

export default HomeLayout;
