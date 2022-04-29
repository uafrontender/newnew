import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

import UserAvatar from './UserAvatar';

interface INotificationItem {
  item: any;
}

export const NotificationsItem: React.FC<INotificationItem> = (props) => {
  const { item } = props;

  return (
    <SWrapper>
      <SUserAvatar avatarUrl={item.bidForUser.avatar} />
      <SCenterContent>
        <STitle>{item.bidUser.nickname}</STitle>
        <SSubTitle>
          bid{' '}
          <SBidRate>
            {item.bidCurrency}
            {item.bid}
          </SBidRate>{' '}
          on{' '}
          <Link href='/bid'>
            <a>
              <SLinkTitle>
                {item.bidForUser.nickname}
                ’s
              </SLinkTitle>
            </a>
          </Link>{' '}
          decision.
        </SSubTitle>
      </SCenterContent>
      <SUserAvatarRight avatarUrl={item.bidForUser.avatar} />
    </SWrapper>
  );
};

export default NotificationsItem;

const SWrapper = styled.div`
  display: flex;
  padding: 16px;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  flex-direction: row;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
`;

const SCenterContent = styled.div`
  flex: 1;
  padding: 0 8px;
`;

const STitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  margin-bottom: 2px;
`;

const SSubTitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const SBidRate = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

const SLinkTitle = styled.span`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
`;

const SUserAvatar = styled(UserAvatar)`
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 16px;

  ${(props) => props.theme.media.laptop} {
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    border-radius: 28px;
  }
`;

const SUserAvatarRight = styled(SUserAvatar)`
  border-radius: 8px;

  ${(props) => props.theme.media.laptop} {
    width: 72px;
    height: 72px;
    min-width: 72px;
    min-height: 72px;
    border-radius: 16px;
  }
`;
