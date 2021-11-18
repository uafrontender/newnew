/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../redux-store/store';

import General from './General';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
import ProfileImage from '../molecules/profile/ProfileImage';
import ProfileBackground from '../molecules/profile/ProfileBackground';
import ProfileTabs, { Tab } from '../molecules/profile/ProfileTabs';

// Icons
import EditIcon from '../../public/images/svg/icons/filled/Edit.svg';
import SettingsIcon from '../../public/images/svg/icons/filled/Settings.svg';
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import Modal from '../organisms/Modal';
import EditProfileMenu from '../organisms/EditProfileMenu';
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

  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  // Edit Profile menu
  const [isEditProfileMenuOpen, setIsEditProfileMenuOpen] = useState(false);
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
    setIsEditProfileMenuOpen(true);
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
      // console.log('redirecting');
      router.push('/');
    }
  }, [router, user]);

  useEffect(() => {
    const verifyHash = () => {
      if (!isBroswer()) return;

      const { hash } = window.location;

      if ((!hash || hash !== '#edit-profile') && isEditProfileMenuOpen) {
        setIsEditProfileMenuOpen(false);
      }
    };

    verifyHash();
  });

  return (
    <SGeneral>
      <SMyProfileLayout>
        <ProfileBackground
          pictureURL="/images/mock/profile-bg.png"
        >
          <Button
            view="transparent"
            size="sm"
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
            size="sm"
            iconOnly={isMobileOrTablet}
            onClick={() => {}}
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
            {user.userData?.displayName}
          </SUsername>
          <SShareDiv>
            <Button
              view="tertiary"
              size="sm"
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
                @
                {/* Temp! */}
                {user.userData?.username && user.userData?.username.length > 12
                  ? `${user.userData?.username.substring(0, 6)}...${user.userData?.username.substring(user.userData?.username.length - 3)}`
                  : user.userData?.username}
              </SUsernameButtonText>
            </Button>
            <Button
              view="tertiary"
              size="sm"
              iconOnly
              style={{
                padding: '8px',
              }}
              onClick={() => {}}
            >
              <InlineSvg
                svg={ShareIconFilled}
                fill={theme.colorsThemed.text.primary}
                width="20px"
                height="20px"
              />
            </Button>
          </SShareDiv>
          <SBioText>
            {/* {user.userData?.bio} */}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            {' '}
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </SBioText>
        </div>
        <ProfileTabs
          pageType="myProfile"
          tabs={tabs}
        />
        {/* Edit Profile modal menu */}
        <Modal show={isEditProfileMenuOpen} onClose={handleClosePreventDiscarding}>
          {isEditProfileMenuOpen
            ? (
              <EditProfileMenu
                wasModified={wasModified}
                handleClose={handleCloseEditProfileMenu}
                handleSetWasModified={handleSetWasModified}
                handleClosePreventDiscarding={handleClosePreventDiscarding}
              />
            ) : null}
        </Modal>
      </SMyProfileLayout>
      { children }
    </SGeneral>
  );
};

export default MyProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 5;
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

const SUsernameButtonText = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SBioText = styled(Text)`
  text-align: center;

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

  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background2};

  ${(props) => props.theme.media.tablet} {
    margin-top: -8px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -16px;
  }
`;
