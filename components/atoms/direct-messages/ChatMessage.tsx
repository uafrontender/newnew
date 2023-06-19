import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import { useUserData } from '../../../contexts/userDataContext';
import Text from '../Text';

const UserAvatar = dynamic(() => import('../../molecules/UserAvatar'));

interface IChatMessage {
  item: newnewapi.IChatMessage;
  prevElement: newnewapi.IChatMessage;
  nextElement: newnewapi.IChatMessage;
  chatRoom: newnewapi.IChatRoom;
  withAvatar?: boolean;
  variant?: 'primary' | 'secondary';
}

const ChatMessage: React.FC<IChatMessage> = ({
  item,
  prevElement,
  nextElement,
  chatRoom,
  withAvatar,
  variant,
}) => {
  const { t } = useTranslation('page-Chat');
  const { userData } = useUserData();

  const nextElDate = (nextElement?.createdAt?.seconds as number) * 1000;
  const prevElDate = (prevElement?.createdAt?.seconds as number) * 1000;
  const itemElDate = (item.createdAt?.seconds as number) * 1000;
  const prevSameUser = prevElement?.sender?.uuid === item.sender?.uuid;
  const nextSameUser = nextElement?.sender?.uuid === item.sender?.uuid;
  const isMine = item.sender?.uuid === userData?.userUuid;

  const prevSameDay =
    !!prevElement?.createdAt &&
    !!item.createdAt &&
    moment(prevElDate).isSame(itemElDate, 'day');

  const nextSameDay =
    !!nextElement?.createdAt &&
    !!item.createdAt &&
    moment(nextElDate).isSame(itemElDate, 'day');

  const content = (
    <SMessage
      id={item.id?.toString()}
      mine={isMine}
      prevSameUser={prevSameUser}
      withAvatar={withAvatar}
    >
      {withAvatar &&
        (!prevSameUser || !prevSameDay) &&
        (isMine ? (
          <SUserAvatar mine={isMine} avatarUrl={userData?.avatarUrl ?? ''} />
        ) : (
          <Link href={`/${chatRoom?.visavis?.user?.username}`}>
            <a>
              <SUserAvatar
                mine={isMine}
                avatarUrl={chatRoom?.visavis?.user?.avatarUrl ?? ''}
              />
            </a>
          </Link>
        ))}
      <SMessageContent
        mine={isMine}
        prevSameUser={prevSameUser}
        nextSameUser={nextSameUser}
        prevSameDay={prevSameDay}
        nextSameDay={nextSameDay}
        variant={variant}
      >
        <SMessageText mine={isMine} weight={600} variant={3}>
          {item.content?.text}
        </SMessageText>
      </SMessageContent>
    </SMessage>
  );
  if (
    item.createdAt?.seconds &&
    nextElement?.createdAt?.seconds &&
    moment(itemElDate).format('DD.MM.YYYY') !==
      moment(nextElDate).format('DD.MM.YYYY')
  ) {
    let date = moment(itemElDate).format('MMM DD');

    if (date === moment().format('MMM DD')) {
      date = t('chat.today');
    }

    return (
      <>
        {content}
        <SMessage type='info'>
          <SMessageContent
            type='info'
            prevSameUser={prevSameUser}
            nextSameUser={nextSameUser}
            variant={variant}
          >
            <SMessageText type='info' weight={600} variant={3}>
              {date}
            </SMessageText>
          </SMessageContent>
        </SMessage>
      </>
    );
  }

  if (!nextElement) {
    let date = moment(itemElDate).format('MMM DD');
    if (date === moment().format('MMM DD')) {
      date = t('chat.today');
    }

    return (
      <>
        {content}
        <SMessage type='info'>
          <SMessageContent type='info' prevSameUser={prevSameUser}>
            <SMessageText type='info' weight={600} variant={3}>
              {date}
            </SMessageText>
          </SMessageContent>
        </SMessage>
      </>
    );
  }

  return <>{content}</>;
};

export default ChatMessage;

interface ISMessage {
  type?: string;
  mine?: boolean;
  prevSameUser?: boolean;
  withAvatar?: boolean;
}

const SMessage = styled.div<ISMessage>`
  width: 100%;
  position: relative;

  ${(props) => {
    if (props.type !== 'info') {
      if (props.mine) {
        return css`
          ${props.theme.media.mobile} {
            justify-content: flex-end;
          }
          ${props.theme.media.tablet} {
            padding-right: 0;
            padding-left: ${props.withAvatar ? '44px' : ''};
            justify-content: flex-start;
          }
        `;
      }
      return css`
        ${props.theme.media.mobile} {
          padding-left: 0;
        }
        ${props.theme.media.tablet} {
          justify-content: flex-start;
          padding-left: ${props.withAvatar ? '44px' : ''};
        }
      `;
    }
    return css`
      justify-content: center;
    `;
  }}

  ${(props) => {
    if (!props.prevSameUser && props.type !== 'info') {
      return css`
        margin-bottom: 8px;
      `;
    }
    return css`
      margin-bottom: 0;
    `;
  }}
  display: flex;
  flex-direction: row;
  margin-bottom: 8px;
`;

interface ISMessageContent {
  type?: string;
  mine?: boolean;
  prevSameUser?: boolean;
  nextSameUser?: boolean;
  prevSameDay?: boolean;
  nextSameDay?: boolean;
  variant?: 'primary' | 'secondary';
}

const SMessageContent = styled.div<ISMessageContent>`
  max-width: 100%;
  padding: ${(props) => (props.type === 'info' ? '12px 0 0' : '12px 16px')};
  background: ${(props) => {
    if (props.type === 'info') {
      return 'transparent';
    }
    if (props.mine) {
      return props.theme.colorsThemed.accent.blue;
    }
    if (
      props.theme.name === 'light' &&
      (!props.variant || props.variant === 'primary')
    ) {
      return props.theme.colors.white;
    }

    return props.theme.colorsThemed.background.tertiary;
  }};
  ${(props) => {
    if (props.mine) {
      if (props.prevSameUser && props.prevSameDay) {
        if (props.nextSameUser && props.nextSameDay) {
          if (props.type === 'info') {
            return css`
              margin: 8px 0;
            `;
          }

          return css`
            border-radius: 16px;
          `;
        }

        if (props.type === 'info') {
          return css`
            margin-top: 8px;
          `;
        }

        return css`
          margin-top: 8px;
          border-radius: 16px 16px 8px 16px;

          ${props.theme.media.tablet} {
            border-radius: 16px;
          }
        `;
      }

      if (props.nextSameUser) {
        if (props.type === 'info') {
          return css`
            margin: 8px 0;
          `;
        }

        return css`
          border-radius: 16px 8px 16px 16px;

          ${props.theme.media.tablet} {
            border-radius: 16px 16px 16px 8px;
          }
        `;
      }
    } else {
      if (props.prevSameUser && props.prevSameDay) {
        if (props.nextSameUser && props.nextSameDay) {
          if (props.type === 'info') {
            return css`
              margin: 8px 0;
            `;
          }
          return css`
            border-radius: 16px;
          `;
        }

        if (props.type === 'info') {
          return css`
            margin-top: 8px;
          `;
        }

        return css`
          margin-top: 8px;
          border-radius: 16px 16px 16px 8px;

          ${props.theme.media.tablet} {
            border-radius: 16px;
          }
        `;
      }

      if (props.nextSameUser) {
        if (props.type === 'info') {
          return css`
            margin: 8px 0;
          `;
        }

        return css`
          border-radius: 8px 16px 16px;

          ${props.theme.media.tablet} {
            border-radius: 16px 16px 16px 8px;
          }
        `;
      }
      return css`
        border-radius: 16px 16px 16px 8px;
      `;
    }

    if (props.type === 'info') {
      return css`
        margin: 8px 0;
      `;
    }

    return css`
      border-radius: 16px 16px 8px;
      ${props.theme.media.tablet} {
        border-radius: 16px 16px 16px 8px;
      }
    `;
  }}
`;

interface ISMessageText {
  type?: string;
  mine?: boolean;
}

const SMessageText = styled(Text)<ISMessageText>`
  line-height: 20px;
  max-width: 80vw;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  color: ${(props) => {
    if (props.type === 'info') {
      return props.theme.colorsThemed.text.tertiary;
    }

    if (props.mine && props.theme.name === 'light') {
      return props.theme.colors.white;
    }

    return props.theme.colorsThemed.text.primary;
  }};

  ${({ theme }) => theme.media.tablet} {
    max-width: 412px;
  }
`;

interface ISUserAvatar {
  mine?: boolean;
}
const SUserAvatar = styled(UserAvatar)<ISUserAvatar>`
  position: absolute;
  bottom: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  padding: 0;
  display: none;
  left: 0;

  ${(props) => props.theme.media.tablet} {
    display: block;
  }
`;
