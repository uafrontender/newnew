import React from 'react';
import styled from 'styled-components';

import General from './General';
import ErrorBoundary from '../organisms/ErrorBoundary';

const MyProfileSettingsLayout: React.FunctionComponent = (props) => {
  const { children } = props;

  return (
    <ErrorBoundary>
      <SGeneral>
        <SSettingsLayout>
          {children}
        </SSettingsLayout>
      </SGeneral>
    </ErrorBoundary>
  );
};

export default MyProfileSettingsLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }

  @media (max-width: 768px) {
    main {
      div:first-child {
        padding-left: 0;
        padding-right: 0;

        div:first-child {
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }
`;

const SSettingsLayout = styled.div`
  margin-top: -28px;
  margin-bottom: 24px;
`;
