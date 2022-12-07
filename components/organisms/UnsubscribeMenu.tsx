import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

// Components
import Text from '../atoms/Text';
import Headline from '../atoms/Headline';
import AnimatedLogoEmailVerification from '../molecules/signup/AnimatedLogoEmailVerification';

const UnsubscribeMenu: React.FunctionComponent = () => {
  const { t } = useTranslation('page-Unsubscribe');

  return (
    <>
      <SUnsubscribeMenu>
        <AnimatedLogoEmailVerification isLoading={false} />
        <SHeadline variant={3}>{t('heading')}</SHeadline>
        <SSubheading variant={2} weight={600}>
          {t('subheading')}
        </SSubheading>
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
    margin-top: calc(50vh - 224px);

    width: 608px;
    height: 448px;

    border-radius: ${({ theme }) => theme.borderRadius.xxxLarge};
    border-style: 1px transparent solid;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    padding: 45px 60px;
  }
`;

const SHeadline = styled(Headline)`
  margin-top: 24px;
  margin-bottom: 8px;

  text-align: center;
  font-size: 22px;
  line-height: 30px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptopL} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SSubheading = styled(Text)`
  margin-top: 8px;

  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
