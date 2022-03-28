/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';

import { useAppSelector } from '../../redux-store/store';
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';

interface ITutorialCard {
  image: any;
  title: string;
  caption: string;
  height?: string;
}

export const TutorialCard: React.FC<ITutorialCard> = ({
  image,
  title,
  caption,
  height,
}) => {
  const {
    resizeMode,
  } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <SWrapper>
      <SImageBG
        id="backgroundPart"
        height={height}
      >
        <SImageHolder>
          <img
            src={image.src}
            alt={title}
          />
        </SImageHolder>
        <SHeadline
          variant={4}
        >
          {title}
        </SHeadline>
      </SImageBG>
      <SBottomContent
        variant={isMobile ? 1 : 3}
      >
        {caption}
      </SBottomContent>
    </SWrapper>
  );
};

export default TutorialCard;

TutorialCard.defaultProps = {
  height: '',
};

const SWrapper = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  position: relative;
  flex-direction: column;

  padding: 10px;


  border: 1.5px solid;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-color: ${({ theme }) => theme.colorsThemed.background.outlines1};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    height: 100%;
  }
`;

interface ISImageBG {
  height?: string;
}

const SImageBG = styled.div<ISImageBG>`
  width: 100%;
  height: 60%;
  position: relative;

  padding: 16px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-radius: 10px;
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    height: 320px;
    justify-content: flex-end;
  }
`;

const SImageHolder = styled.div`
  max-height: 180px;

  display: flex;
  justify-content: center;

  img {
    width: 120px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 164px;
  }
`;

const SHeadline = styled(Headline)`
  margin-top: 36px;
  text-align: center;
`;

const SBottomContent = styled(Text)`
  text-align: center;
  padding: 16px 10px;

  ${(props) => props.theme.media.tablet} {
    width: 180px;
  }

  ${(props) => props.theme.media.laptop} {
    width: 204px;
  }
`;
