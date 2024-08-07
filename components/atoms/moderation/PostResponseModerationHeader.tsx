import React from 'react';
import styled, { css } from 'styled-components';

import Headline from '../Headline';

import assets from '../../../constants/assets';

interface IPostResponseTabModerationHeader {
  title: string;
  successVariant?: boolean;
}

const PostResponseTabModerationHeader: React.FunctionComponent<
  IPostResponseTabModerationHeader
> = ({ title, successVariant }) => (
  <SHeaderDiv>
    <SHeaderHeadline variant={3} successVariant={successVariant}>
      {title}
    </SHeaderHeadline>
    <SCoin1
      key='response-published-coin-1'
      className='headerDiv__coinImage'
      src={assets.decision.gold}
      alt='coin'
      draggable={false}
    />
    <SCoin2
      key='response-published-coin-2'
      className='headerDiv__coinImage'
      src={assets.decision.gold}
      alt='coin'
      draggable={false}
    />
    <SCoin3
      key='response-published-coin-3'
      className='headerDiv__coinImage'
      src={assets.decision.gold}
      alt='coin'
      draggable={false}
    />
    <SCoin4
      key='response-published-coin-4'
      className='headerDiv__coinImage'
      src={assets.decision.gold}
      alt='coin'
      draggable={false}
    />
    <SCoin5
      key='response-published-coin-5'
      className='headerDiv__coinImage'
      src={assets.decision.gold}
      alt='coin'
      draggable={false}
    />
    <SCoin6
      key='response-published-coin-6'
      className='headerDiv__coinImage'
      src={assets.decision.gold}
      alt='coin'
      draggable={false}
    />
  </SHeaderDiv>
);

export default PostResponseTabModerationHeader;

const SHeaderDiv = styled.div`
  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  padding-left: 32px;
  padding-top: 24px;
  padding-bottom: 24px;

  background: linear-gradient(
    74.02deg,
    #00c291 2.52%,
    #07df74 49.24%,
    #0ff34f 99.43%
  );
  border-radius: 16px 16px 0px 0px;

  width: 100%;
  min-height: 122px;

  margin-top: 16px;

  .headerDiv__coinImage {
    position: absolute;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    min-height: 128px;
    margin-top: 0px;
  }
`;

const SHeaderHeadline = styled(Headline)<{
  successVariant?: boolean;
}>`
  color: #ffffff;
  white-space: pre;

  ${({ theme }) => theme.media.laptopL} {
    font-size: 56px;
    line-height: 64px;
    ${({ successVariant }) =>
      successVariant
        ? css`
            white-space: initial;
          `
        : null}
  }
`;

const SCoin1 = styled.img`
  width: 56px;
  bottom: -32px;
  left: 5px;

  transform: scale(0.8) rotate(180deg) scale(1, -1);

  ${({ theme }) => theme.media.tablet} {
    transform: rotate(180deg) scale(1, -1);
  }
`;

const SCoin2 = styled.img`
  width: 86px;
  top: -48px;
  left: 15%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

const SCoin3 = styled.img`
  width: 98px;
  top: 10%;
  right: 5%;
  transform: scale(0.8) rotate(180deg) scale(1, -1);

  ${({ theme }) => theme.media.tablet} {
    transform: rotate(180deg) scale(1, -1);
  }
`;

const SCoin4 = styled.img`
  width: 56px;
  top: 16%;
  right: 25%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

const SCoin5 = styled.img`
  width: 84px;
  bottom: -28px;
  right: 25%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

// THIS
const SCoin6 = styled.img`
  width: 32px;
  top: 16px;
  right: 35%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;
