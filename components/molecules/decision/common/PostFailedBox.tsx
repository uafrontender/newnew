import React from 'react';
import styled from 'styled-components';

import Text from '../../../atoms/Text';

import PostFailIcon from '../../../../public/images/decision/post-failed-img.png';

interface IPostFailedBox {
  title: string;
  body: React.ReactNode;
  buttonCaption: string;
  imageSrc?: string;
  style?: React.CSSProperties;
  handleButtonClick: () => void;
}

const PostFailedBox: React.FunctionComponent<IPostFailedBox> = ({
  title,
  body,
  buttonCaption,
  imageSrc,
  style,
  handleButtonClick,
}) => (
  <SFailedBox style={style ?? {}}>
    <SIconImg src={imageSrc ?? PostFailIcon.src} />
    <SHeadline variant={2}>{title}</SHeadline>
    <SBody variant={3}>{body}</SBody>
    <SCtaButtonContainer>
      <SCTAButton onClick={handleButtonClick}>{buttonCaption}</SCTAButton>
    </SCtaButtonContainer>
  </SFailedBox>
);

PostFailedBox.defaultProps = {
  style: undefined,
  imageSrc: undefined,
};

export default PostFailedBox;

const SFailedBox = styled.div`
  background-color: #f01c66;

  display: grid;
  grid-template-areas:
    'imageArea headlineArea ctaArea'
    'imageArea bodyArea ctaArea';
  grid-template-columns: 64px 6fr 5fr;

  padding: 16px;

  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;

    margin-top: 16px;
  }
`;

const SIconImg = styled.img`
  grid-area: imageArea;

  height: 60px;
  margin-right: 16px;
`;

const SHeadline = styled(Text)`
  grid-area: headlineArea;
  align-self: center;

  color: #ffffff;
`;

const SBody = styled(Text)`
  grid-area: bodyArea;
  display: flex;
  flex-direction: row;
  white-space: pre;
  align-self: center;

  color: #ffffff;
  opacity: 0.8;
`;

const SCtaButtonContainer = styled.div`
  grid-area: ctaArea;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  margin-left: 8px;
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
  transition: 0.2s linear;

  cursor: pointer;

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colorsThemed.button.color.common};
    box-shadow: ${({ theme }) => theme.shadows.lightBlue};
  }
`;
