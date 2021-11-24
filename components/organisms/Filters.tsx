import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import filterIcon from '../../public/images/svg/icons/outlined/Sort.svg';

export const Filters = () => {
  const { t } = useTranslation('home');
  const theme = useTheme();

  const handleFiltersClick = () => {

  };

  return (
    <SWrapper>
      <SButton
        view="secondary"
        onClick={handleFiltersClick}
      >
        <SButtonContent>
          {t('filter-title')}
          <SInlineSVG
            svg={filterIcon}
            fill={theme.colorsThemed.text.primary}
            width="24px"
            height="24px"
          />
        </SButtonContent>
      </SButton>
    </SWrapper>
  );
};

export default Filters;

const SWrapper = styled.div`

`;

const SButton = styled(Button)`
  padding: 8px 16px;
`;

const SButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SInlineSVG = styled(InlineSVG)`
  margin-left: 8px;
`;
