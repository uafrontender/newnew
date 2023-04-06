/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import Logo from '../Logo';
import UserAvatar from '../UserAvatar';
import { useAppSelector } from '../../../redux-store/store';
import { Mixpanel } from '../../../utils/mixpanel';
import Button from '../../atoms/Button';
import StaticSearchInput from '../../atoms/search/StaticSearchInput';
import SearchInput from '../../atoms/search/SearchInput';
import { useAppState } from '../../../contexts/appStateContext';
import canBecomeCreator from '../../../utils/canBecomeCreator';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';

export const Mobile: React.FC = () => {
  const user = useAppSelector((state) => state.user);
  const { t } = useTranslation();
  const { appConstants } = useGetAppConstants();

  const { resizeMode } = useAppState();

  const isMobileS = ['mobile', 'mobileS'].includes(resizeMode);
  const isMobileM = ['mobileM'].includes(resizeMode);
  const isMobileL = ['mobileL'].includes(resizeMode);

  return (
    <SContainer>
      <Logo isShort />
      <SRightBlock>
        {isMobileS && user.loggedIn ? (
          <SearchInput />
        ) : (
          <StaticSearchInput
            // TODO: remove nested ternary
            width={
              isMobileL && user.loggedIn
                ? '40vw'
                : isMobileM && user.loggedIn
                ? '150px'
                : undefined
            }
          />
        )}
        <SItemWithMargin>
          <Link
            href={
              user.loggedIn
                ? user.userData?.options?.isCreator
                  ? '/profile/my-posts'
                  : '/profile'
                : '/sign-up'
            }
          >
            <a>
              <UserAvatar
                withClick
                avatarUrl={user.userData?.avatarUrl}
                onClick={() =>
                  Mixpanel.track('My Avatar Clicked', {
                    _target: user.loggedIn
                      ? user.userData?.options?.isCreator
                        ? '/profile/my-posts'
                        : '/profile'
                      : '/sign-up',
                  })
                }
              />
            </a>
          </Link>
        </SItemWithMargin>
        {user.loggedIn && (
          <>
            {user.userData?.options?.isCreator && (
              <SItemWithMargin>
                <Link href='/creation'>
                  <a>
                    <SButton
                      view='primaryGrad'
                      withDim
                      withShrink
                      withShadow
                      onClick={() => {
                        Mixpanel.track('Navigation Item Clicked', {
                          _button: 'New Post',
                          _target: '/creation',
                        });
                      }}
                    >
                      {t('button.createDecision')}
                    </SButton>
                  </a>
                </Link>
              </SItemWithMargin>
            )}
            {!user.userData?.options?.isCreator &&
              canBecomeCreator(
                user.userData?.dateOfBirth,
                appConstants.minCreatorAgeYears
              ) && (
                <SItemWithMargin>
                  <Link href='/creator-onboarding'>
                    <a>
                      <SButton
                        view='primaryGrad'
                        withDim
                        withShrink
                        withShadow
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _button: 'Create Now',
                            _target: '/creator-onboarding',
                          });
                        }}
                      >
                        {t('button.createOnNewnew')}
                      </SButton>
                    </a>
                  </Link>
                </SItemWithMargin>
              )}
          </>
        )}
      </SRightBlock>
    </SContainer>
  );
};

export default Mobile;

const SContainer = styled.div`
  display: flex;
  padding: 8px 0;
  position: relative;
  align-items: center;
  justify-content: space-between;
`;

const SRightBlock = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SItemWithMargin = styled.div`
  margin-left: 6px;

  ${(props) => props.theme.media.mobileL} {
    margin-left: 16px;
  }

  ${(props) => props.theme.media.tablet} {
    margin-left: 24px;
  }
`;

// Not perfect but should work. Include into brand book later
const SButton = styled(Button)`
  padding: 10px 8px;
  height: 36px;
  font-size: 12px;

  ${(props) => props.theme.media.mobileM} {
    font-size: 13px;
  }

  ${(props) => props.theme.media.mobileL} {
    padding: 12px;
    font-size: 14px;
  }
`;
