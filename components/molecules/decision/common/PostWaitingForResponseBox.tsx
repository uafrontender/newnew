import React from 'react';
import styled from 'styled-components';

import Text from '../../../atoms/Text';

import PostSuccessIcon from '../../../../public/images/decision/post-excited-img.png';

interface IPostWaitingForResponseBox {
  title: string;
  body: string;
  buttonCaption: string;
  style?: React.CSSProperties;
  handleButtonClick: () => void;
}

const PostWaitingForResponseBox: React.FunctionComponent<
  IPostWaitingForResponseBox
> = ({ title, body, buttonCaption, style, handleButtonClick }) => (
  <SWaitingForResponseBox style={style ?? {}}>
    <SIconImg src={PostSuccessIcon.src} />
    <SHeadline variant={2}>{title}</SHeadline>
    <SBody variant={3}>{body}</SBody>
    <SCtaButtonContainer>
      <SCTAButton onClick={handleButtonClick}>{buttonCaption}</SCTAButton>
    </SCtaButtonContainer>
  </SWaitingForResponseBox>
);

PostWaitingForResponseBox.defaultProps = {
  style: undefined,
};

export default PostWaitingForResponseBox;

const SWaitingForResponseBox = styled.div`
  background: radial-gradient(
        100% 1411.13% at 0% 0%,
        rgba(54, 55, 74, 0.4) 0%,
        rgba(54, 55, 74, 0) 81.65%
      )
      /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
    radial-gradient(
        100% 1411.13% at 100% 100%,
        rgba(54, 55, 74, 0.4) 0%,
        rgba(54, 55, 74, 0) 81.65%
      )
      /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
    #1e1f29;
  box-shadow: 0px 10px 30px rgba(54, 55, 74, 0.2);

  display: grid;
  grid-template-areas:
    'imageArea headlineArea'
    'imageArea bodyArea'
    'ctaArea ctaArea';
  grid-template-columns: 64px 1fr;

  padding: 16px;

  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;

    grid-template-areas:
      'imageArea headlineArea ctaArea'
      'imageArea bodyArea ctaArea';
    grid-template-columns: 64px 5fr 3fr;
  }
`;

const SIconImg = styled.img`
  grid-area: imageArea;
`;

const SHeadline = styled(Text)`
  grid-area: headlineArea;
  align-self: center;

  color: #ffffff;
`;

const SBody = styled(Text)`
  grid-area: bodyArea;
  align-self: center;

  color: #ffffff;
  opacity: 0.8;
`;

const SCtaButtonContainer = styled.div`
  grid-area: ctaArea;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    justify-content: flex-end;
  }
`;

const SCTAButton = styled.button`
  background: #ffffff;

  border: transparent;
  border-radius: 16px;

  padding: 12px 24px;

  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.dark};

  width: 100%;
  margin-top: 12px;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    width: fit-content;
    margin-top: initial;
  }
`;
