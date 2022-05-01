import React from 'react';
import moment from 'moment';
import styled, { useTheme } from 'styled-components';
import UserAvatar from './UserAvatar';
import InlineSVG from '../atoms/InlineSVG';

import MessageIcon from '../../public/images/svg/icons/filled/MessageIcon.svg';
import MessageCircle from '../../public/images/svg/icons/filled/MessageCircle.svg';
import { useAppSelector } from '../../redux-store/store';
import { INotification, RoutingTarget } from '../../pages/notifications';

const Notification: React.FC<INotification> = ({
  content,
  routingTarget,
  createdAt,
}) => {
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  return (
    <SWrapper>
      <SAvatarHolder>
        <SUserAvatar avatarUrl={content.relatedUser.thumbnailAvatarUrl} />
        {routingTarget !== RoutingTarget.Empty && (
          <SIcon>
            <SInlineSVG
              svg={
                routingTarget === RoutingTarget.ChatRoom
                  ? MessageIcon
                  : MessageCircle
              }
              fill={theme.colors.white}
              width='14px'
              height='14px'
            />
          </SIcon>
        )}
      </SAvatarHolder>
      <SText>
        <STitle>{content.relatedUser.title}</STitle>
        <p>
          {content.message} {content.relatedPost && content.relatedPost.title}
        </p>
        <SDate>{moment(createdAt).fromNow()}</SDate>
      </SText>
      {content.relatedPost && !isMobile && (
        <SPostThumbnail avatarUrl={content.relatedPost.thumbnailImageUrl} />
      )}
    </SWrapper>
  );
};

export default Notification;

const SWrapper = styled.div`
  display: flex;
  padding: 12px 0 0;
  border-bottom: 0;
  ${({ theme }) => theme.media.tablet} {
    border-bottom: 1px solid
      ${(props) => props.theme.colorsThemed.background.outlines1};
    padding: 20px 0;
  }
`;

const SUserAvatar = styled(UserAvatar)`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  ${({ theme }) => theme.media.tablet} {
    width: 72px;
    height: 72px;
    min-width: 72px;
    min-height: 72px;
  }
`;

const SAvatarHolder = styled.div`
  flex-shrink: 0;
  margin-right: 12px;
  position: relative;
  ${({ theme }) => theme.media.tablet} {
    margin-right: 24px;
  }
`;

const STitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  margin-bottom: 0;
  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;
  }
`;

const SText = styled.div`
  padding: 0 20px 12px 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  width: 100%;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  ${({ theme }) => theme.media.tablet} {
    border-bottom: 0;
    padding-bottom: 0;
  }
  p {
    margin-bottom: 0;
    ${({ theme }) => theme.media.tablet} {
      margin-bottom: 12px;
    }
  }
`;

const SPostThumbnail = styled(UserAvatar)`
  width: 72px;
  height: 72px;
  min-width: 72px;
  min-height: 72px;
  flex-shrink: 0;
  margin-left: auto;
  border-radius: 20px;
`;

const SDate = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SIcon = styled.span`
  position: absolute;
  right: calc(50% - 20px);
  top: 36px;
  bottom: -5px;
  width: 40px;
  height: 40px;
  background: ${(props) => props.theme.colors.blue};
  border: 8px solid ${(props) => props.theme.colorsThemed.background.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.media.tablet} {
    right: -14px;
    top: -14px;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 16px;
  min-height: 16px;
`;
