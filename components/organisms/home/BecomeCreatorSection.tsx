import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

import { Mixpanel } from '../../../utils/mixpanel';
import { useAppSelector } from '../../../redux-store/store';
import assets from '../../../constants/assets';

const BecomeCreatorSection = () => {
  const { t } = useTranslation('page-Home');
  const { t: tCommon } = useTranslation('common');

  const user = useAppSelector((state) => state.user);

  return (
    <SContainer>
      <SHeadline variant={4}>{t('becomeCreator.title')}</SHeadline>
      <Link href={user.loggedIn ? '/creator-onboarding' : '/sign-up?to=create'}>
        <a>
          <SButton
            view='modalSecondary'
            onClick={() => {
              Mixpanel.track('Navigation Item Clicked', {
                _button: 'Create now',
              });
            }}
          >
            {tCommon('button.createOnNewnew')}
          </SButton>
        </a>
      </Link>

      <SImageLeftTop
        src={assets.floatingAssets.topMiddleSphere}
        alt='background'
        draggable={false}
      />
      <SImageLeftMiddle
        src={assets.floatingAssets.leftGlassSphere}
        alt='background'
        draggable={false}
      />
      <SImageLeftBottom
        src={assets.floatingAssets.bottomGlassSphere}
        alt='background'
        draggable={false}
      />

      <SImageRightTop
        src={assets.floatingAssets.topMiddleSphere}
        alt='background'
        draggable={false}
      />
      <SImageRightMiddle
        src={assets.floatingAssets.leftGlassSphere}
        alt='background'
        draggable={false}
      />
      <SImageRightBottom
        src={assets.floatingAssets.rightGlassSphere}
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
  margin: 0 -16px;

  overflow: hidden;
  margin-top: 20px;

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

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 34px;
    margin-top: 11px;
    padding: 60px 0;
    margin: 0 -96px;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 10px;
  z-index: 1;
  font-size: 20px;
  line-height: 28px;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 24px;
  }
`;

const SButton = styled(Button)`
  padding: 12px 30px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.darkGray};

  font-size: 16px;
  line-height: 24px;
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

  ${({ theme }) => theme.media.laptop} {
    width: 91px;
    height: 91px;
  }
`;

const SImageLeftMiddle = styled(FloatingImage)`
  width: 82px;
  height: 90px;
  left: 0;
  bottom: 0;
  transform: translate(-26%, 34%) rotate(-45deg);

  ${({ theme }) => theme.media.laptop} {
    width: 136px;
    height: 136px;
    top: 3%;
    transform: translate(30%, 30%) rotate(-45deg);
  }
`;

const SImageLeftBottom = styled(FloatingImage)`
  width: 46px;
  height: 46px;
  right: 0;
  top: 0;
  transform: translate(51%, -21%);

  ${({ theme }) => theme.media.laptop} {
    width: 38px;
    height: 38px;
    left: 31%;
    bottom: 13.7%;
    transform: none;
  }
`;

const SImageRightTop = styled(FloatingImage)`
  width: 68px;
  height: 68px;
  right: 12%;
  top: 9%;
  transform: rotate(151deg);
  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    visibility: visible;
  }
`;

const SImageRightMiddle = styled(FloatingImage)`
  width: 20px;
  height: 20px;
  right: 12%;
  bottom: 13px;

  ${({ theme }) => theme.media.laptop} {
    top: 50%;
    width: 50px;
    height: 50px;
  }
`;

const SImageRightBottom = styled(FloatingImage)`
  width: 46px;
  height: 46px;
  bottom: 0;
  width: 161px;
  height: 161px;
  transform: translate(30%, 40%);
  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    visibility: visible;
  }
`;

export default BecomeCreatorSection;
