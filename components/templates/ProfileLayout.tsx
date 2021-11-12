/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

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
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import FavouritesIconFilled from '../../public/images/svg/icons/filled/Favourites.svg';
import MoreIconFilled from '../../public/images/svg/icons/filled/More.svg';

interface IProfileLayout {
  user: Omit<newnewapi.User, 'toJSON'>;
  tabs: Tab[];
}

const ProfileLayout: React.FunctionComponent<IProfileLayout> = ({
  user,
  tabs,
  children,
}) => {
  const { t } = useTranslation('profile');
  const theme = useTheme();

  const { resizeMode } = useAppSelector((state) => state.ui);
  const curentUser = useAppSelector((state) => state.user);
  const router = useRouter();

  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  // Redirect to /profile page if the page is of current user's own
  useEffect(() => {
    if (curentUser.loggedIn && curentUser.userData?.id?.toString() === user.id.toString()) {
      // console.log('redirecting');
      router.push('/profile');
    }
  }, [curentUser.loggedIn, curentUser.userData?.id, router, user.id]);

  return (
    <SGeneral>
      <SProfileLayout>
        <ProfileBackground
          pictureURL="/images/mock/profile-bg.png"
        />
        {/* Favorites and more options buttons */}
        <SFavoritesButton
          view="transparent"
          size="sm"
          iconOnly
          noRipple
          onClick={() => {}}
        >
          <InlineSvg
            svg={FavouritesIconFilled}
            fill={theme.colorsThemed.text.primary}
            width={isMobileOrTablet ? '20px' : '24px'}
            height={isMobileOrTablet ? '20px' : '24px'}
          />
          {t('ProfileLayout.buttons.favorites')}
        </SFavoritesButton>
        <SMoreButton
          view="transparent"
          size="sm"
          iconOnly
          noRipple
          onClick={() => {}}
        >
          <InlineSvg
            svg={MoreIconFilled}
            fill={theme.colorsThemed.text.primary}
            width={isMobileOrTablet ? '20px' : '24px'}
            height={isMobileOrTablet ? '20px' : '24px'}
          />
          {t('ProfileLayout.buttons.more')}
        </SMoreButton>
        <ProfileImage
          src={user.avatarUrl ?? ''}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <SUsername
            variant={4}
          >
            {user.displayName}
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
                {user.username && user.username.length > 12
                  ? `${user.username.substring(0, 6)}...${user.username.substring(user.username.length - 3)}`
                  : user.username}
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
            {/* {user.bio} */}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            {' '}
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </SBioText>
        </div>
        {user.options?.isCreator // && !user.options?.isPrivate
          ? (
            <ProfileTabs
              pageType="othersProfile"
              tabs={tabs}
            />
          ) : null }
      </SProfileLayout>
      { children }
    </SGeneral>
  );
};

export default ProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 2;
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

const SFavoritesButton = styled(Button)`
  position: absolute;
  top: 164px;
  right: 4px;

  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${(props) => props.theme.media.tablet} {
    top: 204px;
    right: calc(4px + 56px);
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
  }
`;

const SMoreButton = styled(Button)`
  position: absolute;
  top: 164px;
  left: 4px;

  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${(props) => props.theme.media.tablet} {
    top: 204px;
    left: initial;
    right: 4px;
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
  }
`;

const SProfileLayout = styled.div`
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
