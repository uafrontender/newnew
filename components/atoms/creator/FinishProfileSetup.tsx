/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';
import Button from '../Button';
import Text from '../Text';
import money from '../../../public/images/svg/icons/filled/Money.svg';
import InlineSVG from '../InlineSVG';
import { useAppSelector } from '../../../redux-store/store';
import { Mixpanel } from '../../../utils/mixpanel';

export const FinishProfileSetup = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);

  const [isAccountDetailsCompleted, setAccountDetailsCompleted] =
    useState(false);
  const [isCreatorConnectedToStripe, setIisCreatorConnectedToStripe] =
    useState(false);

  useEffect(() => {
    if (user.creatorData?.isLoaded) {
      user.userData?.bio && user.userData?.bio.length > 0
        ? setAccountDetailsCompleted(true)
        : setAccountDetailsCompleted(false);
    }
  }, [user.creatorData?.isLoaded, user.userData?.bio]);

  useEffect(() => {
    if (user.creatorData?.isLoaded) {
      user.creatorData?.options?.isCreatorConnectedToStripe
        ? setIisCreatorConnectedToStripe(true)
        : setIisCreatorConnectedToStripe(false);
    }
  }, [
    user.creatorData?.options?.isCreatorConnectedToStripe,
    user.creatorData?.isLoaded,
  ]);

  const getString = useCallback(() => {
    if (!isAccountDetailsCompleted && !isCreatorConnectedToStripe)
      return t('dashboard.earnings.toDosIssue.text');

    if (!isCreatorConnectedToStripe)
      return t('dashboard.earnings.toDosIssue.textBank');

    if (!isAccountDetailsCompleted)
      return t('dashboard.earnings.toDosIssue.textBio');

    return '';
  }, [isAccountDetailsCompleted, isCreatorConnectedToStripe, t]);

  return (
    <SCashOutContainer>
      <SCashOutTopBlock>
        <SImageWrapper>
          <InlineSVG
            svg={money}
            fill={theme.colors.white}
            width='48px'
            height='48px'
          />
        </SImageWrapper>
        <SDescriptionWrapper>
          <SDescription variant={2} weight={600}>
            {getString()}
          </SDescription>
        </SDescriptionWrapper>
      </SCashOutTopBlock>
      <Link
        href={
          !isAccountDetailsCompleted
            ? '/creator-onboarding-about'
            : !isCreatorConnectedToStripe
            ? '/creator/get-paid'
            : ''
        }
      >
        <a>
          <SButton
            view='common'
            onClick={() => {
              Mixpanel.track('Navigation Item Clicked', {
                _button: 'Add',
                _stage: 'Dashboard',
                _target: !isAccountDetailsCompleted
                  ? '/creator-onboarding-about'
                  : !isCreatorConnectedToStripe
                  ? '/creator/get-paid'
                  : '',
              });
            }}
          >
            {t('dashboard.earnings.toDosIssue.button')}
          </SButton>
        </a>
      </Link>
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
  padding: 16px 20px;
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: unset;
    margin-left: 16px;
  }
`;
