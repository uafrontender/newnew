import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import UserAvatar from '../UserAvatar';
import { InlineSvg } from '../../atoms/InlineSVG';

import MessageIcon from '../../../public/images/svg/icons/filled/MessageIcon.svg';
import MessageCircle from '../../../public/images/svg/icons/filled/MessageCircle.svg';
import NotificationsIcon from '../../../public/images/svg/icons/filled/Notifications.svg';
import { useAppSelector } from '../../../redux-store/store';
import mobileLogo from '../../../public/images/svg/mobile-logo.svg';

const getNotificationIcon = (target: newnewapi.IRoutingTarget) => {
  if (target.creatorDashboard && target?.creatorDashboard.section === 2) {
    return MessageIcon;
  }

  if (target.creatorDashboard && target?.creatorDashboard.section === 1) {
    return NotificationsIcon;
  }

  return MessageCircle;
};

const Notification: React.FC<newnewapi.INotification> = ({
  content,
  createdAt,
  target,
}) => {
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const user = useAppSelector((state) => state.user);
  const [url, setUrl] = useState('');

  console.log(content, target);

  useEffect(() => {
    if (url.length < 1 && target) {
      if (target.creatorDashboard && target?.creatorDashboard.section === 2)
        setUrl('/direct-messages');

      if (target.creatorDashboard && target?.creatorDashboard.section === 1)
        setUrl('/creator/subscribers');

      if (target.userProfile && target?.userProfile.userUsername)
        setUrl(`/direct-messages/${target.userProfile.userUsername}`);

      if (target.postResponse && target?.postResponse.postUuid)
        setUrl(`/post/${target.postResponse.postUuid}`);

      if (target.postAnnounce && target?.postAnnounce.postUuid)
        setUrl(`/post/${target.postAnnounce.postUuid}`);
    }
  }, [url, target]);

  return (
    <Link href={url}>
      <a>
        <SWrapper>
          {content?.relatedUser?.uuid !== user.userData?.userUuid ? (
            <SAvatarHolder>
              <SUserAvatar
                avatarUrl={
                  content?.relatedUser?.thumbnailAvatarUrl
                    ? content?.relatedUser?.thumbnailAvatarUrl
                    : ''
                }
              />
              {target && (
                <SIcon>
                  <SInlineSVG
                    svg={getNotificationIcon(target)}
                    fill={theme.colors.white}
                    width='14px'
                    height='14px'
                  />
                </SIcon>
              )}
            </SAvatarHolder>
          ) : (
            <SAvatarHolder>
              <SIconHolder>
                <InlineSvg
                  clickable
                  svg={mobileLogo}
                  fill='#fff'
                  width={isMobile ? '24px' : '48px'}
                  height={isMobile ? '24px' : '48px'}
                />
              </SIconHolder>
            </SAvatarHolder>
          )}
          <SText>
            <STitle>{content?.relatedUser?.nicknameOrUsername}</STitle>
            <p>{content?.message}</p>
            <SDate>
              {moment((createdAt?.seconds as number) * 1000).fromNow()}
            </SDate>
          </SText>
          {content?.relatedPost &&
            content?.relatedPost.thumbnailImageUrl &&
            !isMobile && (
              <SPostThumbnail
                avatarUrl={content?.relatedPost.thumbnailImageUrl}
              />
            )}
        </SWrapper>
      </a>
    </Link>
  );
};

export default Notification;

const SWrapper = styled.div`
  display: flex;
  padding: 12px 0 0;
  border-bottom: 0;
  cursor: pointer;
  min-height: 75px;

  ${({ theme }) => theme.media.tablet} {
    border-bottom: 1px solid
      ${(props) => props.theme.colorsThemed.background.outlines1};
    padding: 20px 0;
    min-height: 'unset';
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
  cursor: pointer;
`;

const SDate = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SIcon = styled.span`
  position: absolute;
  right: calc(50% - 16px);
  top: 32px;
  bottom: -5px;
  width: 32px;
  height: 32px;
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  border: 4px solid ${(props) => props.theme.colorsThemed.background.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    right: -14px;
    top: -14px;

    width: 40px;
    height: 40px;
    border: 8px solid ${(props) => props.theme.colorsThemed.background.primary};
  }
`;

const SInlineSVG = styled(InlineSvg)`
  min-width: 16px;
  min-height: 16px;
`;

const SIconHolder = styled.div`
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  display: flex;
  align-items: center;
  justify-content: center;
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
