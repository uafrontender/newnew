import React from 'react';
import styled from 'styled-components';

interface IProfileBackground {
  pictureURL: string;
  children?: React.ReactNode;
}

const ProfileBackground: React.FunctionComponent<IProfileBackground> = ({
  pictureURL,
  children,
}) => (
  <SProfileBackground pictureURL={pictureURL}>
    <img src={pictureURL} alt='Profile cover' draggable={false} />
    <SButtonsContainer>{children}</SButtonsContainer>
  </SProfileBackground>
);

export default ProfileBackground;

interface ISProfileBackground {
  pictureURL: string;
}

const SProfileBackground = styled.div<ISProfileBackground>`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 160px;
  margin-bottom: 72px;

  &:before {
    position: absolute;
    bottom: 0px;
    left: calc(50% - 48px - 43px);
    content: '';
    width: 30px;
    height: 30px;
    border-bottom-right-radius: 70%;

    box-shadow: 12px 15px 0px 0px
      ${({ theme }) => theme.colorsThemed.background.secondary};

    background: transparent;
  }

  &:after {
    position: absolute;
    bottom: 0px;
    left: calc(50% + 48px + 13px);
    content: '';
    width: 30px;
    height: 30px;
    border-bottom-left-radius: 70%;

    box-shadow: -12px 15px 0px 0px
      ${({ theme }) => theme.colorsThemed.background.secondary};

    background: transparent;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    vertical-align: inherit;
  }

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    height: 200px;

    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${(props) => props.theme.media.laptop} {
    height: 240px;
  }
`;

const SButtonsContainer = styled.div`
  position: absolute;
  right: 16px;
  bottom: 16px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  button {
    span {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  ${(props) => props.theme.media.tablet} {
    flex-direction: row;
  }

  ${(props) => props.theme.media.laptop} {
    button {
      span {
        div {
          margin-right: 8px;
        }
      }
    }
  }
`;
