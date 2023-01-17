import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../atoms/Text';
import Headline from '../atoms/Headline';
import Button from '../atoms/Button';
import logoAnimation from '../../public/animations/mobile_logo.json';
import Lottie from '../atoms/Lottie';

interface IUnsubscribeMenu {
  onConfirm: () => void;
}

const UnsubscribeMenu: React.FC<IUnsubscribeMenu> = ({ onConfirm }) => {
  const { t } = useTranslation('page-Unsubscribe');

  return (
    <>
      <SUnsubscribeMenu>
        <SAnimationWrapper>
          <Lottie
            width={64}
            height={64}
            options={{
              loop: false,
              autoplay: false,
              animationData: logoAnimation,
            }}
            isStopped
          />
        </SAnimationWrapper>
        <SHeadline variant={3}>{t('heading')}</SHeadline>
        <SSubheading variant={2} weight={600}>
          {t('subheading')}
        </SSubheading>
        <SButton view='primaryGrad' onClick={onConfirm}>
          {t('confirm')}
        </SButton>
      </SUnsubscribeMenu>
    </>
  );
};

export default UnsubscribeMenu;

const SUnsubscribeMenu = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  height: 100%;
  width: 100%;

  text-align: center;

  transition: width height 0.3s ease-in-out;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.laptopL} {
    /* top: calc(50% - 224px); */
    left: calc(50% - 304px);
    margin-top: calc(50vh - 305px);

    width: 608px;
    height: 448px;

    border-radius: ${({ theme }) => theme.borderRadius.xxxLarge};
    border-style: 1px transparent solid;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    padding: 25px 60px 45px 60px;
  }
`;

const SAnimationWrapper = styled.div`
  margin-top: 35px;
  position: relative;
`;

const SHeadline = styled(Headline)`
  margin-top: 24px;
  margin-bottom: 8px;

  text-align: center;
  font-size: 22px;
  line-height: 30px;
  max-width: 350px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptopL} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SSubheading = styled(Text)`
  font-size: 14px;
  line-height: 20px;
  max-width: 250px;
  margin-bottom: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
  ${({ theme }) => theme.media.laptopL} {
    max-width: 50%;
  }
`;

const SButton = styled(Button)`
  flex-shrink: 0;
  width: 140px;
  height: 48px;
`;
