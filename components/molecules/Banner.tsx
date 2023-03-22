import React from 'react';
import styled, { css, useTheme } from 'styled-components';

import Text from '../atoms/Text';
import InlineSVG from '../atoms/InlineSVG';
import AnimatedPresence from '../atoms/AnimatedPresence';

import { setBanner } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import arrowIcon from '../../public/images/svg/icons/outlined/ArrowRight.svg';
import { useAppState } from '../../contexts/appStateContext';

interface IBanner {}

const Banner: React.FC<IBanner> = React.memo(() => {
  const { banner } = useAppSelector((state) => state.ui);
  const { resizeMode } = useAppState();

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const onClose = () => {
    dispatch(
      setBanner({
        ...banner,
        show: false,
      })
    );
  };
  const handleBannerClick = () => {};

  return (
    <SContainer
      id='header-banner'
      active={banner?.show}
      onClick={handleBannerClick}
    >
      <SText variant={3} weight={600}>
        {banner?.title}
      </SText>
      {!isMobile && (
        <SIconHolder>
          <AnimatedPresence animation='t-10' animateWhenInView={false}>
            <InlineSVG
              svg={arrowIcon}
              fill={theme.colors.white}
              width='24px'
              height='24px'
            />
          </AnimatedPresence>
        </SIconHolder>
      )}
      <SCloseIconHolder>
        <InlineSVG
          clickable
          scaleOnClick
          svg={closeIcon}
          fill={theme.colors.white}
          width='24px'
          height='24px'
          onClick={onClose}
        />
      </SCloseIconHolder>
    </SContainer>
  );
});

export default Banner;

interface ISContainer {
  active: boolean;
}

const SContainer = styled.div<ISContainer>`
  height: 40px;
  cursor: pointer;
  display: flex;
  overflow: hidden;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.accent.pink};
  align-items: center;
  justify-content: center;

  ${({ active }) =>
    !active
      ? css`
          background: none;
        `
      : ''}

  &::after {
    top: 0;
    left: 0;
    width: 100%;
    right: 0;
    bottom: 0;
    z-index: 1;
    position: absolute;
    transform: translateX(-100%);
    animation: shimmer 5s ease infinite;
    background: ${(props) => props.theme.gradients.bannerPink};
    content: '';

    ${({ active }) =>
      !active
        ? css`
            background: none;
          `
        : ''}
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

const SText = styled(Text)`
  color: ${(props) => props.theme.colors.white};
  z-index: 2;
  overflow: hidden;
  position: relative;
  max-width: 70%;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SIconHolder = styled.div`
  z-index: 2;
  margin-left: 8px;
`;

const SCloseIconHolder = styled.div`
  top: 50%;
  right: 16px;
  z-index: 2;
  position: absolute;
  transform: translateY(-50%);
`;
