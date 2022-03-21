import React, { useRef, useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import TextArea from '../../../atoms/creation/TextArea';
import InlineSVG from '../../../atoms/InlineSVG';
import GradientMask from '../../../atoms/GradientMask';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';

import sendIcon from '../../../../public/images/svg/icons/filled/Send.svg';
import chevronLeftIcon from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';

import { SCROLL_TO_FIRST_MESSAGE } from '../../../../constants/timings';

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [collection, setCollection] = useState([
    {
      id: '1',
      message: 'Yeah, I know🙈 But I think it’s awesome idea!',
      mine: true,
      date: moment(),
    },
    {
      id: '2',
      message: 'Hiii, Lance 😃',
      mine: true,
      date: moment(),
    },
    {
      id: '3',
      message: 'I don’t beleive...',
      mine: false,
      date: moment(),
    },
    {
      id: '4',
      message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
      mine: false,
      date: moment(),
    },
    {
      id: '5',
      message: 'Hey, Annie 👋',
      mine: false,
      date: moment(),
    },
    {
      id: '6',
      message: 'Hey there, Ya, me too 😏',
      mine: false,
      date: moment().subtract(2, 'days'),
    },
    {
      id: '7',
      message: 'Weeelcome 🎉 Happy that you joined NewNew!',
      mine: true,
      date: moment().subtract(2, 'days'),
    },
    {
      id: '8',
      message: 'Yeah, I know🙈 But I think it’s awesome idea!',
      mine: true,
      date: moment().subtract(3, 'days'),
    },
    {
      id: '9',
      message: 'Hiii, Lance 😃',
      mine: true,
      date: moment().subtract(3, 'days'),
    },
    {
      id: '10',
      message: 'I don’t beleive...',
      mine: false,
      date: moment().subtract(3, 'days'),
    },
    {
      id: '11',
      message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
      mine: false,
      date: moment().subtract(3, 'days'),
    },
    {
      id: '12',
      message: 'Hey, Annie 👋',
      mine: false,
      date: moment().subtract(3, 'days'),
    },
    {
      id: '13',
      message: 'Hey there, Ya, me too 😏',
      mine: false,
      date: moment().subtract(3, 'days'),
    },
    {
      id: '14',
      message: 'Weeelcome 🎉 Happy that you joined NewNew!',
      mine: true,
      date: moment().subtract(3, 'days'),
    },
  ]);
  const theme = useTheme();
  const { t } = useTranslation('creator');
  const router = useRouter();
  const scrollRef: any = useRef();

  const user = useAppSelector((state) => state.user);
  const handleChange = useCallback((id, value) => {
    setMessage(value);
  }, []);
  const handleUserClick = useCallback(() => {}, []);
  const handleGoBack = useCallback(() => {
    router.push('/creator/dashboard?tab=chat');
  }, [router]);

  const handleSubmit = useCallback(() => {
    const newItem = {
      id: (collection.length + 1).toString(),
      mine: true,
      date: moment(),
      message,
    };
    setMessage('');
    setCollection([newItem, ...collection]);
  }, [message, collection]);
  const renderMessage = useCallback(
    (item, index) => {
      const prevElement = collection[index - 1];
      const nextElement = collection[index + 1];

      const content = (
        <SMessage id={index === 0 ? 'first-element' : `message-${index}`} key={`message-${item.id}`} mine={item.mine}>
          <SMessageContent
            mine={item.mine}
            prevSameUser={prevElement?.mine === item.mine}
            nextSameUser={nextElement?.mine === item.mine}
          >
            <SMessageText mine={item.mine} weight={600} variant={3}>
              {item.message}
            </SMessageText>
          </SMessageContent>
        </SMessage>
      );

      if (moment(item.date).format('DD.MM.YYYY') !== moment(nextElement?.date).format('DD.MM.YYYY')) {
        let date = moment(item.date).format('MMM DD');

        if (date === moment().format('MMM DD')) {
          date = t('chat.today');
        }

        return (
          <>
            {content}
            <SMessage key={`message-date-${moment(item.date).format('DD.MM.YYYY')}`} type="info">
              <SMessageContent
                type="info"
                prevSameUser={prevElement?.mine === item.mine}
                nextSameUser={nextElement?.mine === item.mine}
              >
                <SMessageText type="info" weight={600} variant={3}>
                  {date}
                </SMessageText>
              </SMessageContent>
            </SMessage>
          </>
        );
      }

      return content;
    },
    [collection, t]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef, true);

  useEffect(() => {
    scroller.scrollTo('first-element', {
      smooth: 'easeInOutQuart',
      duration: SCROLL_TO_FIRST_MESSAGE,
      containerId: 'messagesScrollContainer',
    });
  }, [collection.length]);

  return (
    <SContainer>
      <STopPart>
        <SInlineSVG
          clickable
          svg={chevronLeftIcon}
          fill={theme.colorsThemed.text.secondary}
          width="24px"
          height="24px"
          onClick={handleGoBack}
        />
        <SUserAvatar withClick onClick={handleUserClick} avatarUrl={user.userData?.avatarUrl} />
        <SUserDescription>
          <SUserNickName variant={3} weight={600}>
            {user.userData?.nickname}
          </SUserNickName>
          <SUserName variant={2} weight={600}>
            {user.userData?.username}
          </SUserName>
        </SUserDescription>
      </STopPart>
      <SCenterPart id="messagesScrollContainer" ref={scrollRef}>
        {collection.map(renderMessage)}
      </SCenterPart>
      <SBottomPart>
        <STextArea>
          <TextArea value={message} onChange={handleChange} placeholder={t('chat.placeholder')} />
        </STextArea>
        <SButton withShadow view={message ? 'primaryGrad' : 'secondary'} onClick={handleSubmit} disabled={!message}>
          <SInlineSVG
            svg={sendIcon}
            fill={message ? theme.colors.white : theme.colorsThemed.text.primary}
            width="24px"
            height="24px"
          />
        </SButton>
      </SBottomPart>
      <GradientMask positionTop active={showTopGradient} />
      <GradientMask active={showBottomGradient} />
    </SContainer>
  );
};

export default Chat;

const SContainer = styled.div`
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
`;

const STopPart = styled.div`
  display: flex;
  padding: 0 24px;
  align-items: center;
  flex-direction: row;
`;

const SCenterPart = styled.div`
  gap: 8px;
  flex: 1;
  margin: 24px 0;
  padding: 0 24px;
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
`;

const SBottomPart = styled.div`
  display: flex;
  padding: 0 24px;
  align-items: flex-end;
  flex-direction: row;
`;

const STextArea = styled.div`
  flex: 1;
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
`;

const SButton = styled(Button)`
  padding: 12px;
  margin-left: 12px;

  &:disabled {
    background: ${(props) =>
      props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary};
  }
`;

const SUserAvatar = styled(UserAvatar)`
  margin: 0 12px;
`;

const SUserDescription = styled.div`
  display: flex;
  flex-direction: column;
`;

const SUserNickName = styled(Text)`
  margin-bottom: 2px;
`;

const SUserName = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

interface ISMessage {
  type?: string;
  mine?: boolean;
}

const SMessage = styled.div<ISMessage>`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => {
    if (props.type === 'info') {
      return 'center';
    }

    if (props.mine) {
      return 'flex-end';
    }

    return 'flex-start';
  }};
`;

interface ISMessageContent {
  type?: string;
  mine?: boolean;
  prevSameUser?: boolean;
  nextSameUser?: boolean;
}

const SMessageContent = styled.div<ISMessageContent>`
  padding: ${(props) => (props.type === 'info' ? 0 : '12px 16px')};
  background: ${(props) => {
    if (props.type === 'info') {
      return 'transparent';
    }

    if (props.mine) {
      return props.theme.colorsThemed.accent.blue;
    }

    return props.theme.colorsThemed.background.tertiary;
  }};
  ${(props) => {
    if (props.mine) {
      if (props.prevSameUser) {
        if (props.nextSameUser) {
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
        `;
      }
    } else {
      if (props.prevSameUser) {
        if (props.nextSameUser) {
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
        `;
      }

      if (props.nextSameUser) {
        if (props.type === 'info') {
          return css`
            margin: 8px 0;
          `;
        }

        return css`
          border-radius: 8px 16px 16px 16px;
        `;
      }
    }

    if (props.type === 'info') {
      return css`
        margin: 8px 0;
      `;
    }

    return css`
      border-radius: 16px;
    `;
  }}
`;

interface ISMessageText {
  type?: string;
  mine?: boolean;
}

const SMessageText = styled(Text)<ISMessageText>`
  color: ${(props) => {
    if (props.type === 'info') {
      return props.theme.colorsThemed.text.tertiary;
    }

    if (props.mine && props.theme.name === 'light') {
      return props.theme.colors.white;
    }

    return props.theme.colorsThemed.text.primary;
  }};
`;
