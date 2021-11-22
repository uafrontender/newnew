import React from 'react';
import styled, { useTheme } from 'styled-components';

import Text from '../atoms/Text';
import InlineSVG from '../atoms/InlineSVG';

import { setBanner } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';

interface IBanner {
}

export const Banner: React.FC<IBanner> = () => {
  const { banner } = useAppSelector((state) => state.ui);

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const onClose = () => {
    dispatch(setBanner({
      ...banner,
      show: false,
    }));
  };

  return (
    <SContainer active={banner?.show}>
      <SText variant={3} weight={600}>
        {banner?.title}
      </SText>
      <SCloseIconHolder>
        <InlineSVG
          clickable
          scaleOnClick
          svg={closeIcon}
          fill={theme.colors.white}
          width="24px"
          height="24px"
          onClick={onClose}
        />
      </SCloseIconHolder>
    </SContainer>
  );
};

export default Banner;

interface ISContainer {
  active: boolean;
}

const SContainer = styled.div<ISContainer>`
  top: ${(props) => (props.active ? 0 : -40)}px;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  overflow: hidden;
  position: absolute;
  transition: all ease 1s;
  background: ${(props) => props.theme.colorsThemed.accent.pink};
  align-items: center;
  justify-content: center;

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
`;

const SCloseIconHolder = styled.div`
  top: 50%;
  right: 16px;
  z-index: 2;
  position: absolute;
  transform: translateY(-50%);
`;
