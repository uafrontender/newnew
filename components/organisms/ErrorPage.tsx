import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useTranslation, withTranslation } from 'next-i18next';

import assets from '../../constants/assets';

const ErrorPage = () => {
  const { t } = useTranslation('common');

  return (
    <SContainer>
      <GlobalStyles />
      <STitle>{t('oops')}</STitle>
      <SText>{t('somethingWentWrong')}</SText>
      <Link href='/'>
        <SButton>
          <SButtonText>{t('goHome')}</SButtonText>
        </SButton>
      </Link>
      <FloatingAssets />
    </SContainer>
  );
};

const FloatingAssets = () => (
  <>
    <SImageLeftFirst>
      <Image
        src={assets.floatingAssets.darkBottomGlassSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageLeftFirst>
    <SImageLeftSecond>
      <Image
        src={assets.floatingAssets.darkBottomGlassSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageLeftSecond>
    <SImageLeftThird>
      <Image
        src={assets.floatingAssets.darkTopMiddleSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageLeftThird>
    <SImageLeftFourth>
      <Image
        src={assets.floatingAssets.darkLeftGlassSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageLeftFourth>
    <SImageLeftFifth>
      <Image
        src={assets.floatingAssets.darkTopMiddleSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageLeftFifth>

    <SImageRightFirst>
      <Image
        src={assets.floatingAssets.darkTopMiddleSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageRightFirst>
    <SImageRightSecond>
      <Image
        src={assets.floatingAssets.darkLeftGlassSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageRightSecond>
    <SImageRightThird>
      <Image
        src={assets.floatingAssets.darkBottomGlassSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageRightThird>
    <SImageRightFourth>
      <Image
        src={assets.floatingAssets.darkTopMiddleSphere}
        alt='background'
        draggable={false}
        layout='fill'
      />
    </SImageRightFourth>
  </>
);

export default withTranslation(['common'])(ErrorPage);

const GlobalStyles = createGlobalStyle`
 *, *:before, *:after {
    margin: 0;
    padding: 0;

    font-family: Gilroy, Arial, Helvetica, sans-serif;

    font-smooth: always;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: #0B0A13;
  }
`;

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

const STitle = styled.h1`
  margin-bottom: 16px;
  z-index: 1;

  color: #ffffff;
  font-weight: bold;

  font-size: 32px;
  line-height: 40px;

  @media (min-width: 768px) {
    font-size: 40px;
    line-height: 48px;
  }

  @media (min-width: 1024px) {
    margin-bottom: 24px;

    font-size: 80px;
    line-height: 92px;
  }
`;

const SText = styled.p`
  margin-bottom: 24px;
  z-index: 1;

  font-size: 16px;
  line-height: 24px;
  font-weight: 500;

  color: #9ba2b1;

  @media (min-width: 1024px) {
    margin-bottom: 40px;

    font-size: 20px;
    line-height: 28px;
  }
`;

// Duplicate button styles because theme doesn't available in error boundary
const SButton = styled.button`
  position: relative;
  overflow: hidden;

  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 12px 24px;

  white-space: nowrap;
  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  @media (min-width: 768px) {
    font-size: 14px;
  }

  border: transparent;
  border-radius: 16px;

  color: #ffffff;
  background: linear-gradient(
      315deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    #1d6aff;

  cursor: pointer;
  transition: 0.2s linear;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  // for gradient button background animation on hover

  &:after {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: '';
    opacity: 0;
    z-index: 1;
    position: absolute;
    background: linear-gradient(
        140deg,
        rgba(29, 180, 255, 0.85) 0%,
        rgba(29, 180, 255, 0) 50%
      ),
      #1d6aff;
    transition: opacity 0.2s linear;
  }

  &:active:enabled {
    outline: none;
    background: linear-gradient(
        140deg,
        rgba(29, 180, 255, 0.85) 0%,
        rgba(29, 180, 255, 0) 50%
      ),
      #1d6aff;
  }

  &:focus:enabled {
    outline: none;

    :after {
      opacity: 1;
    }
  }

  &:hover:enabled {
    outline: none;
  }

  @media (hover: hover) {
    &:hover:enabled {
      :after {
        opacity: 1;
      }
    }
  }

  &:disabled {
    cursor: default;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: rgba(11, 10, 19, 0.5);
    }
  }

  span {
    z-index: 3;
    font-weight: 700;
  }
`;

const SButtonText = styled.span`
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

  @media (min-width: 768px) {
    left: 26%;

    width: 59px;
    height: 59px;
  }

  @media (min-width: 1024px) {
    left: 38.5%;

    width: 100px;
    height: 100px;
  }
`;

const SImageLeftSecond = styled(SImage)`
  visibility: hidden;

  @media (min-width: 768px) {
    visibility: visible;

    top: 0;
    left: 2.4%;

    width: 35px;
    height: 35px;

    animation: ${FallingAnimation} 6s linear 1.2s infinite;
  }

  @media (min-width: 1024px) {
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

  @media (min-width: 768px) {
    left: 30%;

    width: 27px;
    height: 27px;

    animation: ${FallingAnimation} 6s linear 2.4s infinite;
  }

  @media (min-width: 1024px) {
    left: 31.4%;

    width: 47px;
    height: 47px;
  }
`;

const SImageLeftFourth = styled(SImage)`
  visibility: hidden;

  @media (min-width: 768px) {
    visibility: visible;

    top: 0;
    left: 6.5%;

    width: 83px;
    height: 81px;

    animation: ${FallingAnimation} 6s linear 3.6s infinite;
  }

  @media (min-width: 1024px) {
    left: 5.6%;

    width: 142px;
    height: 138px;
  }
`;

const SImageLeftFifth = styled(SImage)`
  visibility: hidden;

  @media (min-width: 1024px) {
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

  @media (min-width: 768px) {
    top: 0;
    right: 17%;
    visibility: visible;

    width: 76px;
    height: 76px;

    animation: ${FallingAnimation} 6s linear 1.4s infinite;
  }

  @media (min-width: 1024px) {
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

  @media (min-width: 768px) {
    right: 8px;

    width: 54px;
    height: 54px;

    animation: ${FallingAnimation} 6s linear 2.8s infinite;
  }

  @media (min-width: 1024px) {
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

  @media (min-width: 768px) {
    right: 27%;

    width: 75px;
    height: 75px;

    animation: ${FallingAnimation} 6s linear 4.2s infinite;
  }

  @media (min-width: 1024px) {
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

  @media (min-width: 768px) {
    right: 0;

    width: 102px;
    height: 102px;

    animation: ${FallingAnimation} 6s linear 5.6s infinite;
  }

  @media (min-width: 1024px) {
    right: 3.7%;

    width: 174px;
    height: 171px;
  }
`;
