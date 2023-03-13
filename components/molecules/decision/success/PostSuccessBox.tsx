import React from 'react';
import styled from 'styled-components';

import Text from '../../../atoms/Text';

import PostSuccessIcon from '../../../../public/images/decision/post-excited-img.png';

interface IPostSuccessBox {
  title: string;
  body: string;
  buttonCaption: string;
  style?: React.CSSProperties;
  handleButtonClick: () => void;
}

const PostSuccessBox: React.FunctionComponent<IPostSuccessBox> = ({
  title,
  body,
  buttonCaption,
  style,
  handleButtonClick,
}) => (
  <SSuccessBox style={style ?? {}}>
    <SIconImg src={PostSuccessIcon.src} />
    <SHeadline variant={2}>{title}</SHeadline>
    <SBody variant={3}>{body}</SBody>
    <SCtaButtonContainer>
      <SCTAButton onClick={handleButtonClick}>{buttonCaption}</SCTAButton>
    </SCtaButtonContainer>
  </SSuccessBox>
);

PostSuccessBox.defaultProps = {
  style: undefined,
};

export default PostSuccessBox;

const SSuccessBox = styled.div`
  background: linear-gradient(
      315deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    #1d6aff;
  box-shadow: 0px 10px 30px rgba(54, 55, 74, 0.2);

  display: grid;
  grid-template-areas:
    'imageArea headlineArea ctaArea'
    'imageArea bodyArea ctaArea';
  grid-template-columns: 64px 5fr 3fr;

  padding: 16px;

  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
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
  justify-content: flex-end;
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

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colorsThemed.button.color.common};
    box-shadow: ${({ theme }) => theme.shadows.lightBlue};
  }
`;
