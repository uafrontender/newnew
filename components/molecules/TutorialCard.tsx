/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { useAppState } from '../../contexts/appStateContext';

import Headline from '../atoms/Headline';
import Text from '../atoms/Text';

interface ITutorialCard {
  image: any;
  title: string;
  caption: string;
  height?: string;
  imageStyle?: React.CSSProperties;
}

// TODO: optimize, memorize imageStyle object
export const TutorialCard: React.FC<ITutorialCard> = ({
  image,
  title,
  caption,
  height,
  imageStyle,
  ...rest
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  return (
    <SWrapper {...rest}>
      <SImageBG id='backgroundPart' height={height}>
        <SImageHolder>
          <img
            src={image}
            alt={title}
            style={imageStyle ?? {}}
            draggable={false}
          />
        </SImageHolder>
      </SImageBG>
      <SHeadline variant={4}>{title}</SHeadline>
      <SBottomContent variant={isMobile ? 1 : 3}>{caption}</SBottomContent>
    </SWrapper>
  );
};

export default TutorialCard;

TutorialCard.defaultProps = {
  height: '',
  imageStyle: {},
};

const SWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;

  padding: 10px 10px 70px;

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

  cursor: default;

  ${({ theme }) => theme.media.tablet} {
    height: 100%;
    max-height: 434px;
    max-width: 224px;
    width: 224px;
    padding: 10px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 100%;

    max-height: 468px;
  }
`;

interface ISImageBG {
  height?: string;
}

const SImageBG = styled.div<ISImageBG>`
  width: 100%;
  height: 466px;

  position: relative;

  padding: 48px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-radius: 8px;
  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.tablet} {
    height: 72%;
    padding: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 60%;
  }
`;

const SImageHolder = styled.div`
  display: flex;
  justify-content: center;

  img {
    height: 180px;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    img {
      height: 160px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    img {
      height: 172px;
    }
  }
`;

const SHeadline = styled(Headline)`
  margin-top: 16px;
  margin-bottom: 8px;
  text-align: center;

  &&& {
    font-size: 24px;
    line-height: 32px;

    ${({ theme }) => theme.media.tablet} {
      margin-top: 24px;

      font-size: 20px;
      line-height: 28px;
    }

    ${({ theme }) => theme.media.laptop} {
      font-size: 24px;
      line-height: 32px;
    }
  }
`;

const SBottomContent = styled(Text)`
  text-align: center;
  padding-top: 8px;

  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${(props) => props.theme.media.tablet} {
    width: 180px;

    font-size: 14px;
    line-height: 20px;
  }

  ${(props) => props.theme.media.laptop} {
    width: 204px;

    font-size: 16px;
    line-height: 24px;
  }
`;
