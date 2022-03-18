import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import Button from '../Button';
import Text from '../Text';

import moneyIcon from '../../../public/images/dashboard/money.png';

import { SCROLL_TO_TOP } from '../../../constants/timings';

export const FinishProfileSetup = () => {
  const { t } = useTranslation('creator');

  const handleClick = () => {
    scroller.scrollTo('top-reload', {
      smooth: 'easeInOutQuart',
      duration: SCROLL_TO_TOP,
      containerId: 'generalScrollContainer',
    });
  };

  return (
    <SCashOutContainer>
      <SCashOutTopBlock>
        <SImageWrapper>
          <Image src={moneyIcon} alt={t('dashboard.earnings.todosIssue.text')} width={48} height={48} />
        </SImageWrapper>
        <SDescriptionWrapper>
          <SDescription variant={2} weight={600}>
            {t('dashboard.earnings.todosIssue.text')}
          </SDescription>
        </SDescriptionWrapper>
      </SCashOutTopBlock>
      <SButton view="primaryGrad" onClick={handleClick}>
        {t('dashboard.earnings.todosIssue.btnText')}
      </SButton>
    </SCashOutContainer>
  );
};

export default FinishProfileSetup;

const SCashOutContainer = styled.div`
  padding: 24px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.accent.pink};
  border-radius: 16px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SImageWrapper = styled.div`
  margin-right: 12px;
  flex-shrink: 0;
`;

const SCashOutTopBlock = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SDescriptionWrapper = styled.div`
  p {
    display: inline;
  }
`;

const SDescription = styled(Text)`
  color: white;
`;

const SButton = styled(Button)`
  width: auto;
  display: block;
  flex-shrink: 0;
  color: #2C2C33;
  padding: 16px 20px;
  margin-top: 16px;
  background: ${(props) => props.theme.colors.white};

  &:after {
    display: none;
  }

  &:focus:enabled,
  &:hover:enabled {
    background: ${(props) => props.theme.colors.white};
  }

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: unset;
    margin-left: 16px;
  }
`;
