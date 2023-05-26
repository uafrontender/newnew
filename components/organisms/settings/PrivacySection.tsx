/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, { useEffect, useState } from 'react';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Caption from '../../atoms/Caption';
import Text from '../../atoms/Text';
// import Toggle from '../../atoms/Toggle';
import Button from '../../atoms/Button';
import ConfirmDeleteAccountModal from '../../molecules/settings/ConfirmDeleteAccountModal';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import { getUserByUsername } from '../../../api/endpoints/user';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { Mixpanel } from '../../../utils/mixpanel';
import Loader from '../../atoms/Loader';
import DisplayName from '../../atoms/DisplayName';

type TPrivacySection = {
  isSpendingHidden: boolean;
  // isAccountPrivate: boolean;
  handleToggleSpendingHidden: () => void;
  // handleToggleAccountPrivate: () => void;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};

// NOTE: activity is temporarily disabled
const PrivacySection: React.FunctionComponent<TPrivacySection> = ({
  isSpendingHidden,
  // isAccountPrivate,
  handleToggleSpendingHidden,
  // handleToggleAccountPrivate,
  handleSetActive,
}) => {
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();

  const [isConfirmDeleteMyAccountVisible, setIsConfirmDeleteMyAccountVisible] =
    useState(false);
  // Blocked users
  const {
    usersIBlocked: usersIBlockedIds,
    changeUserBlockedStatus,
    isChangingUserBlockedStatus,
  } = useGetBlockedUsers();
  const [blockedUsers, setBlockedUsers] = useState<
    Omit<newnewapi.User, 'toJSON'>[]
  >([]);
  const [isBlockedUsersLoading, setBlockedUsersLoading] = useState(false);

  // TODO: we need to make a normal non-hacky request here
  useEffect(() => {
    async function fetchUsersIBlocked() {
      setBlockedUsersLoading(true);
      try {
        const users: newnewapi.User[] = [];
        for (let i = 0; i < usersIBlockedIds.length; i++) {
          const payload = new newnewapi.GetUserRequest({
            uuid: usersIBlockedIds[i],
          });

          const res = await getUserByUsername(payload);

          if (!res?.data || res.error) {
            throw new Error(res?.error?.message ?? 'Request failed');
          }

          if (res.data) {
            users.push(res.data);
          }
        }
        setBlockedUsers(users);
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      } finally {
        setBlockedUsersLoading(false);
      }
    }

    fetchUsersIBlocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersIBlockedIds]);

  return (
    <SWrapper onMouseEnter={() => handleSetActive()}>
      {/* <SHidingSubsectionsContainer> */}
      {/* <SHidingSubsection>
          <SHidingSubsectionTitle variant={2}>
            {t('Settings.sections.privacy.privacySubsections.spending.title')}
          </SHidingSubsectionTitle>
          <SHidingSubsectionCaption variant={2}>
            {t(
              'Settings.sections.privacy.privacySubsections.spending.caption'
            )}
          </SHidingSubsectionCaption>
          <Toggle
            checked={isSpendingHidden}
            onChange={() => handleToggleSpendingHidden()}
            wrapperStyle={{
              gridArea: 'toggle',
              justifySelf: 'right',
            }}
          />
        </SHidingSubsection> */}
      {/* <SHidingSubsection>
          <SHidingSubsectionTitle variant={2}>
            {t('Settings.sections.privacy.privacySubsections.private.title')}
          </SHidingSubsectionTitle>
          <SHidingSubsectionCaption variant={2}>
            {t('Settings.sections.privacy.privacySubsections.private.caption')}
          </SHidingSubsectionCaption>
          <Toggle
            checked={isAccountPrivate}
            onChange={() => handleToggleAccountPrivate()}
            wrapperStyle={{
              gridArea: 'toggle',
              justifySelf: 'right',
            }}
          />
          </SHidingSubsection> */}
      {/* </SHidingSubsectionsContainer> */}
      <SBlockedUsersContainer>
        <SBlockedUsersContainerTitle variant={2}>
          {t('Settings.sections.privacy.blockedUsers.title')}
        </SBlockedUsersContainerTitle>
        {blockedUsers.length === 0 && !isBlockedUsersLoading ? (
          <Text variant={3}>
            {t('Settings.sections.privacy.blockedUsers.noBlockedUsers')}
          </Text>
        ) : null}
        {isBlockedUsersLoading && blockedUsers?.length === 0 ? (
          <SLoader />
        ) : null}
        {blockedUsers &&
          blockedUsers.map((user) => (
            <SBlockedUserCard key={user.uuid}>
              <SAvatar>
                <img alt={user.username} src={user.avatarUrl} />
              </SAvatar>
              <SNickname variant={3}>
                <DisplayName user={user} />
              </SNickname>
              <Link href={`/${user.username}`}>
                <SLink>
                  <SUsername variant={2}>{`@${user.username}`}</SUsername>
                </SLink>
              </Link>
              <SUnblockButton
                disabled={isChangingUserBlockedStatus || isBlockedUsersLoading}
                onClick={() => {
                  Mixpanel.track('Unblock user', {
                    _stage: 'Settings',
                    _userUuid: user.uuid,
                  });
                  changeUserBlockedStatus(user.uuid, false);
                }}
                view='secondary'
              >
                {t('Settings.sections.privacy.blockedUsers.button.unblock')}
              </SUnblockButton>
            </SBlockedUserCard>
          ))}
      </SBlockedUsersContainer>
      <SCloseAccountSubsection>
        <SHidingSubsectionTitle variant={2}>
          {t('Settings.sections.privacy.closeAccount.title')}
        </SHidingSubsectionTitle>
        <SCloseAccountButton
          onClick={() => {
            Mixpanel.track('Delete Account Button Clicked', {
              _stage: 'Settings',
            });
            setIsConfirmDeleteMyAccountVisible(true);
          }}
          view='secondary'
        >
          {t('Settings.sections.privacy.closeAccount.button.delete')}
        </SCloseAccountButton>
        <ConfirmDeleteAccountModal
          isVisible={isConfirmDeleteMyAccountVisible}
          closeModal={() => {
            Mixpanel.track('Close Confirm Delete Account Modal', {
              _stage: 'Settings',
            });

            setIsConfirmDeleteMyAccountVisible(false);
          }}
        />
      </SCloseAccountSubsection>
    </SWrapper>
  );
};

export default PrivacySection;

const SWrapper = styled.div``;

/* const SHidingSubsectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  padding-bottom: 16px;

  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SHidingSubsection = styled.div`
  display: grid;
  grid-template-areas:
    'titleAr toggle'
    'captionAr toggle';
  grid-template-columns: 5fr 1fr; 
`; */

const SHidingSubsectionTitle = styled(Text)`
  grid-area: titleAr;

  margin-bottom: 8px;
`;

/* const SHidingSubsectionCaption = styled(Caption)`
  grid-area: captionAr;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`; */

const SBlockedUsersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  padding-bottom: 16px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SBlockedUsersContainerTitle = styled(Text)`
  margin-top: 16px;
`;

const SBlockedUserCard = styled.div`
  display: grid;
  grid-template-areas:
    'avatar nickname unblock'
    'avatar username unblock';
  grid-template-columns: 52px 1fr min-content;
`;

const SAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;

  grid-area: avatar;
  justify-self: left;

  width: 36px;
  height: 36px;
  border-radius: 50%;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SNickname = styled(Text)`
  display: flex;
  align-items: center;
  grid-area: nickname;
  overflow: hidden;
`;

const SLink = styled.a`
  overflow: hidden;
`;

const SUsername = styled(Caption)`
  grid-area: username;
  position: relative;
  top: -3px;
  overflow: hidden;
  text-overflow: ellipsis;

  cursor: pointer;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SUnblockButton = styled(Button)`
  margin-left: 12px;
  grid-area: unblock;
  justify-self: right;
`;

const SCloseAccountSubsection = styled.div`
  display: grid;
  grid-template-areas:
    'titleAr delete'
    'captionAr delete';
  grid-template-columns: 5fr 1fr;
  grid-template-rows: 100%;
  align-items: center;

  padding-top: 16px;
  padding-bottom: 16px;
`;

const SCloseAccountButton = styled(Button)`
  grid-area: delete;
  justify-self: right;
`;

const SLoader = styled(Loader)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 24px;
`;
