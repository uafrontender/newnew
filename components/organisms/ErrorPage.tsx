import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled, { keyframes, useTheme } from 'styled-components';
import { useTranslation, withTranslation } from 'next-i18next';

import Button from '../atoms/Button';
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';

import assets from '../../constants/assets';

const ErrorPage = () => {
  const { t } = useTranslation('common');

  return (
    <SContainer>
      <SHeadline variant={1}>{t('oops')}</SHeadline>
      <SText variant='subtitle'>{t('somethingWentWrong')}</SText>
      <Link href='/'>
        <SButton view='primaryGrad'>{t('goHome')}</SButton>
      </Link>
      <FloatingAssets />
    </SContainer>
  );
};

const FloatingAssets = () => {
  const theme = useTheme();

  return (
    <>
      <SImageLeftFirst>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkBottomGlassSphere
              : assets.floatingAssets.lightBottomGlassSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageLeftFirst>
      <SImageLeftSecond>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkBottomGlassSphere
              : assets.floatingAssets.lightBottomGlassSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageLeftSecond>
      <SImageLeftThird>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkTopMiddleSphere
              : assets.floatingAssets.lightTopMiddleSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageLeftThird>
      <SImageLeftFourth>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkLeftGlassSphere
              : assets.floatingAssets.lightLeftGlassSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageLeftFourth>
      <SImageLeftFifth>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkTopMiddleSphere
              : assets.floatingAssets.lightTopMiddleSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageLeftFifth>

      <SImageRightFirst>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkTopMiddleSphere
              : assets.floatingAssets.lightTopMiddleSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageRightFirst>
      <SImageRightSecond>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkLeftGlassSphere
              : assets.floatingAssets.lightLeftGlassSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageRightSecond>
      <SImageRightThird>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkBottomGlassSphere
              : assets.floatingAssets.lightBottomGlassSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageRightThird>
      <SImageRightFourth>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkTopMiddleSphere
              : assets.floatingAssets.lightTopMiddleSphere
          }
          alt='background'
          draggable={false}
          layout='fill'
        />
      </SImageRightFourth>
    </>
  );
};

export default withTranslation(['common'])(ErrorPage);

const SContainer = styled.div`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 16px;
  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 24px;

    font-size: 80px;
    line-height: 92px;
  }
`;

const SText = styled(Text)`
  margin-bottom: 24px;
  z-index: 1;

  font-size: 16px;
  line-height: 24px;
  font-weight: 500;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 40px;

    font-size: 20px;
    line-height: 28px;
  }
`;

const SButton = styled(Button)`
  z-index: 1;
`;

const SImage = styled.div`
  position: absolute;
  transform: translateY(-200px);
`;

const FallingAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-300px);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(100vh);
  }
`;

const SImageLeftFirst = styled(SImage)`
  top: 0;
  left: 16px;

  width: 52px;
  height: 52px;

  animation: ${FallingAnimation} 6s linear 0.5s infinite;

  ${({ theme }) => theme.media.tablet} {
    left: 26%;

    width: 59px;
    height: 59px;
  }

  ${({ theme }) => theme.media.laptop} {
    left: 38.5%;

    width: 100px;
    height: 100px;
  }
`;

const SImageLeftSecond = styled(SImage)`
  visibility: hidden;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;

    top: 0;
    left: 2.4%;

    width: 35px;
    height: 35px;

    animation: ${FallingAnimation} 6s linear 1.2s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    left: 6.67%;

    width: 60px;
    height: 60px;
  }
`;

const SImageLeftThird = styled(SImage)`
  top: 0;
  left: 22px;

  width: 30px;
  height: 30px;

  animation: ${FallingAnimation} 6s linear 1.2s infinite;

  ${({ theme }) => theme.media.tablet} {
    left: 30%;

    width: 27px;
    height: 27px;

    animation: ${FallingAnimation} 6s linear 2.4s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    left: 31.4%;

    width: 47px;
    height: 47px;
  }
`;

const SImageLeftFourth = styled(SImage)`
  visibility: hidden;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;

    top: 0;
    left: 6.5%;

    width: 83px;
    height: 81px;

    animation: ${FallingAnimation} 6s linear 3.6s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    left: 5.6%;

    width: 142px;
    height: 138px;
  }
`;

const SImageLeftFifth = styled(SImage)`
  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    visibility: visible;

    top: 0;
    left: 28%;

    width: 98px;
    height: 98px;

    animation: ${FallingAnimation} 6s linear 4.8s infinite;
  }
`;

const SImageRightFirst = styled(SImage)`
  visibility: hidden;

  ${({ theme }) => theme.media.tablet} {
    top: 0;
    right: 17%;
    visibility: visible;

    width: 76px;
    height: 76px;

    animation: ${FallingAnimation} 6s linear 1.4s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 15.5%;

    width: 132px;
    height: 132px;
  }
`;

const SImageRightSecond = styled(SImage)`
  top: 0;
  right: 0;

  width: 58px;
  height: 59px;

  animation: ${FallingAnimation} 6s linear 1.4s infinite;

  ${({ theme }) => theme.media.tablet} {
    right: 8px;

    width: 54px;
    height: 54px;

    animation: ${FallingAnimation} 6s linear 2.8s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 5.5%;

    width: 92px;
    height: 92px;
  }
`;
const SImageRightThird = styled(SImage)`
  top: 0;
  right: 16px;

  width: 54px;
  height: 54px;

  animation: ${FallingAnimation} 6s linear 2.8s infinite;

  ${({ theme }) => theme.media.tablet} {
    right: 27%;

    width: 75px;
    height: 75px;

    animation: ${FallingAnimation} 6s linear 4.2s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 30%;

    width: 127px;
    height: 127px;
  }
`;

const SImageRightFourth = styled(SImage)`
  top: 0;
  right: 45%;

  width: 62px;
  height: 62px;

  animation: ${FallingAnimation} 6s linear 4.2s infinite;

  ${({ theme }) => theme.media.tablet} {
    right: 0;

    width: 102px;
    height: 102px;

    animation: ${FallingAnimation} 6s linear 5.6s infinite;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 3.7%;

    width: 174px;
    height: 171px;
  }
`;
