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
  height: ${(props) => (props.active ? 40 : 0)}px;
  display: flex;
  overflow: hidden;
  position: relative;
  animation: gradient 5s ease infinite;
  transition: all ease 0.5s;
  background: ${(props) => props.theme.gradients.bannerPink};
  align-items: center;
  background-size: 300% 300%;
  justify-content: center;

  @keyframes gradient {
    0% {
      background-position: 100% 0%;
    }
  }
`;

const SText = styled(Text)`
  color: ${(props) => props.theme.colors.white};
`;

const SCloseIconHolder = styled.div`
  top: 50%;
  right: 16px;
  position: absolute;
  transform: translateY(-50%);
`;
