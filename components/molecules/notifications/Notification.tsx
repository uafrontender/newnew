import React, { useEffect, useState, useRef, useCallback } from 'react';
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';

import UserAvatar from '../UserAvatar';
import { InlineSvg } from '../../atoms/InlineSVG';
import MessageIcon from '../../../public/images/svg/icons/filled/MessageIcon.svg';
import MessageCircle from '../../../public/images/svg/icons/filled/MessageCircle.svg';
import NotificationsIcon from '../../../public/images/svg/icons/filled/Notifications.svg';
import { useAppSelector } from '../../../redux-store/store';
import mobileLogo from '../../../public/images/svg/mobile-logo.svg';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import { markAsRead } from '../../../api/endpoints/notification';
import getDisplayname from '../../../utils/getDisplayname';

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
  id,
  content,
  createdAt,
  target,
  isRead,
}) => {
  const { t } = useTranslation('page-Notifications');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const user = useAppSelector((state) => state.user);
  const [url, setUrl] = useState('/direct-messages');

  const [isUnread, setIsUnread] = useState(!isRead);
  const { ref, inView } = useInView();
  const markAsReadTimeoutRef = useRef<NodeJS.Timer | null>(null);

  const markNotificationAsRead = useCallback(async () => {
    if (!id) {
      return;
    }
    const payload = new newnewapi.MarkAsReadRequest({
      notificationIds: [id],
    });

    const res = await markAsRead(payload);

    if (res.error) throw new Error(res.error?.message ?? 'Request failed');
  }, [id]);

  useEffect(() => {
    if (url === '/direct-messages' && target) {
      if (target.creatorDashboard && target?.creatorDashboard.section === 1)
        setUrl('/creator/subscribers');

      if (target.userProfile && target?.userProfile.userUsername) {
        setUrl(`/direct-messages/${target.userProfile.userUsername}`);
      }

      if (target.postResponse && target?.postResponse.postUuid)
        setUrl(`/p/${target.postResponse.postUuid}`);

      if (target.postAnnounce && target?.postAnnounce.postUuid)
        setUrl(`/p/${target.postAnnounce.postUuid}`);
    }
  }, [url, target]);

  useEffect(() => {
    if (inView && isUnread && !markAsReadTimeoutRef.current) {
      const MARK_AS_READ_DELAY = 3000;
      markAsReadTimeoutRef.current = setTimeout(() => {
        markNotificationAsRead();
        setIsUnread(false);
      }, MARK_AS_READ_DELAY);
      return () => {
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }
      };
    }

    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
      markAsReadTimeoutRef.current = null;
    }

    return () => {};
  }, [inView, isUnread, markNotificationAsRead]);

  const getNotificationTitle = useCallback((): React.ReactNode => {
    if (!content) {
      return null;
    }

    if (
      content.relatedUser &&
      content.relatedUser.uuid !== user.userData?.userUuid
    ) {
      return (
        <>
          <STitleText>{getDisplayname(content.relatedUser)}</STitleText>
          {content?.relatedUser?.isVerified && (
            <SInlineSVG
              svg={VerificationCheckmark}
              width='16px'
              height='16px'
            />
          )}
        </>
      );
    }

    if (content.relatedPost?.title) {
      return <STitleText>{content.relatedPost.title}</STitleText>;
    }

    return <STitleText>{t('title.newMessage')}</STitleText>;
  }, [content, user.userData?.userUuid, t]);

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
          <SInfo ref={ref}>
            <STitle>{getNotificationTitle()}</STitle>
            <SContent>{content?.message}</SContent>
            <SDate>
              {moment((createdAt?.seconds as number) * 1000).fromNow()}
            </SDate>
          </SInfo>
          {content?.relatedPost &&
            content?.relatedPost.thumbnailImageUrl &&
            !isMobile && (
              <SPostThumbnail
                avatarUrl={content?.relatedPost.thumbnailImageUrl}
              />
            )}
          <SStatus>
            <SBullet visible={isUnread} />
          </SStatus>
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
    width: 78px;
    height: 78px;
    min-width: 78px;
    min-height: 78px;
  }
`;

const SAvatarHolder = styled.div`
  position: relative;
  flex-shrink: 0;
  margin-right: 12px;

  ${({ theme }) => theme.media.tablet} {
    margin-right: 24px;
    margin-top: auto;
    margin-bottom: auto;
  }
`;

const SInfo = styled.div`
  padding: 0 24px 12px 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  width: 100%;
  overflow: hidden;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};

  ${({ theme }) => theme.media.tablet} {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const STitle = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  margin-bottom: 0;
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;
  }
`;

const STitleText = styled.div`
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SContent = styled.p`
  margin-bottom: 0;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;
  }
`;

const SDate = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SPostThumbnail = styled(UserAvatar)`
  width: 78px;
  height: 78px;
  min-width: 78px;
  min-height: 78px;
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: auto;
  border-radius: 16px;
  cursor: pointer;
`;

const SStatus = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  padding-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const SBullet = styled.div<{ visible: boolean }>`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  background: #e8354d;
  border-radius: 50%;
  margin-left: 10px;
  margin-right: 8px;
  opacity: ${({ visible }) => (visible ? 1 : 0)};

  ${({ theme }) => theme.media.tablet} {
    margin-left: 20px;
  }
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
    width: 78px;
    height: 78px;
    min-width: 78px;
    min-height: 78px;
  }
`;
