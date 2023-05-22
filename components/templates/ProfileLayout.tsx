import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../redux-store/store';

import Text from '../atoms/Text';
import Button from '../atoms/Button';
import CustomLink from '../atoms/CustomLink';
import General from './General';
// import { Tab } from '../molecules/Tabs';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
// import ProfileTabs from '../molecules/profile/ProfileTabs';
import ProfileImage from '../molecules/profile/ProfileImage';
import ProfileBackground from '../molecules/profile/ProfileBackground';
import SeeBundlesButton from '../molecules/profile/SeeBundlesButton';
import UserEllipseMenu from '../molecules/profile/UserEllipseMenu';
import UserEllipseModal from '../molecules/profile/UserEllipseModal';
import BlockUserModalProfile from '../molecules/profile/BlockUserModalProfile';
import ReportModal, {
  ReportData,
} from '../molecules/direct-messages/ReportModal';
// import { SubscriptionToCreator } from '../molecules/profile/SmsNotificationModal';

// Icons
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../public/images/svg/icons/filled/More.svg';
import BackButtonIcon from '../../public/images/svg/icons/filled/Back.svg';
import mockProfileBg from '../../public/images/mock/profile-bg.png';

import { useGetBlockedUsers } from '../../contexts/blockedUsersContext';
import { reportUser } from '../../api/endpoints/report';
import getGenderPronouns, {
  isGenderPronounsDefined,
} from '../../utils/genderPronouns';
import { useBundles } from '../../contexts/bundlesContext';
import { Mixpanel } from '../../utils/mixpanel';
import DisplayName from '../atoms/DisplayName';
import { useAppState } from '../../contexts/appStateContext';
import BuyBundleModal from '../molecules/bundles/BuyBundleModal';
import useGoBackOrRedirect from '../../utils/useGoBackOrRedirect';

interface IProfileLayout {
  user: Omit<newnewapi.User, 'toJSON'>;
  children: React.ReactNode;
}

const ProfileLayout: React.FunctionComponent<IProfileLayout> = ({
  user,
  children,
}) => {
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');

  const currentUser = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isDesktop = ['laptop', 'laptopM', 'laptopL', 'desktop'].includes(
    resizeMode
  );

  const [ellipseMenuOpen, setIsEllipseMenuOpen] = useState(false);
  const { bundles } = useBundles();
  const creatorsBundle = useMemo(
    () => bundles?.find((bundle) => bundle.creator?.uuid === user.uuid),
    [bundles, user.uuid]
  );

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
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);
  const {
    usersIBlocked,
    usersBlockedMe,
    usersBlockedLoaded,
    changeUserBlockedStatus,
  } = useGetBlockedUsers();
  const isUserBlocked = useMemo(
    () => usersIBlocked.includes(user.uuid),
    [usersIBlocked, user.uuid]
  );

  // Consider user here blocked until we know they are not
  // Only if user logged in
  const isBlocked = useMemo(
    () =>
      currentUser.loggedIn &&
      (!usersBlockedLoaded ||
        usersIBlocked.includes(user.uuid) ||
        usersBlockedMe.includes(user.uuid)),
    [
      currentUser.loggedIn,
      usersBlockedLoaded,
      usersIBlocked,
      user.uuid,
      usersBlockedMe,
    ]
  );
  // NOTE: activity is temporarily disabled
  /* const tabs: Tab[] = useMemo(() => {
    if (user.options?.isCreator) {
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
  }, [user]); */

  // TODO: Re-enable once new SMS service is integrated
  /* const subscription: SubscriptionToCreator = useMemo(
    () => ({
      type: 'creator',
      userId: user.uuid,
      username: user.username,
    }),
    [user.uuid, user.username]
  );  */

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

  const moreButtonRef = useRef() as any;

  const bundleExpired = useMemo(() => {
    if (!creatorsBundle || !creatorsBundle.bundle?.accessExpiresAt?.seconds) {
      return false;
    }
    const expiresAtTime =
      (creatorsBundle.bundle!.accessExpiresAt!.seconds as number) * 1000;
    return expiresAtTime < Date.now();
  }, [creatorsBundle]);

  return (
    <>
      <SGeneral restrictMaxWidth>
        <SProfileLayout>
          <ProfileBackground pictureURL={user.coverUrl ?? mockProfileBg.src} />
          {/* Favorites and more options buttons */}
          <SButtonBack
            view='transparent'
            withDim
            withShrink
            iconOnly
            onClick={() => {
              goBackOrRedirect('/');
            }}
            onClickCapture={() => {
              Mixpanel.track('Click Back Button', {
                _stage: 'Profile',
                _component: 'ProfileLayout',
              });
            }}
          >
            <InlineSvg svg={BackButtonIcon} width='24px' height='24px' />
          </SButtonBack>
          <SSideButtons>
            {
              // TODO: Re-enable once new SMS service is integrated
              /* user.options?.isCreator && !isBlocked ? (
              <SmsNotificationsButton subscription={subscription} />
            ) : ( */
              <div />
              /* ) */
            }
            <RightSideButtons>
              {!isMobile && !isUserBlocked && (
                <SSeeBundleButton user={user} creatorBundle={creatorsBundle} />
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
            </RightSideButtons>
          </SSideButtons>
          {!isMobile && (
            <UserEllipseMenu
              isVisible={ellipseMenuOpen}
              isBlocked={isUserBlocked}
              loggedIn={currentUser.loggedIn}
              handleClose={() => setIsEllipseMenuOpen(false)}
              handleClickBlock={async () => {
                if (isUserBlocked) {
                  await changeUserBlockedStatus(user.uuid, false);
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
                <DisplayName user={user} />
              </SUsername>
              {isGenderPronounsDefined(user.genderPronouns) && (
                <SGenderPronouns variant={2}>
                  {t(
                    `genderPronouns.${
                      getGenderPronouns(user.genderPronouns!!).name
                    }` as any
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
                onClickCapture={() => {
                  Mixpanel.track('Copy Link User', {
                    _stage: 'Profile',
                    _postUuid: user.uuid,
                    _component: 'ProfileLayout',
                  });
                }}
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

            {
              // eslint-disable-next-line no-nested-ternary
              creatorsBundle && user.options?.isOfferingBundles ? (
                !bundleExpired ? (
                  <CustomLink href={`/direct-messages/${user.username}`}>
                    <SSendButton
                      view='brandYellow'
                      onClickCapture={() => {
                        Mixpanel.track('Send Message Button Clicked', {
                          _stage: 'Profile',
                          _creatorUuid: user.uuid,
                          _component: 'ProfileLayout',
                        });
                      }}
                      // onClick={handleSendMessageClick}
                    >
                      {t('profileLayout.buttons.sendMessage')}
                    </SSendButton>
                  </CustomLink>
                ) : (
                  <SSendButton
                    view='brandYellow'
                    onClick={() => {
                      setBuyBundleModalOpen(true);
                    }}
                    onClickCapture={() => {
                      Mixpanel.track('Send Message Button Clicked', {
                        _stage: 'Profile',
                        _creatorUuid: user.uuid,
                        _component: 'ProfileLayout',
                      });
                    }}
                  >
                    {t('profileLayout.buttons.sendMessage')}
                  </SSendButton>
                )
              ) : null
            }
            {user.bio ? <SBioText variant={3}>{user.bio}</SBioText> : null}
            {isMobile && !isUserBlocked && (
              <SMobileSeeBundleButton
                user={user}
                creatorBundle={creatorsBundle}
              />
            )}
          </SUserData>
          {/* Temp, all creators for now */}
          {/* {user.options?.isCreator && !user.options?.isPrivate */}
          {/* NOTE: activity is temporarily disabled */}
          {/* tabs.length > 0 && !isBlocked ? (
            <ProfileTabs pageType='othersProfile' tabs={tabs} />
          ) : null */}
        </SProfileLayout>
        {!isBlocked && children}
      </SGeneral>
      {/* Modals */}
      {isMobile && (
        <UserEllipseModal
          isOpen={ellipseMenuOpen}
          zIndex={10}
          isBlocked={isUserBlocked}
          loggedIn={currentUser.loggedIn}
          onClose={() => setIsEllipseMenuOpen(false)}
          handleClickBlock={async () => {
            if (isUserBlocked) {
              await changeUserBlockedStatus(user.uuid, false);
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
        reportedUser={user}
        onSubmit={handleReportSubmit}
        onClose={handleReportClose}
      />
      {creatorsBundle && user.options?.isOfferingBundles && bundleExpired ? (
        <BuyBundleModal
          show={buyBundleModalOpen}
          modalType='initial'
          creator={user}
          // Irrelevant since guests wont see it
          successPath={`/${user.username}`}
          onClose={() => {
            setBuyBundleModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

ProfileLayout.defaultProps = {};

export default ProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }

  @media (max-width: 768px) {
    main {
      > div:first-child {
        padding-left: 0;
        padding-right: 0;

        > div:first-child {
          padding-left: 0;
          padding-right: 0;

          > div:first-child {
            padding-left: 0;
            padding-right: 0;
          }
        }
      }
    }
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

const SButtonBack = styled(Button)`
  background: rgba(11, 10, 19, 0.1);

  position: absolute;
  top: 16px;
  left: 16px;

  ${(props) => props.theme.media.laptop} {
    top: 24px;
    left: 24px;
  }
`;

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

const SUserData = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 36px;
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
  color: #2c2c33;
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-word;

  user-select: unset;

  padding-left: 16px;
  padding-right: 16px;
  margin: 0 auto 16px;
  width: 100%;
  max-width: 480px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const RightSideButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const SSeeBundleButton = styled(SeeBundlesButton)`
  margin-right: 16px;
`;

const SMobileSeeBundleButton = styled(SeeBundlesButton)`
  margin: auto;
  margin-bottom: 16px;
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
