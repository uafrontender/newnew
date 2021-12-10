import React, { useCallback, useEffect, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';

import 'react-loading-skeleton/dist/skeleton.css';

import { useAppSelector } from '../../redux-store/store';

import Text from '../atoms/Text';
import Modal from '../organisms/Modal';
import Button from '../atoms/Button';
import General from './General';
import { Tab } from '../molecules/Tabs';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
import ProfileTabs from '../molecules/profile/ProfileTabs';
import ProfileImage from '../molecules/profile/ProfileImage';
import ErrorBoundary from '../organisms/ErrorBoundary';
import ProfileBackground from '../molecules/profile/ProfileBackground';
import EditProfileMenu, { TEditingStage } from '../organisms/EditProfileMenu';

// Icons
import EditIcon from '../../public/images/svg/icons/filled/Edit.svg';
import SettingsIcon from '../../public/images/svg/icons/filled/Settings.svg';
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';

import isBroswer from '../../utils/isBrowser';

interface IMyProfileLayout {
  tabs: Tab[];
}

const MyProfileLayout: React.FunctionComponent<IMyProfileLayout> = ({
  tabs,
  children,
}) => {
  const { t } = useTranslation('profile');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const router = useRouter();
  // Show skeleton on route change
  const [routeChangeLoading, setRouteChangeLoading] = useState(false);

  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  // Edit Profile menu
  const [isEditProfileMenuOpen, setIsEditProfileMenuOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<TEditingStage>('edit-general');
  const [wasModified, setWasModified] = useState(true);

  const handleSetWasModified = useCallback((newState: boolean) => {
    setWasModified(newState);
  }, [setWasModified]);

  const handleCloseEditProfileMenu = useCallback(() => {
    if (isBroswer()) {
      router.push({
        pathname: window.location.pathname,
        hash: undefined,
      }, undefined, { shallow: true });
    }
    setIsEditProfileMenuOpen(false);
  }, [setIsEditProfileMenuOpen, router]);

  const handleOpenEditProfileMenu = () => {
    // Allow closing with browser back button
    if (isBroswer()) {
      router.push({
        pathname: window.location.pathname,
        hash: 'edit-profile',
      }, undefined, { shallow: true });
    }
    setEditingStage('edit-general');
    setIsEditProfileMenuOpen(true);
  };

  const handleSetStageToEditingProfilePicture = () => {
    if (isBroswer()) {
      router.push({
        pathname: window.location.pathname,
        hash: 'edit-profile-image',
      }, undefined, { shallow: true });
    }
    setEditingStage('edit-profile-picture');
  };

  const handleSetStageToEditingGeneral = () => {
    if (isBroswer()) {
      router.push({
        pathname: window.location.pathname,
        hash: 'edit-profile',
      }, undefined, { shallow: true });
    }
    setEditingStage('edit-general');
  };

  const handleClosePreventDiscarding = useCallback(() => {
    if (!wasModified) {
      handleCloseEditProfileMenu();
      return;
    }

    // eslint-disable-next-line no-alert
    const result = window.confirm(t('EditProfileMenu.confirmationWindow'));
    if (result) {
      handleCloseEditProfileMenu();
    }
  }, [wasModified, handleCloseEditProfileMenu, t]);

  // Redirect to / if user is not logged in
  useEffect(() => {
    if (!user.loggedIn) {
      router.push('/');
    }
  }, [router, user]);

  // Allow back button behavior
  useEffect(() => {
    const verify = () => {
      const { hash } = window.location;
      if (!hash) {
        setIsEditProfileMenuOpen(false);
      } else if (hash === '#edit-profile') {
        setEditingStage('edit-general');
      }
    };

    router.events.on('hashChangeComplete', verify);

    return () => router.events.off('hashChangeComplete', verify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const start = () => {
      setRouteChangeLoading(true);
    };
    const end = () => {
      setRouteChangeLoading(false);
    };
    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', end);
    Router.events.on('routeChangeError', end);
    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', end);
      Router.events.off('routeChangeError', end);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SGeneral>
          <SMyProfileLayout>
            <ProfileBackground
              // Temp
              pictureURL={user?.userData?.coverUrl ?? '../public/images/mock/profile-bg.png'}
            >
              <Button
                view="transparent"
                withShrink
                withDim
                iconOnly={isMobileOrTablet}
                onClick={() => handleOpenEditProfileMenu()}
              >
                <InlineSvg
                  svg={EditIcon}
                  width={isMobileOrTablet ? '20px' : '24px'}
                  height={isMobileOrTablet ? '20px' : '24px'}
                />
                {isMobileOrTablet ? null : t('ProfileLayout.headerButtons.edit')}
              </Button>
              <Button
                view="transparent"
                withDim
                withShrink
                iconOnly={isMobileOrTablet}
                onClick={() => router.push('/profile/settings')}
              >
                <InlineSvg
                  svg={SettingsIcon}
                  width={isMobileOrTablet ? '20px' : '24px'}
                  height={isMobileOrTablet ? '20px' : '24px'}
                />
                {isMobileOrTablet ? null : t('ProfileLayout.headerButtons.settings')}
              </Button>
            </ProfileBackground>
            {/* NB! Temp */}
            {user.userData?.avatarUrl && (
              <ProfileImage
                src={user.userData?.avatarUrl}
              />
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <SUsername
                variant={4}
              >
                {user.userData?.nickname}
              </SUsername>
              <SShareDiv>
                <SShareButton
                  view="tertiary"
                  iconOnly
                  withShrink
                  withDim
                  style={{
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  }}
                  onClick={() => {
                  }}
                >
                  <SUsernameButtonText>
                    @
                    {/* Temp! */}
                    {user.userData?.username && user.userData?.username.length > 12
                      ? `${user.userData?.username.substring(0, 6)}...${user.userData?.username.substring(user.userData?.username.length - 3)}`
                      : user.userData?.username}
                  </SUsernameButtonText>
                </SShareButton>
                <SShareButton
                  view="tertiary"
                  iconOnly
                  withDim
                  withShrink
                  style={{
                    padding: '8px',
                  }}
                  onClick={() => {
                  }}
                >
                  <InlineSvg
                    svg={ShareIconFilled}
                    fill={theme.colorsThemed.text.primary}
                    width="20px"
                    height="20px"
                  />
                </SShareButton>
              </SShareDiv>
              {user.userData?.bio ? (
                <SBioText
                  variant={3}
                >
                  {user.userData?.bio}
                </SBioText>
              ) : null}
            </div>
            <ProfileTabs
              pageType="myProfile"
              tabs={tabs}
            />
            {/* Edit Profile modal menu */}
            <Modal
              show={isEditProfileMenuOpen}
              overlayDim
              transitionSpeed={isMobileOrTablet ? 0.5 : 0}
              onClose={handleClosePreventDiscarding}
            >
              {isEditProfileMenuOpen
                ? (
                  <EditProfileMenu
                    stage={editingStage}
                    wasModified={wasModified}
                    handleClose={handleCloseEditProfileMenu}
                    handleSetWasModified={handleSetWasModified}
                    handleClosePreventDiscarding={handleClosePreventDiscarding}
                    handleSetStageToEditingProfilePicture={handleSetStageToEditingProfilePicture}
                    handleSetStageToEditingGeneral={handleSetStageToEditingGeneral}
                  />
                ) : null}
            </Modal>
          </SMyProfileLayout>
          {!routeChangeLoading
            ? children : (
              <SSkeletonWrapper>
                <Skeleton
                  count={7}
                  borderRadius={16}
                  duration={2}
                  className="skeletonSpan"
                  containerClassName="skeletonsContainer"
                  wrapper={
                    ({ children: skeletons }) => (
                      <SSingleSkeletonWrapper>{ skeletons }</SSingleSkeletonWrapper>
                    )
                  }
                />
              </SSkeletonWrapper>
            )}
        </SGeneral>
      </SkeletonTheme>
    </ErrorBoundary>
  );
};

export default MyProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }

  @media (max-width: 768px) {
    main {
      div:first-child {
        padding-left: 0;
        padding-right: 0;

        div:first-child {
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }
`;

const SUsername = styled(Headline)`
  text-align: center;

  margin-bottom: 12px;
`;

const SShareDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 12px;

  margin-bottom: 16px;
`;

const SShareButton = styled(Button)`
  &:focus:enabled {
    background: ${({
    theme,
    view,
  }) => theme.colorsThemed.button.background[view!!]};
  }
`;

const SUsernameButtonText = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;

  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 54px;

  max-width: 480px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMyProfileLayout = styled.div`
  position: relative;
  overflow: hidden;

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

const SkeletonDiagonal = keyframes`
  0% {
    transform: rotate(45deg) translateX(-600px);
  }
  100% {
    transform: rotate(45deg) translateX(200px);
  }
`;

const SkeletonWrapperAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const SSingleSkeletonWrapper = styled.div`
  display: flex;
  height: 562px;
  width: 100%;

  ${({ theme }) => theme.media.mobileL} {
    width: 224px;
    height: 336px;
  }
`;

const SSkeletonWrapper = styled.div`
  width: 100%;
  min-height: 500px;

  opacity: 0;
  animation: ${SkeletonWrapperAnimation} .3s forwards;

  .skeletonsContainer {
    display: flex;
    flex-wrap: wrap;
    gap: 32px;

    .skeletonSpan {

    }

    span {
      &:after {
        width: 200%;
        height: 200%;

        animation-name: ${SkeletonDiagonal};
      }
    }
  }
`;
