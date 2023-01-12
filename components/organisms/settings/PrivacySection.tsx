/* eslint-disable no-plusplus */
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
import Toggle from '../../atoms/Toggle';
import Button from '../../atoms/Button';
import ConfirmDeleteAccountModal from '../../molecules/settings/ConfirmDeleteAccountModal';
import InlineSvg from '../../atoms/InlineSVG';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import getDisplayname from '../../../utils/getDisplayname';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import { getUserByUsername } from '../../../api/endpoints/user';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

type TPrivacySection = {
  isSpendingHidden: boolean;
  isAccountPrivate: boolean;
  handleToggleSpendingHidden: () => void;
  handleToggleAccountPrivate: () => void;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};

const PrivacySection: React.FunctionComponent<TPrivacySection> = ({
  isSpendingHidden,
  isAccountPrivate,
  handleToggleSpendingHidden,
  handleToggleAccountPrivate,
  handleSetActive,
}) => {
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();

  const [isConfirmDeleteMyAccountVisible, setIsConfirmDeleteMyAccountVisible] =
    useState(false);
  // Blocked users
  const { usersIBlocked: usersIBlockedIds, changeUserBlockedStatus } =
    useGetBlockedUsers();
  const [blockedUsers, setBlockedUsers] = useState<
    Omit<newnewapi.User, 'toJSON'>[]
  >([]);

  useEffect(() => {
    async function fetchUsersIBlocked() {
      try {
        const users: newnewapi.User[] = [];
        for (let i = 0; i < usersIBlockedIds.length; i++) {
          const payload = new newnewapi.GetUserRequest({
            uuid: usersIBlockedIds[i],
          });
          const res = await getUserByUsername(payload);
          if (!res.data || res.error)
            throw new Error(res.error?.message ?? 'Request failed');
          if (res.data) {
            users.push(res.data);
          }
        }
        setBlockedUsers(users);
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      }
    }

    fetchUsersIBlocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersIBlockedIds]);

  return (
    <SWrapper onMouseEnter={() => handleSetActive()}>
      <SHidingSubsectionsContainer>
        {/* <SHidingSubsection>
          <SHidingSubsectionTitle variant={2}>
            {t('Settings.sections.privacy.privacySubsections.spendings.title')}
          </SHidingSubsectionTitle>
          <SHidingSubsectionCaption variant={2}>
            {t(
              'Settings.sections.privacy.privacySubsections.spendings.caption'
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
        <SHidingSubsection>
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
        </SHidingSubsection>
      </SHidingSubsectionsContainer>
      <SBlockedUsersContainer>
        <SBlockedUsersContainerTitle variant={2}>
          {t('Settings.sections.privacy.blockedUsers.title')}
        </SBlockedUsersContainerTitle>
        {blockedUsers.length === 0 && (
          <Text variant={3}>
            {t('Settings.sections.privacy.blockedUsers.noBlockedUsers')}
          </Text>
        )}
        {blockedUsers &&
          blockedUsers.map((user) => (
            <SBlockedUserCard key={user.uuid}>
              <SAvatar>
                <img alt={user.username} src={user.avatarUrl} />
              </SAvatar>
              <SNickname variant={3}>
                {getDisplayname(user)}
                {user.options?.isVerified && (
                  <SInlineSVG
                    svg={VerificationCheckmark}
                    width='16px'
                    height='16px'
                    fill='none'
                  />
                )}
              </SNickname>

              <Link href={`/${user.username}`}>
                <a>
                  <SUsername variant={2}>{`@${user.username}`}</SUsername>
                </a>
              </Link>
              <SUnblockButton
                onClick={() => changeUserBlockedStatus(user.uuid, false)}
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
          onClick={() => setIsConfirmDeleteMyAccountVisible(true)}
          view='secondary'
        >
          {t('Settings.sections.privacy.closeAccount.button.delete')}
        </SCloseAccountButton>
        <ConfirmDeleteAccountModal
          isVisible={isConfirmDeleteMyAccountVisible}
          closeModal={() => setIsConfirmDeleteMyAccountVisible(false)}
        />
      </SCloseAccountSubsection>
    </SWrapper>
  );
};

export default PrivacySection;

const SWrapper = styled.div``;

const SHidingSubsectionsContainer = styled.div`
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
`;

const SHidingSubsectionTitle = styled(Text)`
  grid-area: titleAr;

  margin-bottom: 8px;
`;

const SHidingSubsectionCaption = styled(Caption)`
  grid-area: captionAr;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

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
`;

const SInlineSVG = styled(InlineSvg)`
  min-width: 24px;
  min-height: 24px;
  margin-left: 6px;
`;

const SUsername = styled(Caption)`
  grid-area: username;
  position: relative;
  top: -6px;

  cursor: pointer;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SUnblockButton = styled(Button)`
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
