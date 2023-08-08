import React, { useEffect, useState, useRef, useCallback } from 'react';
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/dist/client/router';

import UserAvatar from '../UserAvatar';
import { InlineSvg } from '../../atoms/InlineSVG';
import MessageIcon from '../../../public/images/svg/icons/filled/MessageIcon.svg';
import MessageCircle from '../../../public/images/svg/icons/filled/MessageCircle.svg';
import NotificationsIcon from '../../../public/images/svg/icons/filled/Notifications.svg';
import mobileLogo from '../../../public/images/svg/MobileLogo.svg';
import { markAsRead } from '../../../api/endpoints/notification';
import PostTitleContent from '../../atoms/PostTitleContent';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';
import getNotificationTargetUrl from '../../../utils/getNotificationTargetUrl';

const getNotificationIcon = (target: newnewapi.IRoutingTarget) => {
  if (target.creatorDashboard && target?.creatorDashboard.section === 2) {
    return MessageIcon;
  }

  if (target.creatorDashboard && target?.creatorDashboard.section === 1) {
    return NotificationsIcon;
  }

  return MessageCircle;
};

interface INotification extends newnewapi.INotification {
  currentTime: number;
}

const Notification: React.FC<INotification> = ({
  id,
  content,
  createdAt,
  target,
  isRead,
  currentTime,
}) => {
  const { t } = useTranslation('page-Notifications');
  const { locale } = useRouter();
  const theme = useTheme();
  const { resizeMode, userUuid } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const [url, setUrl] = useState<string | undefined>(undefined);

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

    if (res.error) {
      throw new Error(res.error?.message ?? 'Request failed');
    }

    setIsUnread(false);
  }, [id]);

  useEffect(() => {
    const targetUrl = getNotificationTargetUrl(target);
    if (targetUrl) {
      setUrl(targetUrl);
    }
  }, [target]);

  useEffect(() => {
    if (isRead) {
      setIsUnread(false);
    }
  }, [isRead]);

  useEffect(() => {
    if (inView && isUnread && !markAsReadTimeoutRef.current) {
      const MARK_AS_READ_DELAY = 3000;
      markAsReadTimeoutRef.current = setTimeout(() => {
        markNotificationAsRead();
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

    if (content.relatedUser && content.relatedUser.uuid !== userUuid) {
      return (
        <STitleText>
          <DisplayName user={content.relatedUser} />
        </STitleText>
      );
    }

    if (content.relatedPost?.title) {
      return (
        <STitleText>
          <PostTitleContent>{content.relatedPost.title}</PostTitleContent>
        </STitleText>
      );
    }

    return <STitleText>{t('title.newMessage')}</STitleText>;
  }, [content, userUuid, t]);

  // Do we need optimization here?
  const NotificationItem = (
    <SWrapper
      onClick={() => {
        Mixpanel.track('Notification Clicked', {
          _stage: 'Notifications',
          _target: url,
          _component: 'Notification',
        });
        markNotificationAsRead();
      }}
    >
      {content?.relatedUser?.uuid !== userUuid ? (
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
              fill={theme.colors.white}
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
          {moment((createdAt?.seconds as number) * 1000)
            .locale(locale || 'en-US')
            .fromNow()}
        </SDate>
      </SInfo>
      {content?.relatedPost &&
        content?.relatedPost.thumbnailImageUrl &&
        !isMobile && (
          <SPostThumbnail avatarUrl={content?.relatedPost.thumbnailImageUrl} />
        )}
      <SStatus>
        <SBullet visible={isUnread} />
      </SStatus>
    </SWrapper>
  );

  if (!url) {
    return NotificationItem;
  }

  return (
    <Link href={url}>
      <a>{NotificationItem}</a>
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
  display: inline-block;
  overflow: hidden;
  white-space: pre;
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
