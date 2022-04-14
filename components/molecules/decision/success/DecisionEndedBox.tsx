import React from 'react';
import styled from 'styled-components';
import Headline from '../../../atoms/Headline';

interface IDecisionEndedBox {
  imgSrc: string;
}

const DecisionEndedBox: React.FunctionComponent<IDecisionEndedBox> = ({
  imgSrc,
  children,
}) => (
  <SBox>
    <SHeadline
      variant={2}
    >
      { children }
    </SHeadline>
    <SImageContainer>
      <img
        src={imgSrc}
        alt="decision"
      />
    </SImageContainer>
  </SBox>
);

export default DecisionEndedBox;

const SBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.colorsThemed.accent.blue};

  padding: 16px 30px;
`;

const SHeadline = styled(Headline)`
  color: #FFFFFF;

  width: 45%;

  ${({ theme }) => theme.media.tablet} {
    width: 35%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 55%;
  }
`;

const SImageContainer = styled.div`
  position: relative;
  top: -14px;

  width: 130px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 140px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 160px;
  }
`;
