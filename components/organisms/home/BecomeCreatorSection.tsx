import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';

import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

import { Mixpanel } from '../../../utils/mixpanel';
import { useAppSelector } from '../../../redux-store/store';
import assets from '../../../constants/assets';

const BecomeCreatorSection = () => {
  const { t } = useTranslation('page-Home');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();

  const user = useAppSelector((state) => state.user);

  const handleClickCreateNow = () => {
    Mixpanel.track('Navigation Item Clicked', {
      _button: 'Create now',
    });
    router.push(user.loggedIn ? '/creator-onboarding' : '/sign-up?to=create');
  };

  return (
    <SContainer>
      <SHeadline variant={4}>{t('becomeCreator.title')}</SHeadline>
      <SButton view='common' onClick={handleClickCreateNow}>
        {tCommon('button.createOnNewnew')}
      </SButton>

      <FloatingAssets />
    </SContainer>
  );
};

const SContainer = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: calc(100% + 96 * 2);
  padding: 22px 0;
  margin: 20px -16px 0;

  overflow: hidden;
  background-color: ${({ theme }) => theme.colorsThemed.accent.blue};

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        315deg,
        rgba(29, 180, 255, 0.85) 0%,
        rgba(29, 180, 255, 0) 50%
      ),
      #1d6aff;
  }

  ${({ theme }) => theme.media.tablet} {
    margin: 55px -32px 0;
    padding: 35px 0;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 60px 0;
    margin: 15px -96px 0;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 10px;
  z-index: 1;
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 24px;
    font-size: 32px;
    line-height: 40px;
  }
`;

const SButton = styled(Button)`
  padding: 12px 24px;

  font-size: 16px;
  line-height: 24px;
  text-transform: capitalize;
`;

const FloatingAssets = () => (
  <>
    <SImageLeftTop
      src={assets.floatingAssets.darkTopMiddleSphere}
      alt='background'
      draggable={false}
    />
    <SImageLeftMiddle
      src={assets.floatingAssets.darkLeftGlassSphere}
      alt='background'
      draggable={false}
    />
    <SImageLeftBottom
      src={assets.floatingAssets.darkBottomGlassSphere}
      alt='background'
      draggable={false}
    />

    <SImageRightTop
      src={assets.floatingAssets.lightTopMiddleSphere}
      alt='background'
      draggable={false}
    />
    <SImageRightMiddle
      src={assets.floatingAssets.darkLeftGlassSphere}
      alt='background'
      draggable={false}
    />
    <SImageRightBottom
      src={assets.floatingAssets.darkRightGlassSphere}
      alt='background'
      draggable={false}
    />
  </>
);

const FloatingImage = styled.img`
  position: absolute;
`;

const leftTopFloating = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(151deg); }
  100% { transform: translateX(4px) translateY(-6px) rotate(130deg); }
`;

const SImageLeftTop = styled(FloatingImage)`
  width: 31px;
  height: 31px;

  left: calc(-31px * 0.53);
  top: calc(-31px * 0.33);
  animation: ${leftTopFloating} infinite alternate linear 4.2s;

  ${({ theme }) => theme.media.tablet} {
    width: 44px;
    height: 44px;
    left: calc(-44px * 0.49);
    top: calc(-44px * 0.47);
  }

  ${({ theme }) => theme.media.laptop} {
    width: 91px;
    height: 91px;
    left: 19%;
    top: calc(-91px * 0.5);
    transform: rotate(151deg);
  }
`;

const leftMiddleFloating = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(0); }
  100% { transform: translateX(4px) translateY(8px) rotate(-5deg); }
`;

const SImageLeftMiddle = styled(FloatingImage)`
  width: 90px;
  height: 90px;
  left: calc(-90px * 0.26);
  bottom: calc(-90px * 0.34);
  transform: rotate(-45deg);
  animation: ${leftMiddleFloating} infinite alternate linear 5s 0.5s;

  ${({ theme }) => theme.media.tablet} {
    width: 94px;
    height: 94px;
    left: 7%;
    bottom: 16%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 136px;
    height: 136px;
    top: 21%;
    left: 2.5%;
    bottom: unset;
  }
`;

const leftBottomFloating = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-10px) rotate(-45deg); }
`;

const SImageLeftBottom = styled(FloatingImage)`
  width: 46px;
  height: 46px;
  right: calc(-46px * 0.51);
  top: calc(-46px * 0.21);
  animation: ${leftBottomFloating} infinite alternate linear 4.2s;

  ${({ theme }) => theme.media.tablet} {
    width: 25px;
    height: 25px;
    left: 31%;
    bottom: 5.7%;
    top: unset;
    right: unset;
    transform: none;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 38px;
    height: 38px;
    left: 30.7%;
    bottom: 13.7%;
  }
`;

const rightTopFloating = keyframes`
   0% { transform: translateX(0) translateY(0) rotate(0); }
  100% { transform: translateX(4px) translateY(-6px) rotate(30deg); }
`;

const SImageRightTop = styled(FloatingImage)`
  visibility: hidden;
  animation: ${rightTopFloating} infinite alternate linear 4s 1.5s;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
    width: 36px;
    height: 36px;
    right: 12.5%;
    top: 40%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 68px;
    height: 68px;
    right: 12%;
    top: 9%;
  }
`;

const rightMiddleFloating = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(0); }
  100% { transform: translateX(-6px) translateY(8px) rotate(-15deg); }
`;

const SImageRightMiddle = styled(FloatingImage)`
  width: 20px;
  height: 20px;
  right: 12%;
  bottom: 13px;
  animation: ${rightMiddleFloating} infinite alternate linear 4.5s 1s;

  ${({ theme }) => theme.media.tablet} {
    width: 94px;
    height: 94px;
    right: calc(-94px * 0.36);
    bottom: calc(-94px * 0.24);
  }

  ${({ theme }) => theme.media.laptop} {
    top: 40%;
    right: 27%;
    bottom: unset;
    width: 50px;
    height: 50px;
  }
`;

const rightBottomFloating = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(0); }
  100% { transform: translateX(6px) translateY(6px) rotate(10deg); }
`;

const SImageRightBottom = styled(FloatingImage)`
  width: 161px;
  height: 161px;
  bottom: calc(-161px * 0.4);
  right: calc(-161px * 0.3);
  visibility: hidden;
  animation: ${rightBottomFloating} infinite alternate linear 6s;

  ${({ theme }) => theme.media.laptop} {
    visibility: visible;
  }
`;

export default BecomeCreatorSection;
