/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../redux-store/store';

import General from './General';

const MyProfileSettingsLayout: React.FunctionComponent = ({
  children,
}) => {
  const { t } = useTranslation('profile');

  return (
    <SGeneral>
      <SSettingsLayout>
        { children }
      </SSettingsLayout>
    </SGeneral>
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
