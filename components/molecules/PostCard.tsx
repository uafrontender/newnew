/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
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
import VerificationCheckmark from '../../public/images/svg/icons/filled/Verification.svg';

// Utils
import switchPostType, { TPostType } from '../../utils/switchPostType';
import { SocketContext } from '../../contexts/socketContext';
import { ChannelsContext } from '../../contexts/channelsContext';
import CardTimer from '../atoms/CardTimer';
import switchPostStatus from '../../utils/switchPostStatus';
import PostCardEllipseMenu from './PostCardEllipseMenu';
import getDisplayname from '../../utils/getDisplayname';
import ReportModal, { ReportData } from './direct-messages/ReportModal';
import { reportPost } from '../../api/endpoints/report';
import PostCardEllipseModal from './PostCardEllipseModal';
import useOnTouchStartOutside from '../../utils/hooks/useOnTouchStartOutside';
import getChunks from '../../utils/getChunks/getChunks';
import { Mixpanel } from '../../utils/mixpanel';

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
  maxWidthTablet?: string;
  handleRemovePostFromState?: () => void;
  handleAddPostToState?: () => void;
}

export const PostCard: React.FC<ICard> = React.memo(
  ({
    item,
    type,
    index,
    width,
    height,
    maxWidthTablet,
    handleRemovePostFromState,
    handleAddPostToState,
  }) => {
    const { t } = useTranslation('component-PostCard');
    const theme = useTheme();
    const router = useRouter();
    const user = useAppSelector((state) => state.user);
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const wrapperRef = useRef<HTMLDivElement>();

    // Check if video is ready to avoid errors
    const videoRef = useRef<HTMLVideoElement>();

    // Hovered state
    const [hovered, setHovered] = useState(false);
    const [videoReady, setVideoReady] = useState(false);

    const handleSetHovered = () => setHovered(true);
    const handleSetUnhovered = () => {
      setHovered(false);
    };

    const handleClickOutsideMobile = () => {
      if (isMobile) {
        handleSetUnhovered();
      }
    };

    useOnTouchStartOutside(wrapperRef, handleClickOutsideMobile);

    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

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

    const endsAtTime = useMemo(() => {
      if (postParsed.expiresAt?.seconds) {
        return (postParsed.expiresAt.seconds as number) * 1000;
      }

      return 0;
    }, [postParsed.expiresAt?.seconds]);

    const startsAtTime = useMemo(() => {
      if (postParsed.startsAt?.seconds) {
        return (postParsed.startsAt.seconds as number) * 1000;
      }

      return 0;
    }, [postParsed.startsAt?.seconds]);

    const [thumbnailUrl, setThumbnailUrl] = useState(
      postParsed.announcement?.thumbnailUrl ?? ''
    );

    const [coverImageUrl, setCoverImageUrl] = useState<
      string | undefined | null
    >(postParsed.announcement?.coverImageUrl ?? undefined);

    const handleUserClick = (username: string) => {
      Mixpanel.track('Go To Creator Profile', {
        _stage: 'Post Card',
        _postUuid: switchPostType(item)[0].postUuid,
      });
      router.push(`/${username}`);
    };

    // Ellipse menu
    const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

    const handleMoreClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.preventDefault();
      e.stopPropagation();
      Mixpanel.track('Open Ellipse Menu Post Card', {
        _stage: 'Post Card',
        _postUuid: switchPostType(item)[0].postUuid,
      });
      setIsEllipseMenuOpen(true);
    };

    const handleEllipseMenuClose = () => {
      Mixpanel.track('Closed Ellipse Menu Post Card', {
        _stage: 'Post Card',
        _postUuid: switchPostType(item)[0].postUuid,
      });
      setIsEllipseMenuOpen(false);
    };

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleReportOpen = useCallback(() => {
      // Redirect only after the persist data is pulled
      if (!user.loggedIn && user._persist?.rehydrated) {
        router.push(
          `/sign-up?reason=report&redirect=${encodeURIComponent(
            `${process.env.NEXT_PUBLIC_APP_URL}/p/${
              postParsed.postShortId
                ? postParsed.postShortId
                : postParsed.postUuid
            }`
          )}`
        );
        return;
      }
      setIsReportModalOpen(true);
    }, [
      user.loggedIn,
      user._persist?.rehydrated,
      router,
      postParsed.postShortId,
      postParsed.postUuid,
    ]);

    const handleReportClose = useCallback(() => {
      setIsReportModalOpen(false);
    }, []);

    const handleReportSubmit = useCallback(
      async ({ reasons, message }: ReportData) => {
        if (postParsed) {
          await reportPost(postParsed.postUuid, reasons, message).catch((e) =>
            console.error(e)
          );
        }
      },
      [postParsed]
    );

    const handleBidClick = () => {};

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
              const url = URL.createObjectURL(blobFromFetch);

              setThumbnailUrl(url);
            })
            .catch((err) => {
              console.error(err);
            });
        }, 10000);
      };

      const handlerSocketPostCoverImageUpdated = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostCoverImageUpdated.decode(arr);

        if (decoded.postUuid !== postParsed.postUuid) return;

        if (decoded.action === newnewapi.PostCoverImageUpdated.Action.UPDATED) {
          // Wait to make sure that cloudfare cache has been invalidated
          setTimeout(() => {
            fetch(decoded.coverImageUrl as string)
              .then((res) => res.blob())
              .then((blobFromFetch) => {
                const url = URL.createObjectURL(blobFromFetch);

                setCoverImageUrl(url);
              })
              .catch((err) => {
                console.error(err);
              });
          }, 5000);
        } else if (
          decoded.action === newnewapi.PostCoverImageUpdated.Action.DELETED
        ) {
          setCoverImageUrl(undefined);
        }
      };

      if (socketConnection) {
        socketConnection?.on('PostUpdated', handlerSocketPostUpdated);
        socketConnection?.on(
          'PostThumbnailUpdated',
          handlerSocketThumbnailUpdated
        );
        socketConnection.on(
          'PostCoverImageUpdated',
          handlerSocketPostCoverImageUpdated
        );
      }

      return () => {
        if (socketConnection && socketConnection?.connected) {
          socketConnection?.off('PostUpdated', handlerSocketPostUpdated);
          socketConnection?.off(
            'PostThumbnailUpdated',
            handlerSocketThumbnailUpdated
          );
          socketConnection.off(
            'PostCoverImageUpdated',
            handlerSocketPostCoverImageUpdated
          );
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection]);

    useEffect(() => {
      if (hovered) {
        videoRef.current?.play().catch(() => {
          console.error("Auto play doesn't allowed");
        });
      } else {
        videoRef.current?.pause();
      }

      return () => {};
    }, [hovered]);

    useEffect(() => {
      const handleCanPlay = () => {
        setVideoReady(true);
      };

      videoRef.current?.addEventListener('canplay', handleCanPlay);

      return () => {
        videoRef.current?.removeEventListener('canplay', handleCanPlay);
      };
    }, []);

    useEffect(() => {
      router.prefetch(
        `/p/${
          switchPostType(item)[0].postShortId
            ? switchPostType(item)[0].postShortId
            : switchPostType(item)[0].postUuid
        }`
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const moreButtonInsideRef: any = useRef();
    const moreButtonRef: any = useRef();

    function getTitleContent(title: string) {
      return (
        <>
          {getChunks(title).map((chunk, chunkIndex) => {
            if (chunk.type === 'hashtag') {
              return <SHashtag key={chunkIndex}>#{chunk.text}</SHashtag>;
            }

            return <Fragment key={chunkIndex}>{chunk.text}</Fragment>;
          })}
        </>
      );
    }

    if (type === 'inside') {
      return (
        <SWrapper
          ref={(el) => {
            wrapperRef.current = el!!;
          }}
          className='postcard-identifier'
          onMouseEnter={() => handleSetHovered()}
          onTouchStart={() => handleSetHovered()}
          onMouseLeave={() => handleSetUnhovered()}
          index={index}
          width={width}
        >
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
              <SThumnailHolder
                className='thumnailHolder'
                src={
                  (coverImageUrl ||
                    postParsed.announcement?.thumbnailImageUrl) ??
                  ''
                }
                alt='Post'
                draggable={false}
                hovered={hovered && videoReady}
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
                  ref={moreButtonInsideRef}
                  onClick={handleMoreClick}
                >
                  <InlineSVG
                    svg={moreIcon}
                    fill={theme.colors.white}
                    width='20px'
                    height='20px'
                  />
                </SButtonIcon>
                {!isMobile && isEllipseMenuOpen && (
                  <PostCardEllipseMenu
                    postUuid={postParsed.postUuid}
                    postShortId={postParsed.postShortId ?? ''}
                    postType={typeOfPost as TPostType}
                    isVisible={isEllipseMenuOpen}
                    postCreator={postParsed.creator as newnewapi.User}
                    handleReportOpen={handleReportOpen}
                    onClose={handleEllipseMenuClose}
                    anchorElement={moreButtonInsideRef.current}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserClick(postParsed.creator?.username!!);
                  }}
                />
                <SText variant={3} weight={600}>
                  {getTitleContent(postParsed.title)}
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
          {isMobile && isEllipseMenuOpen && (
            <PostCardEllipseModal
              isOpen={isEllipseMenuOpen}
              zIndex={11}
              postUuid={postParsed.postUuid}
              postShortId={postParsed.postShortId ?? ''}
              postType={typeOfPost as TPostType}
              postCreator={postParsed.creator as newnewapi.User}
              handleReportOpen={handleReportOpen}
              onClose={handleEllipseMenuClose}
            />
          )}
        </SWrapper>
      );
    }

    return (
      <SWrapperOutside
        ref={(el) => {
          wrapperRef.current = el!!;
        }}
        className='postcard-identifier'
        onMouseEnter={() => handleSetHovered()}
        onTouchStart={() => handleSetHovered()}
        onMouseLeave={() => handleSetUnhovered()}
        width={width}
        maxWidthTablet={maxWidthTablet ?? undefined}
      >
        <SImageBG id='backgroundPart' height={height}>
          <SImageHolderOutside id='animatedPart'>
            <SThumnailHolder
              className='thumnailHolder'
              src={
                (coverImageUrl || postParsed.announcement?.thumbnailImageUrl) ??
                ''
              }
              alt='Post'
              draggable={false}
              hovered={hovered && videoReady}
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
                ref={moreButtonRef}
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
                  postShortId={postParsed.postShortId ?? ''}
                  postType={typeOfPost as TPostType}
                  isVisible={isEllipseMenuOpen}
                  postCreator={postParsed.creator as newnewapi.User}
                  handleReportOpen={handleReportOpen}
                  handleRemovePostFromState={
                    handleRemovePostFromState ?? undefined
                  }
                  handleAddPostToState={handleAddPostToState ?? undefined}
                  onClose={handleEllipseMenuClose}
                  anchorElement={moreButtonRef.current}
                />
              )}
            </STopContent>
          </SImageHolderOutside>
        </SImageBG>
        <SBottomContentOutside>
          <SBottomStart hasEnded={Date.now() > endsAtTime}>
            <SUserAvatarOutside
              avatarUrl={
                postParsed?.creator?.avatarUrl
                  ? postParsed.creator.avatarUrl
                  : ''
              }
              withClick
              onClick={(e) => {
                e.stopPropagation();
                handleUserClick(postParsed.creator?.username!!);
              }}
            />
            <SUsernameContainer>
              <SUsername
                variant={2}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserClick(postParsed.creator?.username!!);
                }}
              >
                {getDisplayname(postParsed.creator)}
              </SUsername>
              {postParsed.creator?.options?.isVerified && (
                <SInlineSVG
                  svg={VerificationCheckmark}
                  width='16px'
                  height='16px'
                  fill='none'
                />
              )}
            </SUsernameContainer>
            <SCardTimer startsAt={startsAtTime} endsAt={endsAtTime} />
          </SBottomStart>
          <STextOutside variant={3} weight={600}>
            {getTitleContent(postParsed.title)}
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
                  {t('button.withActivity.mcSingular', {
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
                  {t(`button.withActivity.${typeOfPost}`, {
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
                {switchPostStatus(typeOfPost, postParsed.status) === 'voting' &&
                postParsed.creator?.uuid !== user.userData?.userUuid
                  ? t(`button.withoutActivity.${typeOfPost}`)
                  : t(`button.seeResults.${typeOfPost}`)}
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
            postShortId={postParsed.postShortId ?? ''}
            postType={typeOfPost as TPostType}
            postCreator={postParsed.creator as newnewapi.User}
            handleReportOpen={handleReportOpen}
            onClose={handleEllipseMenuClose}
            handleRemovePostFromState={handleRemovePostFromState ?? undefined}
            handleAddPostToState={handleAddPostToState ?? undefined}
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
};

interface ISWrapper {
  index?: number;
  width?: string;
  maxWidthTablet?: string;
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
    /* z-index: -1; */
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

const SThumnailHolder = styled.img<{
  hovered: boolean;
}>`
  opacity: ${({ hovered }) => (hovered ? 0 : 1)};
  transition: linear 0.3s;
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
  padding-right: 8px;

  ${({ theme }) => theme.media.tablet} {
    padding-right: initial;
  }
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
    max-width: ${({ maxWidthTablet }) => maxWidthTablet ?? '100%'};

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
    /* z-index: -1; */
  }
`;

const SBottomContentOutside = styled.div`
  padding: 8px 10px 0 10px;
  display: flex;
  flex-direction: column;
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

const SHashtag = styled.span`
  display: inline;
  word-spacing: normal;
  overflow-wrap: break-word;
  color: ${(props) => props.theme.colorsThemed.accent.blue};
`;

const SBottomStart = styled.div<{
  hasEnded: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;

  height: 24px;

  margin-bottom: 4px;
  overflow: hidden;
`;

const SUserAvatarOutside = styled(UserAvatar)`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
`;

// Move all styles to here
const SUsernameContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 1;
  flex-grow: 1;
  overflow: hidden;
  margin-right: 2px;
`;

const SUsername = styled(Text)`
  display: inline-block;
  flex-shrink: 1;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  margin-left: 6px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SCardTimer = styled(CardTimer)`
  flex-shrink: 0;
  margin-left: 6px;
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

  &:hover,
  &:active,
  &:focus {
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

const SInlineSVG = styled(InlineSVG)`
  flex-shrink: 0;
`;
