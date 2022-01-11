/* eslint-disable no-nested-ternary */
import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import styled, { css, useTheme } from 'styled-components';

import Text from '../atoms/Text';
import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';
import UserAvatar from './UserAvatar';

import { formatNumber } from '../../utils/format';
import { useAppSelector } from '../../redux-store/store';

import iconLight1 from '../../public/images/svg/numbers/1_light.svg';
import iconLight2 from '../../public/images/svg/numbers/2_light.svg';
import iconLight3 from '../../public/images/svg/numbers/3_light.svg';
import iconLight4 from '../../public/images/svg/numbers/4_light.svg';
import iconLight5 from '../../public/images/svg/numbers/5_light.svg';
import iconLight6 from '../../public/images/svg/numbers/6_light.svg';
import iconLight7 from '../../public/images/svg/numbers/7_light.svg';
import iconLight8 from '../../public/images/svg/numbers/8_light.svg';
import iconLight9 from '../../public/images/svg/numbers/9_light.svg';
import iconLight10 from '../../public/images/svg/numbers/10_light.svg';
import iconDark1 from '../../public/images/svg/numbers/1_dark.svg';
import iconDark2 from '../../public/images/svg/numbers/2_dark.svg';
import iconDark3 from '../../public/images/svg/numbers/3_dark.svg';
import iconDark4 from '../../public/images/svg/numbers/4_dark.svg';
import iconDark5 from '../../public/images/svg/numbers/5_dark.svg';
import iconDark6 from '../../public/images/svg/numbers/6_dark.svg';
import iconDark7 from '../../public/images/svg/numbers/7_dark.svg';
import iconDark8 from '../../public/images/svg/numbers/8_dark.svg';
import iconDark9 from '../../public/images/svg/numbers/9_dark.svg';
import iconDark10 from '../../public/images/svg/numbers/10_dark.svg';
import moreIcon from '../../public/images/svg/icons/filled/More.svg';

// Utils
import switchPostType from '../../utils/switchPostType';
import { SocketContext } from '../../contexts/socketContext';
import { ChannelsContext } from '../../contexts/channelsContext';
import CardTimer from '../atoms/CardTimer';

const NUMBER_ICONS: any = {
  light: {
    1: iconLight1,
    2: iconLight2,
    3: iconLight3,
    4: iconLight4,
    5: iconLight5,
    6: iconLight6,
    7: iconLight7,
    8: iconLight8,
    9: iconLight9,
    10: iconLight10,
  },
  dark: {
    1: iconDark1,
    2: iconDark2,
    3: iconDark3,
    4: iconDark4,
    5: iconDark5,
    6: iconDark6,
    7: iconDark7,
    8: iconDark8,
    9: iconDark9,
    10: iconDark10,
  },
};

interface ICard {
  item: newnewapi.Post;
  type?: 'inside' | 'outside';
  index: number;
  width?: string;
  height?: string;
}

export const Card: React.FC<ICard> = ({
  item,
  type,
  index,
  width,
  height,
}) => {
  const { t } = useTranslation('home');
  const theme = useTheme();
  const router = useRouter();
  const {
    resizeMode,
  } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Socket
  const socketConnection = useContext(SocketContext);
  const {
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  const {
    ref: cardRef,
    inView,
  } = useInView({
    threshold: 0.55,
  });
  const videoRef = useRef<HTMLVideoElement>();

  const [postParsed, typeOfPost] = switchPostType(item);
  // Live updates stored in local state
  const [totalAmount, setTotalAmount] = useState<number>(() => (typeOfPost === 'ac'
    ? (postParsed as newnewapi.Auction).totalAmount?.usdCents ?? 0
    : 0));
  const [totalVotes, setTotalVotes] = useState<number>(() => (typeOfPost === 'mc'
    ? (postParsed as newnewapi.MultipleChoice).totalVotes ?? 0
    : 0));
  const [currentBackerCount, setCurrentBackerCount] = useState<number>(() => (typeOfPost === 'cf'
    ? (postParsed as newnewapi.Crowdfunding).currentBackerCount ?? 0
    : 0));

  const handleUserClick = (username: string) => {
    router.push(`/u/${username}`);
  };
  const handleMoreClick = () => {
    router.push('/post-detailed');
  };
  const handleBidClick = () => {
    router.push('/post-detailed');
  };

  useEffect(() => {
    if (inView) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [inView]);

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    addChannel(postParsed.postUuid);

    return () => {
      removeChannel(postParsed.postUuid);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to post updates event
  useEffect(() => {
    const handlerSocketPostUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostUpdated.decode(arr);

      if (!decoded) return;
      const [decodedParsed] = switchPostType(
        decoded.post as newnewapi.IPost);
      if (decodedParsed.postUuid === postParsed.postUuid) {
        if (typeOfPost === 'ac') {
          setTotalAmount(decoded.post?.auction?.totalAmount?.usdCents!!);
        }
        if (typeOfPost === 'cf') {
          setCurrentBackerCount(decoded.post?.crowdfunding?.currentBackerCount!!);
        }
        if (typeOfPost === 'mc') {
          setTotalVotes(decoded.post?.multipleChoice?.totalVotes!!);
        }
      }
    };

    if (socketConnection) {
      socketConnection.on('PostUpdated', handlerSocketPostUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('PostUpdated', handlerSocketPostUpdated);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  if (type === 'inside') {
    return (
      <SWrapper
        ref={cardRef}
        index={index}
        width={width}
      >
        <SContent>
          {!isMobile && (
            <SNumberImageHolder index={index}>
              <InlineSVG
                svg={NUMBER_ICONS[theme.name][index]}
                width="100%"
                height="100%"
              />
            </SNumberImageHolder>
          )}
          <SImageHolder index={index}>
            <video
              // src={postParsed.announcement?.thumbnailUrl as string}
              // src="/video/mock/mock_video_1.mp4"
              // Temp
              src={
                postParsed.announcement?.thumbnailUrl
                  ? postParsed.announcement?.thumbnailUrl
                  : (
                    index % 2 === 0 ? '/video/mock/mock_video_1.mp4' : '/video/mock/mock_video_2.mp4'
                  )
                }
              ref={(el) => {
                videoRef.current = el!!;
              }}
              // NB! Might use this one to avoid waisting user's resources
              // and use a poster here NB!
              // preload="none"
              loop
              muted
              playsInline
            />
            <SImageMask />
            <STopContent>
              <SButtonIcon
                iconOnly
                id="showMore"
                view="transparent"
                onClick={handleMoreClick}
              >
                <InlineSVG
                  svg={moreIcon}
                  fill={theme.colors.white}
                  width="20px"
                  height="20px"
                />
              </SButtonIcon>
            </STopContent>
            <SBottomContent>
              <SUserAvatar
                withClick
                avatarUrl={postParsed.creator?.avatarUrl!!}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserClick(postParsed.creator?.username!!);
                }}
              />
              <SText variant={3} weight={600}>
                {postParsed.title}
              </SText>
            </SBottomContent>
          </SImageHolder>
        </SContent>
      </SWrapper>
    );
  }

  return (
    <SWrapperOutside
      ref={cardRef}
      width={width}
    >
      <SImageBG
        id="backgroundPart"
        height={height}
      >
        <SImageHolderOutside id="animatedPart">
          <video
            // src={postParsed.announcement?.thumbnailUrl as string}
            // src="/video/mock/mock_video_1.mp4"
            // Temp
            src={
              postParsed.announcement?.thumbnailUrl
                ? postParsed.announcement?.thumbnailUrl
                : (
                  index % 2 === 0 ? '/video/mock/mock_video_1.mp4' : '/video/mock/mock_video_2.mp4'
                )
              }
            ref={(el) => {
              videoRef.current = el!!;
            }}
            // NB! Might use this one to avoid waisting user's resources
            // and use a poster here NB!
            // preload="none"
            loop
            muted
            playsInline
          />
          <STopContent>
            <SButtonIcon
              iconOnly
              id="showMore"
              view="transparent"
              onClick={handleMoreClick}
            >
              <InlineSVG
                svg={moreIcon}
                fill={theme.colors.white}
                width="20px"
                height="20px"
              />
            </SButtonIcon>
          </STopContent>
        </SImageHolderOutside>
      </SImageBG>
      <SBottomContentOutside>
        <SBottomStart>
          <SUserAvatar
            avatarUrl={postParsed?.creator?.avatarUrl!!}
            withClick
            onClick={(e) => {
              e.stopPropagation();
              handleUserClick(postParsed.creator?.username!!);
            }}
          />
          <STextOutside variant={3} weight={600}>
            {postParsed.title}
          </STextOutside>
        </SBottomStart>
        <SBottomEnd
          type={typeOfPost}
        >
          <SButton
            withDim
            withShrink
            view={typeOfPost === 'cf' ? 'primaryProgress' : 'primary'}
            onClick={handleBidClick}
            cardType={typeOfPost}
            progress={typeOfPost === 'cf' ? (
              Math.floor((currentBackerCount * 100)
              / (postParsed as newnewapi.Crowdfunding).targetBackerCount)
            ) : 0}
            withProgress={typeOfPost === 'cf'}
          >
            {t(`button-card-${typeOfPost}`, {
              votes: totalVotes,
              total: formatNumber(
                (postParsed as newnewapi.Crowdfunding).targetBackerCount ?? 0,
                true,
              ),
              backed: formatNumber(
                currentBackerCount ?? 0,
                true,
              ),
              amount: `$${formatNumber((totalAmount / 100) ?? 0, true)}`,
            })}
          </SButton>
          <CardTimer
            timestampSeconds={new Date((postParsed.expiresAt?.seconds as number) * 1000).getTime()}
          />
        </SBottomEnd>
      </SBottomContentOutside>
    </SWrapperOutside>
  );
};

export default Card;

Card.defaultProps = {
  type: 'outside',
  width: '',
  height: '',
};

interface ISWrapper {
  index?: number;
  width?: string;
}

const SWrapper = styled.div<ISWrapper>`
  width: 254px;
  height: 382px;
  cursor: pointer;
  display: flex;
  position: relative;
  align-items: flex-end;
  flex-direction: row;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    width: ${(props) => {
    if (props.index === 1) {
      return '312px';
    }

    if (props.index === 10) {
      return '412px';
    }

    return '342px';
  }};
    height: 320px;
  }

  ${(props) => props.theme.media.laptop} {
    width: ${(props) => {
    if (props.index === 1) {
      return '376px';
    }

    if (props.index === 10) {
      return '496px';
    }

    return '406px';
  }};
    height: 384px;
  }

  ${(props) => props.theme.media.laptopL} {
    width: 25vw;
    height: unset;

    :hover {
      #showMore {
        opacity: 1;
      }
    }
  }

  ${(props) => props.theme.media.desktop} {
    width: 20vw;
  }
`;

const SContent = styled.div`
  ${(props) => props.theme.media.laptopL} {
    width: 100%;
    padding: 50% 0;
  }
`;

const SNumberImageHolder = styled.div<ISWrapper>`
  width: 188px;
  height: 240px;
  position: relative;

  ${(props) => props.theme.media.tablet} {
    width: ${(props) => {
    if (props.index === 10) {
      return '306px';
    }

    return '188px';
  }};
    height: 240px;
  }

  ${(props) => props.theme.media.laptop} {
    width: ${(props) => {
    if (props.index === 10) {
      return '358px';
    }

    return '220px';
  }};
    height: 280px;
  }

  ${(props) => props.theme.media.laptopL} {
    left: 0;
    bottom: 0;
    height: 70%;
    position: absolute;
    width: ${(props) => {
    if (props.index === 10) {
      return '90%';
    }

    return '55%';
  }};
  }
`;

const SImageHolder = styled.div<ISWrapper>`
  top: 0;
  right: 0;
  width: 254px;
  height: 100%;
  display: flex;
  padding: 16px;
  z-index: 2;
  overflow: hidden;
  position: absolute;
  flex-direction: column;
  justify-content: space-between;
  border-radius: ${(props) => props.theme.borderRadius.medium};

  ${(props) => props.theme.media.tablet} {
    width: 212px;
    padding: 12px;
  }

  ${(props) => props.theme.media.laptop} {
    width: 256px;
  }

  ${(props) => props.theme.media.laptopL} {
    width: ${(props) => {
    if (props.index === 1) {
      return '70%';
    }

    if (props.index === 10) {
      return '55%';
    }

    return '65%';
  }};
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
`;

const SImageMask = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  position: absolute;
  background: linear-gradient(180deg, rgba(11, 10, 19, 0) 49.87%, rgba(11, 10, 19, 0.8) 100%);
  border-radius: ${(props) => props.theme.borderRadius.medium};
  pointer-events: none;
`;

const STopContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const SBottomContent = styled.div`
  z-index: 2;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SText = styled(Text)`
  color: ${(props) => props.theme.colors.white};
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  margin-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SWrapperOutside = styled.div<ISWrapper>`
  width: ${(props) => props.width};
  cursor: pointer;
  display: flex;
  position: relative;
  flex-direction: column;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    :hover {
      #animatedPart {
        transform: translateY(-10px);
      }
    }
  }

  ${(props) => props.theme.media.laptop} {
    :hover {
      #showMore {
        opacity: 1;
      }
    }
  }
`;

interface ISImageBG {
  height?: string;
}

const SImageBG = styled.div<ISImageBG>`
  width: 100%;
  padding: 75% 0;
  position: relative;

  ${(props) => props.theme.media.tablet} {
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SImageHolderOutside = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  padding: 16px;
  position: absolute;
  transition: all ease 0.5s;

  ${(props) => props.theme.media.tablet} {
    padding: 12px;
    overflow: hidden;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
`;

const SBottomContentOutside = styled.div`
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    padding: 14px 0 0;
  }
`;

const STextOutside = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  margin-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SBottomStart = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 14px;
  }
`;

interface ISBottomEnd {
  type: 'ac' | 'mc' | 'cf',
}

const SBottomEnd = styled.div<ISBottomEnd>`
  display: flex;
  align-items: ${(props) => (props.type === 'cf' ? 'flex-end' : 'center')};
  flex-direction: ${(props) => (props.type === 'cf' ? 'column' : 'row')};
  justify-content: space-between;

  ${(props) => props.type === 'cf' && css`
    button {
      width: 100%;
    }

    p {
      margin-top: 16px;
    }

    ${props.theme.media.tablet} {
      p {
        margin-top: 12px;
      }
    }
  `}
`;

interface ISButtonSpan {
  cardType: string,
}

const SButton = styled(Button)<ISButtonSpan>`
  padding: 12px;
  border-radius: 12px;

  span {
    font-size: 12px;
    font-weight: 700;
    line-height: 16px;

    ${(props) => (props.cardType === 'cf' ? css`
      width: 100%;
      text-align: left;
    ` : '')}
  }

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;
  }
`;

const SUserAvatar = styled(UserAvatar)`
  ${(props) => props.theme.media.tablet} {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }
`;

const SButtonIcon = styled(Button)`
  padding: 8px;
  border-radius: 12px;

  ${(props) => props.theme.media.laptop} {
    opacity: 0;
    transition: all ease 0.5s;
  }
`;
