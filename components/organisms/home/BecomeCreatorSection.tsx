import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
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
    router.push(user.loggedIn ? '/creator-onboarding' : '/sign-up?to=create');
  };

  return (
    <SContainer>
      <SHeadline variant={4}>{t('becomeCreator.title')}</SHeadline>
      <SButton
        view='common'
        onClick={() => {
          Mixpanel.track('Navigation Item Clicked', {
            _button: 'Create now',
          });
          handleClickCreateNow();
        }}
      >
        {tCommon('button.createOnNewnew')}
      </SButton>

      {/* Floating Assets */}
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
        src={assets.floatingAssets.darkTopMiddleSphere}
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

const FloatingImage = styled.img`
  position: absolute;
`;

const SImageLeftTop = styled(FloatingImage)`
  width: 31px;
  height: 31px;
  left: 0;
  top: 0;
  transform: translate(-53%, -33%) rotate(151deg);

  ${({ theme }) => theme.media.tablet} {
    width: 44px;
    height: 44px;
    transform: translate(-49%, -47%) rotate(151deg);
  }

  ${({ theme }) => theme.media.laptop} {
    width: 91px;
    height: 91px;
    left: 19%;
    transform: translateY(-50%) rotate(151deg);
  }
`;

const SImageLeftMiddle = styled(FloatingImage)`
  width: 90px;
  height: 90px;
  left: 0;
  bottom: 0;
  transform: translate(-26%, 34%) rotate(-45deg);

  ${({ theme }) => theme.media.tablet} {
    width: 94px;
    height: 94px;
    left: 6%;
    bottom: 16%;
    transform: rotate(-45deg);
  }

  ${({ theme }) => theme.media.laptop} {
    width: 136px;
    height: 136px;
    top: 3%;
    left: 0;
    transform: translate(30%, 30%) rotate(-45deg);
  }
`;

const SImageLeftBottom = styled(FloatingImage)`
  width: 46px;
  height: 46px;
  right: 0;
  top: 0;
  transform: translate(51%, -21%);

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
    left: 31%;
    bottom: 13.7%;
  }
`;

const SImageRightTop = styled(FloatingImage)`
  transform: rotate(151deg);
  visibility: hidden;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
    width: 36px;
    height: 36px;
    right: 13%;
    top: 40%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 68px;
    height: 68px;
    right: 12%;
    top: 9%;
  }
`;

const SImageRightMiddle = styled(FloatingImage)`
  width: 20px;
  height: 20px;
  right: 12%;
  bottom: 13px;

  ${({ theme }) => theme.media.tablet} {
    width: 94px;
    height: 94px;
    right: 0;
    bottom: 0;
    transform: translate(40%, 24%);
  }

  ${({ theme }) => theme.media.laptop} {
    top: 50%;
    right: 27%;
    bottom: unset;
    width: 50px;
    height: 50px;
    transform: translate(0%, -53%);
  }
`;

const SImageRightBottom = styled(FloatingImage)`
  width: 46px;
  height: 46px;
  bottom: 0;
  right: 0;
  width: 161px;
  height: 161px;
  transform: translate(30%, 40%);
  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    visibility: visible;
  }
`;

export default BecomeCreatorSection;
