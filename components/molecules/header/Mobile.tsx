/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import Logo from '../Logo';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/search/SearchInput';
import { useAppSelector } from '../../../redux-store/store';
import { RewardContext } from '../../../contexts/rewardContext';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import RewardButton from '../RewardButton';
import { Mixpanel } from '../../../utils/mixpanel';
import Button from '../../atoms/Button';

export const Mobile: React.FC = React.memo(() => {
  const user = useAppSelector((state) => state.user);
  const { t } = useTranslation();
  const { rewardBalance, isRewardBalanceLoading } = useContext(RewardContext);
  const { currentSignupRewardAmount } = useGetAppConstants().appConstants;

  return (
    <SContainer>
      <Logo />
      <SRightBlock>
        <SItemWithMargin>
          <SearchInput />
        </SItemWithMargin>
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
              <UserAvatar withClick avatarUrl={user.userData?.avatarUrl} />
            </a>
          </Link>
        </SItemWithMargin>
        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator ? (
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
                        });
                      }}
                    >
                      {t('button.createDecision')}
                    </SButton>
                  </a>
                </Link>
              </SItemWithMargin>
            ) : (
              <SItemWithMargin>
                <Link href='/creator-onboarding'>
                  <a>
                    <SButton view='primaryGrad' withDim withShrink withShadow>
                      {t('button.createOnNewnew')}
                    </SButton>
                  </a>
                </Link>
              </SItemWithMargin>
            )}
            <SItemWithMargin>
              <RewardButton
                balance={
                  rewardBalance ? rewardBalance.usdCents / 100 : undefined
                }
                loading={isRewardBalanceLoading}
              />
            </SItemWithMargin>
          </>
        ) : (
          <>
            <SItemWithMargin>
              <Link href='/sign-up?to=create'>
                <a>
                  <SButton
                    view='primaryGrad'
                    withDim
                    withShrink
                    withShadow
                    onClick={() => {
                      Mixpanel.track('Navigation Item Clicked', {
                        _button: 'Create now',
                      });
                    }}
                  >
                    {t('button.createOnNewnew')}
                  </SButton>
                </a>
              </Link>
            </SItemWithMargin>
            {currentSignupRewardAmount && (
              <SItemWithMargin>
                <RewardButton
                  balance={currentSignupRewardAmount.usdCents ?? undefined}
                  offer
                />
              </SItemWithMargin>
            )}
          </>
        )}
      </SRightBlock>
    </SContainer>
  );
});

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
  margin-left: 16px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 24px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-left: 16px;
  }
`;

// Not perfect but should work. Include into brand book later
const SButton = styled(Button)`
  padding: 12px;
  height: 36px;
`;
