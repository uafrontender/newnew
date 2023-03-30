/* eslint-disable react/require-default-props */
import React from 'react';
import styled, { useTheme } from 'styled-components';
import assets from '../../../../constants/assets';

import Headline from '../../../atoms/Headline';

interface IWaitingForResponseBox {
  title: string;
  body: React.ReactNode;
}

const WaitingForResponseBox: React.FunctionComponent<
  IWaitingForResponseBox
> = ({ title, body }) => {
  const theme = useTheme();

  return (
    <SBox>
      <STextWrapper>
        <SHeadline variant={2}>{title}</SHeadline>
        <SText variant={6}>{body}</SText>
      </STextWrapper>
      <SImageContainer>
        <img
          src={
            theme.name === 'dark'
              ? assets.decision.darkHourglassAnimated()
              : assets.decision.lightHourglassAnimated()
          }
          alt='post'
        />
      </SImageContainer>
    </SBox>
  );
};

export default WaitingForResponseBox;

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
    width: 75%;
  }
`;

const SHeadline = styled(Headline)`
  color: #ffffff;
`;

const SText = styled(Headline)`
  color: #ffffff;
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
    width: 80px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 80px;
  }
`;
