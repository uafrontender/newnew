import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useContext,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { useAppSelector } from '../../redux-store/store';

import Text from '../atoms/Text';
import Button from '../atoms/Button';
import General from './General';
import { Tab } from '../molecules/Tabs';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
import ProfileTabs from '../molecules/profile/ProfileTabs';
import ProfileImage from '../molecules/profile/ProfileImage';
import ProfileBackground from '../molecules/profile/ProfileBackground';

// Icons
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../public/images/svg/icons/filled/More.svg';
import NotificationsIconFilled from '../../public/images/svg/icons/filled/Notifications.svg';
import NotificationsIconOutlined from '../../public/images/svg/icons/outlined/Notifications.svg';
// import FavouritesIconFilled from '../../public/images/svg/icons/filled/Favourites.svg';
// import FavouritesIconOutlined from '../../public/images/svg/icons/outlined/Favourites.svg';
import { getSubscriptionStatus } from '../../api/endpoints/subscription';
// import { FollowingsContext } from '../../contexts/followingContext';
import { markUser } from '../../api/endpoints/user';

import UserEllipseMenu from '../molecules/profile/UserEllipseMenu';
import UserEllipseModal from '../molecules/profile/UserEllipseModal';
import BlockUserModalProfile from '../molecules/profile/BlockUserModalProfile';
import { useGetBlockedUsers } from '../../contexts/blockedUsersContext';
import ReportModal, { ReportData } from '../molecules/chat/ReportModal';
import { reportUser } from '../../api/endpoints/report';
import BackButton from '../molecules/profile/BackButton';
import getGenderPronouns, {
  isGenderPronounsDefined,
} from '../../utils/genderPronouns';
import VerificationCheckmark from '../../public/images/svg/icons/filled/Verification.svg';
import CustomLink from '../atoms/CustomLink';
import SmsNotificationModal, {
  SubscriptionToCreator,
} from '../molecules/profile/SmsNotificationModal';
import {
  getGuestSmsNotificationsSubscriptionToCreatorStatus,
  getSmsNotificationsSubscriptionToCreatorStatus,
  subscribeGuestToCreatorSmsNotifications,
  subscribeToCreatorSmsNotifications,
  unsubscribeFromCreatorSmsNotifications,
  unsubscribeGuestFromCreatorSmsNotifications,
} from '../../api/endpoints/phone';
import { SocketContext } from '../../contexts/socketContext';
import { useGetSubscriptions } from '../../contexts/subscriptionsContext';

type TPageType = 'creatorsDecisions' | 'activity' | 'activityHidden';

interface IProfileLayout {
  user: Omit<newnewapi.User, 'toJSON'>;
  renderedPage: TPageType;
  postsCachedCreatorDecisions?: newnewapi.Post[];
  postsCachedCreatorDecisionsFilter?: newnewapi.Post.Filter;
  postsCachedCreatorDecisionsPageToken?: string | null | undefined;
  postsCachedCreatorDecisionsCount?: number;
  postsCachedActivity?: newnewapi.Post[];
  postsCachedActivityFilter?: newnewapi.Post.Filter;
  postsCachedActivityPageToken?: string | null | undefined;
  postsCachedActivityCount?: number;
  children: React.ReactNode;
}

const SAVED_PHONE_COUNTRY_CODE_KEY = 'savedPhoneCountryCode';
const SAVED_PHONE_NUMBER_KEY = 'savedPhoneNumber';

const getSmsNotificationSubscriptionErrorMessage = (
  status?: newnewapi.SmsNotificationsStatus
) => {
  switch (status) {
    case newnewapi.SmsNotificationsStatus.UNKNOWN_STATUS:
      return 'smsNotifications.error.requestFailed';
    default:
      return 'smsNotifications.error.requestFailed';
  }
};

const ProfileLayout: React.FunctionComponent<IProfileLayout> = ({
  user,
  renderedPage,
  postsCachedCreatorDecisions,
  postsCachedCreatorDecisionsFilter,
  postsCachedCreatorDecisionsPageToken,
  postsCachedCreatorDecisionsCount,
  postsCachedActivity,
  postsCachedActivityFilter,
  postsCachedActivityPageToken,
  postsCachedActivityCount,
  children,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');

  const currentUser = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isDesktop = ['laptop', 'laptopM', 'laptopL', 'desktop'].includes(
    resizeMode
  );

  const socketConnection = useContext(SocketContext);
  // const { followingsIds, addId, removeId } = useContext(FollowingsContext);

  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [subscribedToSmsNotifications, setSubscribedToSmsNotifications] =
    useState(false);
  const [wasSubscribed, setWasSubscribed] = useState<boolean | null>(null);
  const [ellipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

  // Share
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handleCopyLink = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/${user.username}`;

      copyPostUrlToClipboard(url)
        .then(() => {
          setIsCopiedUrl(true);
          setTimeout(() => {
            setIsCopiedUrl(false);
          }, 1500);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [user.username]);

  // Modals
  const [blockUserModalOpen, setBlockUserModalOpen] = useState(false);
  const [confirmReportUser, setConfirmReportUser] = useState(false);
  const [smsNotificationModalOpen, setSmsNotificationModalOpen] =
    useState(false);
  const { usersIBlocked, unblockUser } = useGetBlockedUsers();
  const isUserBlocked = useMemo(
    () => usersIBlocked.includes(user.uuid),
    [usersIBlocked, user.uuid]
  );

  const unblockUserAsync = async (uuid: string) => {
    try {
      const payload = new newnewapi.MarkUserRequest({
        markAs: newnewapi.MarkUserRequest.MarkAs.NOT_BLOCKED,
        userUuid: uuid,
      });
      const res = await markUser(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      unblockUser(uuid);
    } catch (err) {
      console.error(err);
      toast.error('toastErrors.generic');
    }
  };

  const tabs: Tab[] = useMemo(() => {
    if (user.options?.isCreator) {
      // if (true) {
      return [
        {
          nameToken: 'userInitial',
          url: `/${user.username}`,
        },
        {
          nameToken: 'activity',
          url: `/${user.username}/activity`,
        },
      ];
    }
    return [];
  }, [user]);

  const subscription: SubscriptionToCreator = useMemo(
    () => ({
      userId: user.uuid,
      username: user.username,
    }),
    [user.uuid, user.username]
  );

  // Posts
  const [creatorsDecisions, setCreatorsDecisions] = useState(
    postsCachedCreatorDecisions ?? []
  );
  const [creatorsDecisionsFilter, setCreatorsDecisionsFilter] = useState(
    postsCachedCreatorDecisionsFilter ?? newnewapi.Post.Filter.ALL
  );
  const [creatorsDecisionsToken, setCreatorsDecisionsPageToken] = useState(
    postsCachedCreatorDecisionsPageToken
  );
  const [creatorsDecisionsCount, setCreatorsDecisionsCount] = useState(
    postsCachedCreatorDecisionsCount
  );

  const [activityDecisions, setActivityDecisions] = useState(
    postsCachedActivity ?? []
  );
  const [activityDecisionsFilter, setActivityDecisionsFilter] = useState(
    postsCachedActivityFilter ?? newnewapi.Post.Filter.ALL
  );
  const [activityDecisionsToken, setActivityDecisionsPageToken] = useState(
    postsCachedActivityPageToken
  );
  const [activityDecisionsCount, setActivityDecisionsCount] = useState(
    postsCachedActivityCount
  );

  const { creatorsImSubscribedTo } = useGetSubscriptions();

  const handleSetPostsCreatorsDecisions: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setCreatorsDecisions, [setCreatorsDecisions]);

  const handleSetActivityDecisions: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setActivityDecisions, [setActivityDecisions]);

  const handleUpdateFilter = useCallback(
    (value: newnewapi.Post.Filter) => {
      switch (renderedPage) {
        case 'activity': {
          setActivityDecisionsFilter(value);
          break;
        }
        case 'activityHidden': {
          setActivityDecisionsFilter(value);
          break;
        }
        case 'creatorsDecisions': {
          setCreatorsDecisionsFilter(value);
          break;
        }
        default: {
          break;
        }
      }
    },
    [renderedPage]
  );

  const handleUpdatePageToken = useCallback(
    (value: string | null | undefined) => {
      switch (renderedPage) {
        case 'activity': {
          setActivityDecisionsPageToken(value);
          break;
        }
        case 'activityHidden': {
          setActivityDecisionsPageToken(value);
          break;
        }
        case 'creatorsDecisions': {
          setCreatorsDecisionsPageToken(value);
          break;
        }
        default: {
          break;
        }
      }
    },
    [renderedPage]
  );

  const handleUpdateCount = useCallback(
    (value: number) => {
      switch (renderedPage) {
        case 'activity': {
          setActivityDecisionsCount(value);
          break;
        }
        case 'activityHidden': {
          setActivityDecisionsCount(value);
          break;
        }
        case 'creatorsDecisions': {
          setCreatorsDecisionsCount(value);
          break;
        }
        default: {
          break;
        }
      }
    },
    [renderedPage]
  );

  const handleClickReport = useCallback(() => {
    // Redirect only after the persist data is pulled
    if (!currentUser.loggedIn && currentUser._persist?.rehydrated) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }

    setConfirmReportUser(true);
  }, [currentUser, router]);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      await reportUser(user.uuid, reasons, message).catch((e) =>
        console.error(e)
      );
    },
    [user.uuid]
  );
  const handleReportClose = useCallback(() => setConfirmReportUser(false), []);

  const handleSmsNotificationModalClose = useCallback(
    () => setSmsNotificationModalOpen(false),
    []
  );

  // TODO: Move to some other place, create it on app startup
  const getGuestId = useCallback((): string => {
    const GUEST_ID_KEY = 'savedGuestId';
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  }, []);

  const submitPhoneSmsNotificationsRequest = useCallback(
    async (phoneNumber: newnewapi.PhoneNumber): Promise<string> => {
      try {
        if (!currentUser.loggedIn) {
          const guestId = getGuestId();

          const res = await subscribeGuestToCreatorSmsNotifications(
            user.uuid,
            guestId,
            phoneNumber
          );

          if (
            !res.data ||
            res.error ||
            (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
              res.data.status !==
                newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
          ) {
            throw new Error(
              res.error?.message ??
                t(getSmsNotificationSubscriptionErrorMessage(res.data?.status))
            );
          }

          localStorage.setItem(
            SAVED_PHONE_COUNTRY_CODE_KEY,
            phoneNumber.countryCode
          );
          localStorage.setItem(SAVED_PHONE_NUMBER_KEY, phoneNumber.number);
        } else {
          const res = await subscribeToCreatorSmsNotifications(
            user.uuid,
            phoneNumber
          );

          if (
            !res.data ||
            res.error ||
            (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
              res.data.status !==
                newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
          ) {
            throw new Error(
              res.error?.message ??
                t(getSmsNotificationSubscriptionErrorMessage(res.data?.status))
            );
          }
        }

        return phoneNumber.number;
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
        // Rethrow for a child
        throw err;
      }
    },
    [currentUser.loggedIn, getGuestId, user.uuid, t]
  );

  const handleSmsNotificationButtonClicked = useCallback(async () => {
    if (subscribedToSmsNotifications) {
      if (!currentUser.loggedIn) {
        const guestId = getGuestId();
        const res = await unsubscribeGuestFromCreatorSmsNotifications(
          user.uuid,
          guestId
        );

        if (!res.data || res.error) {
          console.error('Unsubscribe from SMS failed');
          toast.error(t('smsNotifications.errors.requestFailed'));
        }
      } else {
        const res = await unsubscribeFromCreatorSmsNotifications(user.uuid);

        if (!res.data || res.error) {
          console.error('Unsubscribe from SMS failed');
          toast.error(t('smsNotifications.errors.requestFailed'));
        }
      }
    } else if (!currentUser.loggedIn) {
      const countryCode = localStorage.getItem(SAVED_PHONE_COUNTRY_CODE_KEY);
      const number = localStorage.getItem(SAVED_PHONE_NUMBER_KEY);

      if (countryCode && number) {
        const phoneNumber = new newnewapi.PhoneNumber({
          countryCode,
          number,
        });
        submitPhoneSmsNotificationsRequest(phoneNumber);
      } else {
        setSmsNotificationModalOpen(true);
      }
    } else if (currentUser.userData?.options?.isPhoneNumberConfirmed) {
      try {
        const res = await subscribeToCreatorSmsNotifications(user.uuid);

        if (
          !res.data ||
          res.error ||
          (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
            res.data.status !==
              newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
        ) {
          throw new Error(
            res.error?.message ??
              t(getSmsNotificationSubscriptionErrorMessage(res.data?.status))
          );
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      }
    } else {
      setSmsNotificationModalOpen(true);
    }
  }, [
    currentUser.loggedIn,
    currentUser.userData?.options?.isPhoneNumberConfirmed,
    subscribedToSmsNotifications,
    user.uuid,
    t,
    getGuestId,
    submitPhoneSmsNotificationsRequest,
  ]);

  const renderChildren = () => {
    let postsForPage = {};
    let postsForPageFilter;
    let pageToken;
    let handleSetPosts;
    let totalCount;

    switch (renderedPage) {
      case 'creatorsDecisions': {
        postsForPage = creatorsDecisions;
        postsForPageFilter = creatorsDecisionsFilter;
        pageToken = creatorsDecisionsToken;
        totalCount = creatorsDecisionsCount;
        handleSetPosts = handleSetPostsCreatorsDecisions;
        break;
      }
      case 'activity': {
        postsForPage = activityDecisions;
        postsForPageFilter = activityDecisionsFilter;
        pageToken = activityDecisionsToken;
        totalCount = activityDecisionsCount;
        handleSetPosts = handleSetActivityDecisions;
        break;
      }
      case 'activityHidden': {
        postsForPage = [];
        postsForPageFilter = activityDecisionsFilter;
        pageToken = undefined;
        totalCount = 0;
        handleSetPosts = handleSetActivityDecisions;
        break;
      }
      default: {
        break;
      }
    }

    return React.cloneElement(children as ReactElement, {
      ...(postsForPage ? { posts: postsForPage } : {}),
      ...(postsForPageFilter ? { postsFilter: postsForPageFilter } : {}),
      pageToken,
      totalCount,
      handleSetPosts,
      handleUpdatePageToken,
      handleUpdateCount,
      handleUpdateFilter,
    });
  };

  // const handleToggleFollowingCreator = async () => {
  //   try {
  //     if (!currentUser.loggedIn) {
  //       router.push(
  //         `/sign-up?reason=follow-creator&redirect=${encodeURIComponent(
  //           window.location.href
  //         )}`
  //       );
  //     }

  //     const payload = new newnewapi.MarkUserRequest({
  //       userUuid: user.uuid,
  //       markAs: followingsIds.includes(user.uuid as string)
  //         ? newnewapi.MarkUserRequest.MarkAs.NOT_FOLLOWED
  //         : newnewapi.MarkUserRequest.MarkAs.FOLLOWED,
  //     });

  //     console.log(payload);

  //     const res = await markUser(payload);

  //     if (res.error) throw new Error(res.error?.message ?? 'Request failed');

  //     if (followingsIds.includes(user.uuid as string)) {
  //       removeId(user.uuid as string);
  //     } else {
  //       addId(user.uuid as string);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/sign-up?reason=follow-creator');
    router.prefetch(`/${user.username}/subscribe`);
    router.prefetch(`/${user.username}/activity`);
    router.prefetch(`/${user.username}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to /profile page if the page is of current user's own
  useEffect(() => {
    if (
      currentUser.loggedIn &&
      currentUser.userData?.userUuid?.toString() === user.uuid.toString()
    ) {
      router.replace(
        currentUser.userData?.options?.isCreator
          ? '/profile/my-posts'
          : '/profile'
      );
    }
  }, [
    currentUser.loggedIn,
    currentUser.userData?.options?.isCreator,
    currentUser.userData?.userUuid,
    router,
    user.uuid,
  ]);

  useEffect(() => {
    async function fetchIsSubscribed() {
      try {
        const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid: user.uuid,
        });

        const res = await getSubscriptionStatus(getStatusPayload);

        if (res.data?.status?.activeRenewsAt) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
        if (res.data?.status?.activeCancelsAt) {
          setWasSubscribed(true);
        } else {
          setWasSubscribed(false);
        }
      } catch (err) {
        console.error(err);
        toast.error('toastErrors.generic');
      }
    }

    fetchIsSubscribed();

    // TODO: After update GetCreatorsImSubscribedToResponse on backend remaster this section
    // let isSub = undefined;
    // if (creatorsImSubscribedTo && creatorsImSubscribedTo.length > 0) {
    //   isSub = creatorsImSubscribedTo.find((cr) => cr.uuid === user.uuid);
    // }
    // isSub ? setIsSubscribed(true) : setIsSubscribed(false);
  }, [creatorsImSubscribedTo, user.uuid]);

  useEffect(() => {
    if (!currentUser.loggedIn) {
      const pollGuestSmsSubscriptionStatus = async () => {
        const guestId = getGuestId();
        const res = await getGuestSmsNotificationsSubscriptionToCreatorStatus(
          user.uuid,
          guestId
        );

        if (!res.data || res.error) {
          console.error('Unable to get sms notifications status');
          toast.error(t('smsNotifications.errors.requestFailed'));
          throw new Error('Request failed');
        }

        setSubscribedToSmsNotifications(
          res.data.status === newnewapi.SmsNotificationsStatus.SUCCESS
        );
      };

      pollGuestSmsSubscriptionStatus()
        .then(() => {
          const pollingInterval = setInterval(() => {
            pollGuestSmsSubscriptionStatus().catch(() => {
              clearInterval(pollingInterval);
            });
          }, 5000);

          return () => {
            clearInterval(pollingInterval);
          };
        })
        .catch(() => {
          // Do nothing
        });
    } else {
      getSmsNotificationsSubscriptionToCreatorStatus(user.uuid).then((res) => {
        if (!res.data || res.error) {
          console.error('Unable to get sms notifications status');
          toast.error(t('smsNotifications.errors.requestFailed'));
          return;
        }

        setSubscribedToSmsNotifications(
          res.data.status === newnewapi.SmsNotificationsStatus.SUCCESS
        );
      });
    }

    return () => {};
  }, [currentUser.loggedIn, user.uuid, t, getGuestId]);

  useEffect(() => {
    const handleSubscribedToSms = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.SmsNotificationsSubscribed.decode(arr);

      if (!decoded) return;

      if (decoded.object?.creatorUuid === user.uuid) {
        setSubscribedToSmsNotifications(true);
      }
    };

    const handleUnsubscribedFromSms = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.SmsNotificationsUnsubscribed.decode(arr);

      if (!decoded) return;

      if (decoded.object?.creatorUuid === user.uuid) {
        setSubscribedToSmsNotifications(false);
      }

      if (decoded.object && !decoded.object.creatorUuid) {
        // Unsubscribed from all
        setSubscribedToSmsNotifications(false);
      }
    };

    if (socketConnection && currentUser.loggedIn) {
      socketConnection?.on('SmsNotificationsSubscribed', handleSubscribedToSms);
      socketConnection?.on(
        'SmsNotificationsUnsubscribed',
        handleUnsubscribedFromSms
      );
    }

    return () => {
      if (
        socketConnection &&
        socketConnection?.connected &&
        currentUser.loggedIn
      ) {
        socketConnection?.off(
          'SmsNotificationsSubscribed',
          handleSubscribedToSms
        );
        socketConnection?.off(
          'SmsNotificationsUnsubscribed',
          handleUnsubscribedFromSms
        );
      }
    };
  }, [currentUser.loggedIn, user.uuid, socketConnection]);

  const moreButtonRef = useRef() as any;

  return (
    <>
      <SGeneral restrictMaxWidth>
        <SProfileLayout>
          <ProfileBackground
            pictureURL={user.coverUrl ?? '../public/images/mock/profile-bg.png'}
          />
          {/* Favorites and more options buttons */}
          <SBackButton
            onClick={() => {
              router.push('/');
            }}
          />
          {/* <SFavoritesButton
            view='transparent'
            iconOnly
            onClick={() => handleToggleFollowingCreator()}
          >
            <SSVGContainer active={false}>
              <InlineSvg
                svg={
                  followingsIds.includes(user.uuid as string)
                    ? FavouritesIconFilled
                    : FavouritesIconOutlined
                }
                fill={
                  followingsIds.includes(user.uuid as string)
                    ? theme.colorsThemed.accent.blue
                    : 'none'
                }
                width={isMobileOrTablet ? '16px' : '24px'}
                height={isMobileOrTablet ? '16px' : '24px'}
              />
            </SSVGContainer>
            {t('profileLayout.buttons.favorites')}
          </SFavoritesButton> */}

          <SSideButtons>
            {isMobile ? (
              <SIconButton
                active={subscribedToSmsNotifications}
                onClick={handleSmsNotificationButtonClicked}
              >
                <InlineSvg
                  svg={
                    subscribedToSmsNotifications
                      ? NotificationsIconFilled
                      : NotificationsIconOutlined
                  }
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SIconButton>
            ) : (
              <SIconButtonWithText
                active={subscribedToSmsNotifications}
                onClick={handleSmsNotificationButtonClicked}
              >
                <InlineSvg
                  svg={
                    subscribedToSmsNotifications
                      ? NotificationsIconFilled
                      : NotificationsIconOutlined
                  }
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
                {t(
                  subscribedToSmsNotifications
                    ? 'profileLayout.buttons.disableSmsNotifications'
                    : 'profileLayout.buttons.enableSmsNotifications'
                )}
              </SIconButtonWithText>
            )}

            <SIconButton
              active={ellipseMenuOpen}
              ref={moreButtonRef}
              onClick={() => setIsEllipseMenuOpen(true)}
            >
              <InlineSvg
                svg={MoreIconFilled}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SIconButton>
          </SSideButtons>
          {!isMobile && (
            <UserEllipseMenu
              isVisible={ellipseMenuOpen}
              isBlocked={isUserBlocked}
              loggedIn={currentUser.loggedIn}
              handleClose={() => setIsEllipseMenuOpen(false)}
              handleClickBlock={() => {
                if (isUserBlocked) {
                  unblockUserAsync(user.uuid);
                } else {
                  setBlockUserModalOpen(true);
                }
              }}
              handleClickReport={handleClickReport}
              anchorElement={moreButtonRef.current}
              offsetTop={isDesktop ? '-25px' : '0'}
            />
          )}
          <ProfileImage src={user.avatarUrl ?? ''} />
          <SUserData>
            <SUsernameWrapper>
              <SUsername variant={4}>
                {user.nickname}
                {user.options?.isVerified && (
                  <SInlineSVG
                    svg={VerificationCheckmark}
                    width='32px'
                    height='32px'
                    fill='none'
                  />
                )}
              </SUsername>
              {isGenderPronounsDefined(user.genderPronouns) && (
                <SGenderPronouns variant={2}>
                  {t(
                    `genderPronouns.${
                      getGenderPronouns(user.genderPronouns!!).name
                    }`
                  )}
                </SGenderPronouns>
              )}
            </SUsernameWrapper>
            <SShareDiv>
              <SUsernameButton
                view='tertiary'
                iconOnly
                style={{
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                }}
                onClick={() => {}}
              >
                <SUsernameButtonText>
                  @{/* Temp! */}
                  {user.username && user.username.length > 12
                    ? `${user.username.substring(
                        0,
                        6
                      )}...${user.username.substring(user.username.length - 3)}`
                    : user.username}
                </SUsernameButtonText>
              </SUsernameButton>
              <SShareButton
                view='tertiary'
                iconOnly
                withDim
                withShrink
                style={{
                  padding: '8px',
                }}
                onClick={() => handleCopyLink()}
              >
                {isCopiedUrl ? (
                  t('profileLayout.buttons.copied')
                ) : (
                  <InlineSvg
                    svg={ShareIconFilled}
                    fill={theme.colorsThemed.text.primary}
                    width='20px'
                    height='20px'
                  />
                )}
              </SShareButton>
            </SShareDiv>
            {user.options?.isOfferingSubscription &&
              user.uuid !== currentUser.userData?.userUuid &&
              (isSubscribed || wasSubscribed) && (
                <CustomLink
                  href={`/direct-messages/${user.username}-cr`}
                  disabled={isSubscribed === null || wasSubscribed === null}
                >
                  <SSendButton withShadow view='primaryGrad'>
                    {t('profileLayout.buttons.sendMessage')}
                  </SSendButton>
                </CustomLink>
              )}
            {user.bio ? <SBioText variant={3}>{user.bio}</SBioText> : null}
          </SUserData>
          {/* Temp, all creactors for now */}
          {/* {user.options?.isCreator && !user.options?.isPrivate */}
          {tabs.length > 0 ? (
            <ProfileTabs pageType='othersProfile' tabs={tabs} />
          ) : null}
        </SProfileLayout>
        {renderChildren()}
      </SGeneral>
      {/* Modals */}
      {isMobile && (
        <UserEllipseModal
          isOpen={ellipseMenuOpen}
          zIndex={10}
          isBlocked={isUserBlocked}
          loggedIn={currentUser.loggedIn}
          onClose={() => setIsEllipseMenuOpen(false)}
          handleClickBlock={() => {
            if (isUserBlocked) {
              unblockUserAsync(user.uuid);
            } else {
              setBlockUserModalOpen(true);
            }
          }}
          handleClickReport={() => {
            setConfirmReportUser(true);
          }}
        />
      )}
      <BlockUserModalProfile
        confirmBlockUser={blockUserModalOpen}
        user={user}
        closeModal={() => setBlockUserModalOpen(false)}
      />
      <ReportModal
        show={confirmReportUser}
        reportedDisplayname={
          user.nickname ? user.nickname || `@${user.username}` : ''
        }
        onSubmit={handleReportSubmit}
        onClose={handleReportClose}
      />
      <SmsNotificationModal
        show={smsNotificationModalOpen}
        subscription={subscription}
        onSubmit={submitPhoneSmsNotificationsRequest}
        onClose={handleSmsNotificationModalClose}
      />
    </>
  );
};

ProfileLayout.defaultProps = {
  postsCachedCreatorDecisions: undefined,
  postsCachedCreatorDecisionsFilter: undefined,
  postsCachedCreatorDecisionsPageToken: undefined,
  postsCachedCreatorDecisionsCount: undefined,
  postsCachedActivity: undefined,
  postsCachedActivityFilter: undefined,
  postsCachedActivityPageToken: undefined,
  postsCachedActivityCount: undefined,
};

export default ProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }
`;

const SUserData = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const SUsernameWrapper = styled.div`
  margin-bottom: 12px;
`;

const SUsername = styled(Headline)`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SGenderPronouns = styled(Text)`
  text-align: center;
  font-weight: 400;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SShareDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 12px;

  margin-bottom: 16px;
`;

const SUsernameButton = styled(Button)`
  cursor: default;

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.background.primary};
  }
`;

const SUsernameButtonText = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  user-select: text;
`;

const SShareButton = styled(Button)`
  span {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SSendButton = styled(Button)`
  margin: 0 auto 16px;
  background: ${(props) => props.theme.colorsThemed.accent.yellow};
  color: #2c2c33;

  :after {
    background: ${(props) => props.theme.colorsThemed.accent.yellow} !important;
  }

  &:hover {
    background: ${(props) => props.theme.colorsThemed.accent.yellow} !important;
    box-shadow: none !important;
  }
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;

  padding-left: 16px;
  padding-right: 16px;
  margin: 0 auto 54px;

  max-width: 480px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SIconButton = styled.div<{
  active: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 12px;
  border-radius: 16px;
  cursor: pointer;

  user-select: none;
  transition: background 0.2s linear;
  background: ${({ theme, active }) =>
    active
      ? 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF;'
      : theme.colorsThemed.background.quinary};

  // TODO: add hover/active effects
`;

const SIconButtonWithText = styled(SIconButton)`
  gap: 12px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SBackButton = styled(BackButton)`
  position: absolute;
  top: 16px;
  left: 16px;

  ${(props) => props.theme.media.laptop} {
    top: 24px;
    left: 24px;
  }
`;

// const SFavoritesButton = styled(Button)`
//   position: absolute;
//   top: 164px;
//   right: 4px;

//   background: none;
//   &:active:enabled,
//   &:hover:enabled,
//   &:focus:enabled {
//     background: none;
//   }

//   color: ${({ theme }) => theme.colorsThemed.text.primary};

//   span {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     font-weight: 600;
//     font-size: 10px;
//     line-height: 12px;
//   }

//   ${(props) => props.theme.media.tablet} {
//     top: 204px;
//     right: calc(4px + 56px);
//   }

//   ${(props) => props.theme.media.laptop} {
//     top: 244px;
//     right: calc(4px + 68px);
//   }
// `;

const SSideButtons = styled.div`
  display: flex;
  position: absolute;
  width: 100%;
  gap: 16px;
  padding: 16px;

  top: 164px;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    top: 204px;
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
    justify-content: flex-end;
  }
`;

const SProfileLayout = styled.div`
  position: relative;
  /* overflow: hidden; */

  margin-top: -28px;
  margin-bottom: 24px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${(props) => props.theme.media.tablet} {
    margin-top: -8px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -16px;
  }
`;

const SInlineSVG = styled(InlineSvg)`
  margin-left: 4px;
`;
