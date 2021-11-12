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
      <SUserAvatar
        user={{
          avatar: item.bidUser.avatar,
        }}
      />
      <SCenterContent>
        <STitle>
          {item.bidUser.nickname}
        </STitle>
        <SSubTitle>
          bid
          {' '}
          <SBidRate>
            {item.bidCurrency}
            {item.bid}
          </SBidRate>
          {' '}
          on
          {' '}
          <Link href="/bid">
            <a>
              <SLinkTitle>
                {item.bidForUser.nickname}
                ’s
              </SLinkTitle>
            </a>
          </Link>
          {' '}
          decision.
        </SSubTitle>
      </SCenterContent>
      <SUserAvatar
        user={{
          avatar: item.bidForUser.avatar,
        }}
        radius="small"
      />
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
  background-color: ${(props) => props.theme.colorsThemed.grayscale.background2};
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
  ${(props) => props.theme.media.tablet} {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }

  ${(props) => props.theme.media.tablet} {
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
  }
`;
