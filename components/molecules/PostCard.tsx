/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import switchPostStatus from '../../utils/switchPostStatus';
import PostCardEllipseMenu from './PostCardEllipseMenu';
import getDisplayname from '../../utils/getDisplayname';
import ReportModal, { ReportData } from './chat/ReportModal';
import { reportPost } from '../../api/endpoints/report';
import PostCardEllipseModal from './PostCardEllipseModal';

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
  shouldStop?: boolean;
  handleRemovePostFromState?: () => void;
}

export const PostCard: React.FC<ICard> = React.memo(
  ({
    item,
    type,
    index,
    width,
    height,
    shouldStop,
    handleRemovePostFromState,
  }) => {
    const { t } = useTranslation('home');
    const theme = useTheme();
    const router = useRouter();
    const user = useAppSelector((state) => state.user);
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    // Check if video is ready to avoid errors
    const [videoReady, setVideoReady] = useState(false);

    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

    const { ref: cardRef, inView } = useInView({
      threshold: 0.55,
    });
    const videoRef = useRef<HTMLVideoElement>();

    const [postParsed, typeOfPost] = switchPostType(item);
    // Live updates stored in local state
    const [totalAmount, setTotalAmount] = useState<number>(() =>
      typeOfPost === 'ac'
        ? (postParsed as newnewapi.Auction).totalAmount?.usdCents ?? 0
        : 0
    );
    const [totalVotes, setTotalVotes] = useState<number>(() =>
      typeOfPost === 'mc'
        ? (postParsed as newnewapi.MultipleChoice).totalVotes ?? 0
        : 0
    );
    const [currentBackerCount, setCurrentBackerCount] = useState<number>(() =>
      typeOfPost === 'cf'
        ? (postParsed as newnewapi.Crowdfunding).currentBackerCount ?? 0
        : 0
    );

    const timestampSeconds = useMemo(() => {
      if (postParsed.expiresAt?.seconds) {
        return (postParsed.expiresAt.seconds as number) * 1000;
      }

      return 0;
    }, [postParsed.expiresAt?.seconds]);

    const [thumbnailUrl, setThumbnailUrl] = useState(
      postParsed.announcement?.thumbnailUrl ?? ''
    );

    const handleUserClick = (username: string) => {
      router.push(`/${username}`);
    };

    // Ellipse menu
    const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

    const handleMoreClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.preventDefault();
      e.stopPropagation();

      setIsEllipseMenuOpen(true);
    };

    const handleEllipseMenuClose = () => setIsEllipseMenuOpen(false);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleReportOpen = useCallback(() => {
      if (!user.loggedIn) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            `${process.env.NEXT_PUBLIC_APP_URL}/post/${postParsed.postUuid}`
          )}`
        );
        return;
      }
      setIsReportModalOpen(true);
    }, [user.loggedIn, router, postParsed.postUuid]);

    const handleReportClose = useCallback(() => {
      setIsReportModalOpen(false);
    }, []);

    const handleReportSubmit = useCallback(
      async ({ reasons, message }: ReportData) => {
        if (postParsed) {
          await reportPost(postParsed.postUuid, reasons, message).catch(
            (e: any) => console.error(e)
          );
        }
      },
      [postParsed]
    );

    const handleBidClick = () => {};

    useEffect(() => {
      const handleCanplay = () => {
        setVideoReady(true);
      };

      videoRef.current?.addEventListener('canplay', handleCanplay);
      videoRef.current?.addEventListener('loadedmetadata', handleCanplay);

      return () => {
        videoRef.current?.removeEventListener('canplay', handleCanplay);
        videoRef.current?.removeEventListener('loadedmetadata', handleCanplay);
      };
    }, [inView, thumbnailUrl]);

    useEffect(() => {
      try {
        if (videoReady) {
          if (inView && !shouldStop) {
            try {
              videoRef.current?.play();
            } catch (err) {
              // NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
              // Many browsers prevent autoplay
              console.log(err);
            }
          } else {
            videoRef.current?.pause();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, [inView, videoReady, shouldStop, thumbnailUrl]);

    // Increment channel subs after mounting
    // Decrement when unmounting
    useEffect(() => {
      addChannel(postParsed.postUuid, {
        postUpdates: {
          postUuid: postParsed.postUuid,
        },
      });

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
        const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
        if (decodedParsed.postUuid === postParsed.postUuid) {
          if (
            typeOfPost === 'ac' &&
            decoded.post?.auction?.totalAmount?.usdCents
          ) {
            setTotalAmount(decoded.post.auction.totalAmount?.usdCents);
          }
          if (
            typeOfPost === 'cf' &&
            decoded.post?.crowdfunding?.currentBackerCount
          ) {
            setCurrentBackerCount(decoded.post.crowdfunding.currentBackerCount);
          }
          if (typeOfPost === 'mc' && decoded.post?.multipleChoice?.totalVotes) {
            setTotalVotes(decoded.post.multipleChoice.totalVotes);
          }
        }
      };

      const handlerSocketThumbnailUpdated = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostThumbnailUpdated.decode(arr);

        if (
          !decoded ||
          !decoded.thumbnailUrl ||
          decoded.postUuid !== postParsed.postUuid
        )
          return;

        // Wait to make sure that cloudfare cache has been invalidated
        setTimeout(() => {
          fetch(decoded.thumbnailUrl)
            .then((res) => res.blob())
            .then((blobFromFetch) => {
              const reader = new FileReader();

              reader.onloadend = () => {
                if (!reader.result) return;

                const byteCharacters = atob(
                  reader.result.slice(
                    (reader.result as string).indexOf(',') + 1
                  ) as string
                );

                const byteNumbers = new Array(byteCharacters.length);

                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);

                setThumbnailUrl(url);
              };

              reader.readAsDataURL(blobFromFetch);
            })
            .catch((err) => {
              console.error(err);
            });
        }, 5000);
      };

      if (socketConnection) {
        socketConnection.on('PostUpdated', handlerSocketPostUpdated);
        socketConnection.on(
          'PostThumbnailUpdated',
          handlerSocketThumbnailUpdated
        );
      }

      return () => {
        if (socketConnection && socketConnection.connected) {
          socketConnection.off('PostUpdated', handlerSocketPostUpdated);
          socketConnection.off(
            'PostThumbnailUpdated',
            handlerSocketThumbnailUpdated
          );
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection]);

    if (type === 'inside') {
      return (
        <SWrapper ref={cardRef} index={index} width={width}>
          <SContent>
            {!isMobile && (
              <SNumberImageHolder index={index}>
                <InlineSVG
                  svg={NUMBER_ICONS[theme.name][index]}
                  width='100%'
                  height='100%'
                />
              </SNumberImageHolder>
            )}
            <SImageHolder index={index}>
              <img
                className='thumnailHolder'
                src={postParsed.announcement?.thumbnailImageUrl ?? ''}
                alt='Post'
              />
              <video
                ref={(el) => {
                  videoRef.current = el!!;
                }}
                key={thumbnailUrl}
                loop
                muted
                playsInline
              >
                <source
                  key={thumbnailUrl}
                  src={thumbnailUrl}
                  type='video/mp4'
                />
              </video>
              <SImageMask />
              <STopContent>
                <SButtonIcon
                  iconOnly
                  id='showMore'
                  view='transparent'
                  onClick={handleMoreClick}
                >
                  <InlineSVG
                    svg={moreIcon}
                    fill={theme.colors.white}
                    width='20px'
                    height='20px'
                  />
                </SButtonIcon>
                {!isMobile && (
                  <PostCardEllipseMenu
                    postUuid={postParsed.postUuid}
                    postType={typeOfPost as string}
                    isVisible={isEllipseMenuOpen}
                    postCreator={postParsed.creator as newnewapi.User}
                    handleReportOpen={handleReportOpen}
                    onClose={handleEllipseMenuClose}
                  />
                )}
              </STopContent>
              <SBottomContent>
                <SUserAvatar
                  withClick
                  avatarUrl={
                    postParsed.creator?.avatarUrl
                      ? postParsed.creator.avatarUrl
                      : ''
                  }
                  onClick={(e: any) => {
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
          {postParsed?.creator && isReportModalOpen && (
            <ReportModal
              show={isReportModalOpen}
              reportedDisplayname={getDisplayname(postParsed?.creator)}
              onSubmit={handleReportSubmit}
              onClose={handleReportClose}
            />
          )}
          {isMobile && (
            <PostCardEllipseModal
              isOpen={isEllipseMenuOpen}
              zIndex={11}
              postUuid={postParsed.postUuid}
              postType={typeOfPost as string}
              postCreator={postParsed.creator as newnewapi.User}
              handleReportOpen={handleReportOpen}
              onClose={handleEllipseMenuClose}
            />
          )}
        </SWrapper>
      );
    }

    return (
      <SWrapperOutside ref={cardRef} width={width}>
        <SImageBG id='backgroundPart' height={height}>
          <SImageHolderOutside id='animatedPart'>
            <img
              className='thumnailHolder'
              src={postParsed.announcement?.thumbnailImageUrl ?? ''}
              alt='Post'
            />
            <video
              ref={(el) => {
                videoRef.current = el!!;
              }}
              key={thumbnailUrl}
              loop
              muted
              playsInline
            >
              <source key={thumbnailUrl} src={thumbnailUrl} type='video/mp4' />
            </video>
            <STopContent>
              <SButtonIcon
                iconOnly
                id='showMore'
                view='transparent'
                onClick={handleMoreClick}
              >
                <InlineSVG
                  svg={moreIcon}
                  fill={theme.colors.white}
                  width='20px'
                  height='20px'
                />
              </SButtonIcon>
              {!isMobile && (
                <PostCardEllipseMenu
                  postUuid={postParsed.postUuid}
                  postType={typeOfPost as string}
                  isVisible={isEllipseMenuOpen}
                  postCreator={postParsed.creator as newnewapi.User}
                  handleReportOpen={handleReportOpen}
                  handleRemovePostFromState={
                    handleRemovePostFromState ?? undefined
                  }
                  onClose={handleEllipseMenuClose}
                />
              )}
            </STopContent>
          </SImageHolderOutside>
        </SImageBG>
        <SBottomContentOutside>
          <SBottomStart hasEnded={Date.now() > timestampSeconds}>
            <SUserAvatarOutside
              avatarUrl={
                postParsed?.creator?.avatarUrl
                  ? postParsed.creator.avatarUrl
                  : ''
              }
              withClick
              onClick={(e: any) => {
                e.stopPropagation();
                handleUserClick(postParsed.creator?.username!!);
              }}
            />
            <SUsername variant={2}>
              {Date.now() > timestampSeconds
                ? postParsed.creator?.nickname &&
                  postParsed.creator?.nickname?.length > (isMobile ? 7 : 5)
                  ? `${postParsed.creator?.nickname?.substring(
                      0,
                      isMobile ? 5 : 3
                    )}...`
                  : postParsed.creator?.nickname
                : postParsed.creator?.nickname &&
                  postParsed.creator?.nickname?.length > (isMobile ? 18 : 9)
                ? `${postParsed.creator?.nickname?.substring(
                    0,
                    isMobile ? 15 : 9
                  )}...`
                : postParsed.creator?.nickname}
            </SUsername>
            <CardTimer timestampSeconds={timestampSeconds} />
          </SBottomStart>
          <STextOutside variant={3} weight={600}>
            {postParsed.title}
          </STextOutside>
          <SBottomEnd type={typeOfPost}>
            {totalVotes > 0 || totalAmount > 0 || currentBackerCount > 0 ? (
              totalVotes === 1 && typeOfPost === 'mc' ? (
                <SButton
                  withDim
                  withShrink
                  view='primary'
                  onClick={handleBidClick}
                  cardType={typeOfPost}
                >
                  {t(`button-card-singular-${typeOfPost}`, {
                    votes: formatNumber(totalVotes ?? 0, true),
                    total: formatNumber(
                      (postParsed as newnewapi.Crowdfunding)
                        .targetBackerCount ?? 0,
                      true
                    ),
                    backed: formatNumber(currentBackerCount ?? 0, true),
                    amount: `$${formatNumber(totalAmount / 100 ?? 0, true)}`,
                  })}
                </SButton>
              ) : (
                <SButton
                  withDim
                  withShrink
                  view={typeOfPost === 'cf' ? 'primaryProgress' : 'primary'}
                  onClick={handleBidClick}
                  cardType={typeOfPost}
                  progress={
                    typeOfPost === 'cf'
                      ? Math.floor(
                          (currentBackerCount * 100) /
                            (postParsed as newnewapi.Crowdfunding)
                              .targetBackerCount
                        )
                      : 0
                  }
                  withProgress={typeOfPost === 'cf'}
                >
                  {t(`button-card-${typeOfPost}`, {
                    votes: formatNumber(totalVotes ?? 0, true),
                    total: formatNumber(
                      (postParsed as newnewapi.Crowdfunding)
                        .targetBackerCount ?? 0,
                      true
                    ),
                    backed: formatNumber(currentBackerCount ?? 0, true),
                    amount: `$${formatNumber(totalAmount / 100 ?? 0, true)}`,
                  })}
                </SButton>
              )
            ) : (
              <SButtonFirst withShrink onClick={handleBidClick}>
                {switchPostStatus(typeOfPost, postParsed.status) === 'voting'
                  ? t(`button-card-first-${typeOfPost}`)
                  : t(`button-card-see-${typeOfPost}`)}
              </SButtonFirst>
            )}
          </SBottomEnd>
        </SBottomContentOutside>
        {postParsed?.creator && isReportModalOpen && (
          <ReportModal
            show={isReportModalOpen}
            reportedDisplayname={getDisplayname(postParsed?.creator)}
            onSubmit={handleReportSubmit}
            onClose={handleReportClose}
          />
        )}
        {isMobile && (
          <PostCardEllipseModal
            isOpen={isEllipseMenuOpen}
            zIndex={11}
            postUuid={postParsed.postUuid}
            postType={typeOfPost as string}
            postCreator={postParsed.creator as newnewapi.User}
            handleReportOpen={handleReportOpen}
            onClose={handleEllipseMenuClose}
          />
        )}
      </SWrapperOutside>
    );
  }
);

export default PostCard;

PostCard.defaultProps = {
  type: 'outside',
  width: '',
  height: '',
  shouldStop: false,
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
    :hover {
      #showMore {
        opacity: 1;
      }
    }
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

  ${(props) => props.theme.media.tablet} {
    left: 10px;
    bottom: 30px;
    height: 70%;
    position: absolute;
    width: ${(props) => {
      if (props.index === 10) {
        return '74%';
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

  video {
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .thumnailHolder {
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  ${(props) => props.theme.media.tablet} {
    width: 212px;
    padding: 12px;

    border: 1.5px solid;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines1};
    padding: 18px;

    background-color: ${({ theme }) => theme.colorsThemed.background.primary};

    video {
      position: absolute;
      top: 10px;
      left: 10px;
      object-fit: cover;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      border-radius: 10px;
    }

    .thumnailHolder {
      position: absolute;
      top: 10px;
      left: 10px;
      object-fit: cover;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      border-radius: 10px;
    }
  }

  ${(props) => props.theme.media.laptop} {
    width: 256px;

    transition: 0.2s linear;
    :hover {
      transform: translateY(-8px);
    }
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
`;

const SImageMask = styled.div`
  width: 100%;

  top: 0;
  left: 0px;
  right: 0;
  bottom: 0px;
  z-index: 1;
  overflow: hidden;
  position: absolute;
  background: linear-gradient(
    180deg,
    rgba(11, 10, 19, 0) 49.87%,
    rgba(11, 10, 19, 0.8) 100%
  );
  border-radius: 10px;
  pointer-events: none;

  ${({ theme }) => theme.media.tablet} {
    width: calc(100% - 20px);
    left: 10px;
    bottom: 10px;
  }
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

  /* padding: 10px; */
  padding-top: 10px;
  padding-bottom: 10px;

  border: 1.5px solid;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-color: ${({ theme }) => theme.colorsThemed.background.outlines1};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    max-width: 200px;

    transition: transform ease 0.5s;

    :hover {
      transform: translateY(-8px);
    }
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 224px;

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
  padding: 70% 0px;
  position: relative;

  ${(props) => props.theme.media.tablet} {
    border-radius: 10px;
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

  width: calc(100% - 20px);
  left: 10px;
  padding: 10px;
  overflow: hidden;
  border-radius: 10px;

  ${(props) => props.theme.media.tablet} {
    padding: 12px;
    overflow: hidden;
    border-radius: 10px;
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

  .thumnailHolder {
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
  padding: 16px 10px 0;
  display: flex;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    padding: 8px 10px 0 10px;
  }
`;

const STextOutside = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  display: -webkit-box;
  overflow: hidden;
  position: relative;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  margin-bottom: 10px;

  height: 40px;
`;

const SBottomStart = styled.div<{
  hasEnded: boolean;
}>`
  display: grid;
  grid-template-areas: 'avatar nickname timer';
  grid-template-columns: ${({ hasEnded }) =>
    hasEnded ? '24px 3fr 9fr' : '24px 5fr 10fr'};
  align-items: center;

  height: 32px;

  margin-bottom: 4px;
`;

const SUserAvatarOutside = styled(UserAvatar)`
  grid-area: avatar;

  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
`;

const SUsername = styled(Text)`
  grid-area: nickname;

  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  margin-left: 6px;

  white-space: nowrap;
`;

interface ISBottomEnd {
  type: 'ac' | 'mc' | 'cf';
}

const SBottomEnd = styled.div<ISBottomEnd>`
  display: flex;
  align-items: ${(props) => (props.type === 'cf' ? 'flex-end' : 'center')};
  flex-direction: ${(props) => (props.type === 'cf' ? 'column' : 'row')};
  justify-content: space-between;

  ${(props) =>
    props.type === 'cf' &&
    css`
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
  cardType: string;
}

const SButton = styled(Button)<ISButtonSpan>`
  padding: 12px;
  border-radius: 12px;

  width: 100%;
  height: 36px;

  span {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;

    ${(props) =>
      props.cardType === 'cf'
        ? css`
            width: 100%;
            text-align: center;
          `
        : ''}
  }

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;

    span {
      font-size: 14px;
    }
  }

  ${(props) => props.theme.media.laptop} {
    span {
      font-size: 16px;
    }
  }
`;

const SButtonFirst = styled(Button)`
  padding: 12px;
  border-radius: 12px;

  width: 100%;
  height: 36px;

  background: ${({ theme }) =>
    theme.name === 'light' ? '#F1F3F9' : '#FFFFFF'};

  span {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;

    color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;

    span {
      font-size: 14px;
    }
  }

  ${(props) => props.theme.media.laptop} {
    span {
      font-size: 16px;
    }
  }

  &:hover,
  &:active {
    span {
      color: #ffffff;
    }
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
