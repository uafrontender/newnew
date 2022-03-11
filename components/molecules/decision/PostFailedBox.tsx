import React from 'react';
import styled from 'styled-components';

import Text from '../../atoms/Text';

import PostFailIcon from '../../../public/images/decision/post-failed-img.png';

interface IPostFailedBox {
  title: string;
  body: string;
  buttonCaption: string;
  style?: React.CSSProperties;
  handleButtonClick: () => void;
}

const PostFailedBox: React.FunctionComponent<IPostFailedBox> = ({
  title,
  body,
  buttonCaption,
  style,
  handleButtonClick,
}) => (
    <SFailedBox
      style={style ?? {}}
    >
      <SIconImg
        src={PostFailIcon.src}
      />
      <SHeadline
        variant={2}
      >
        {title}
      </SHeadline>
      <SBody
        variant={3}
      >
        {body}
      </SBody>
      <SCtaButtonContainer>
        <SCTAButton
          onClick={handleButtonClick}
        >
          {buttonCaption}
        </SCTAButton>
      </SCtaButtonContainer>
    </SFailedBox>
  );

PostFailedBox.defaultProps = {
  style: undefined,
}

export default PostFailedBox;

const SFailedBox = styled.div`
  background-color: #F01C66;

  display: grid;
  grid-template-areas:
    'imageArea headlineArea ctaArea'
    'imageArea bodyArea ctaArea'
  ;
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

  color: #FFFFFF;
`;

const SBody = styled(Text)`
  grid-area: bodyArea;
  align-self: center;

  color: #FFFFFF;
  opacity: 0.8;
`;

const SCtaButtonContainer = styled.div`
  grid-area: ctaArea;

  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SCTAButton = styled.button`
  background: #FFFFFF;

  box-shadow: 0px 15px 35px -10px rgba(29, 134, 255, 0.35);

  border: transparent;
  border-radius: 16px;

  padding: 12px 24px;

  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.dark};

  cursor: pointer;
`;
