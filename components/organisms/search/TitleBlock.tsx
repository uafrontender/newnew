import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Filters from '../Filters';
import Headline from '../../atoms/Headline';
import InlineSVG from '../../atoms/InlineSVG';

import arrowDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';

export const TitleBlock = () => {
  const [active, setActive] = useState(false);
  const { t } = useTranslation('home');
  const theme = useTheme();
  const router = useRouter();
  const category = router.query.category?.toString() ?? '';

  const handleSelectToggle = () => {
    setActive(!active);
  };

  return (
    <SWrapper>
      <STitleWrapper onClick={handleSelectToggle}>
        <Headline variant={4}>
          {t(`${category}-block-title`)}
        </Headline>
        <SInlineSVG
          svg={arrowDown}
          fill={theme.colorsThemed.text.primary}
          width="32px"
          height="32px"
          active={active}
        />
      </STitleWrapper>
      <Filters />
    </SWrapper>
  );
};

export default TitleBlock;

const SWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const STitleWrapper = styled.div`
  cursor: pointer;
  display: flex;
  position: relative;
  align-items: center;
  flex-direction: row;
`;

interface ISInlineSVG {
  active: boolean;
}

const SInlineSVG = styled(InlineSVG)<ISInlineSVG>`
  z-index: 1;
  transform: rotate(${(props) => (props.active ? '180deg' : '0deg')});
  transition: all ease 0.5s;
  margin-left: 4px;
`;
