/* eslint-disable react/require-default-props */
import React from 'react';
import styled from 'styled-components';
import Headline from '../../../atoms/Headline';

interface IDecisionEndedBox {
  imgSrc: string;
  type?: 'ac' | 'mc' | 'cf';
  children: string;
}

const DecisionEndedBox: React.FunctionComponent<IDecisionEndedBox> = ({
  imgSrc,
  type,
  children,
}) => {
  if (type && type === 'mc') {
    return (
      <SBox>
        <SHeadlineMC variant={2}>{children}</SHeadlineMC>
        <SImageContainerMC>
          <img src={imgSrc} alt='post' />
        </SImageContainerMC>
      </SBox>
    );
  }

  return (
    <SBox>
      <SHeadline variant={2}>{children}</SHeadline>
      <SImageContainer>
        <img src={imgSrc} alt='post' />
      </SImageContainer>
    </SBox>
  );
};

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
  color: #ffffff;

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

const SHeadlineMC = styled(Headline)`
  color: #ffffff;

  width: 50%;

  ${({ theme }) => theme.media.tablet} {
    width: 40%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 70%;
  }
`;

const SImageContainerMC = styled.div`
  position: relative;
  top: -14px;

  width: 100px;

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
