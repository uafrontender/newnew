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
        src={assets.floatingAssets.rightGlassSphere}
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
  padding: 60px 0;
  margin: 0 -96px;
  overflow: hidden;
  margin-bottom: 34px;
  margin-top: 11px;

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
`;

const SHeadline = styled(Headline)`
  margin-bottom: 24px;
  z-index: 1;
`;

const SButton = styled(Button)`
  padding: 12px 30px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.darkGray};
`;

const SImageLeftTop = styled.img`
  position: absolute;
  width: 91px;
  height: 91px;
  left: 19%;
  top: 0;
  transform: translateY(-50%) rotate(151deg);
`;

const SImageLeftMiddle = styled.img`
  position: absolute;
  width: 136px;
  height: 136px;
  left: 0;
  top: 3%;
  transform: translate(30%, 30%) rotate(-45deg);
`;

const SImageLeftBottom = styled.img`
  position: absolute;
  width: 38px;
  height: 38px;
  left: 31%;
  bottom: 13.7%;
`;

const SImageRightTop = styled.img`
  position: absolute;
  width: 68px;
  height: 68px;
  right: 12%;
  top: 9%;
  transform: rotate(151deg);
`;

const SImageRightMiddle = styled.img`
  position: absolute;
  width: 50px;
  height: 50px;
  right: 27%;
  top: 50%;
  transform: translateY(-50%);
`;

const SImageRightBottom = styled.img`
  position: absolute;
  width: 161px;
  height: 161px;
  right: 0;
  bottom: 0;
  transform: translate(30%, 40%);
`;

export default BecomeCreatorSection;
