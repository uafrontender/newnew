/* eslint-disable react/require-default-props */
import React from 'react';
import styled from 'styled-components';

import Headline from '../../../atoms/Headline';

import HourGlassImage from '../../../../public/images/decision/hourglass-mock.png';

interface IDecisionEndedBox {
  title: string;
  body: string;
}

const DecisionEndedBox: React.FunctionComponent<IDecisionEndedBox> = ({
  title,
  body,
}) => (
    <SBox>
      <STextWrapper>
        <SHeadline
          variant={2}
        >
          { title }
        </SHeadline>
        <SText
          variant={6}
        >
          { body }
        </SText>
      </STextWrapper>
      <SImageContainer>
        <img
          src={HourGlassImage.src}
          alt="decision"
        />
      </SImageContainer>
    </SBox>
  )

export default DecisionEndedBox;

const SBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.colorsThemed.accent.blue};

  padding: 16px 30px;
`;

const STextWrapper = styled.div`
  width: 65%;

  ${({ theme }) => theme.media.tablet} {
    width: 65%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 65%;
  }
`;

const SHeadline = styled(Headline)`
  color: #FFFFFF;
`;

const SText = styled(Headline)`
  color: #FFFFFF;
`;

const SImageContainer = styled.div`
  position: relative;

  width: 88px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 120px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 120px;
  }
`;
