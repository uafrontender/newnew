/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Caption from '../../atoms/Caption';
import Text from '../../atoms/Text';
import Toggle from '../../atoms/Toggle';
import Button from '../../atoms/Button';

type TPrivacySection = {
  isSpendingHidden: boolean,
  isAccountPrivate: boolean;
  blockedUsers: Omit<newnewapi.User, 'toJSON'>[];
  handleToggleSpendingHidden: () => void;
  handleToggleAccountPrivate: () => void;
  handleUnblockUser: () => void;
  handleCloseAccount: () => void;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};

const PrivacySection: React.FunctionComponent<TPrivacySection> = ({
  isSpendingHidden,
  isAccountPrivate,
  blockedUsers,
  handleToggleSpendingHidden,
  handleToggleAccountPrivate,
  handleUnblockUser,
  handleCloseAccount,
  handleSetActive,
}) => {
  const { t } = useTranslation('profile');

  return (
    <SWrapper
      onMouseEnter={() => handleSetActive()}
    >
      <SHidingSubsectionsContainer>
        <SHidingSubsection>
          <SHidingSubsectionTitle
            variant={2}
          >
            { t('Settings.sections.Privacy.privacySubsections.spendings.title') }
          </SHidingSubsectionTitle>
          <SHidingSubsectionCaption
            variant={2}
          >
            { t('Settings.sections.Privacy.privacySubsections.spendings.caption') }
          </SHidingSubsectionCaption>
          <Toggle
            checked={isSpendingHidden}
            onChange={() => handleToggleSpendingHidden()}
            wrapperStyle={{
              gridArea: 'toggle',
              justifySelf: 'right',
            }}
          />
        </SHidingSubsection>
        <SHidingSubsection>
          <SHidingSubsectionTitle
            variant={2}
          >
            { t('Settings.sections.Privacy.privacySubsections.private.title') }
          </SHidingSubsectionTitle>
          <SHidingSubsectionCaption
            variant={2}
          >
            { t('Settings.sections.Privacy.privacySubsections.private.caption') }
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
        <SBlockedUsersContainerTitle
          variant={2}
        >
          { t('Settings.sections.Privacy.blockedusers.title') }
        </SBlockedUsersContainerTitle>
        {blockedUsers && blockedUsers.map((u) => (
          <SBlockedUserCard>
            <SAvatar>
              <img
                alt={u.username}
                src={u.avatarUrl}
              />
            </SAvatar>
            <SNickname
              variant={3}
            >
              { u.nickname }
            </SNickname>
            <SUsername
              variant={2}
            >
              { u.username }
            </SUsername>
            <SUnblockButton
              onClick={handleUnblockUser}
              view="secondary"
            >
              { t('Settings.sections.Privacy.blockedusers.unblockBtn') }
            </SUnblockButton>
          </SBlockedUserCard>
        ))}
      </SBlockedUsersContainer>
      <SCloseAccountSubsection>
        <SHidingSubsectionTitle
          variant={2}
        >
          { t('Settings.sections.Privacy.closeAccount.title') }
        </SHidingSubsectionTitle>
        <SHidingSubsectionCaption
          variant={2}
        >
          { t('Settings.sections.Privacy.closeAccount.caption') }
        </SHidingSubsectionCaption>
        <SCloseAccountButton
          onClick={handleCloseAccount}
          view="secondary"
        >
          { t('Settings.sections.Privacy.closeAccount.closeBtn') }
        </SCloseAccountButton>
      </SCloseAccountSubsection>
    </SWrapper>
  );
};

export default PrivacySection;

const SWrapper = styled.div`

`;

const SHidingSubsectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  padding-bottom: 16px;

  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SHidingSubsection = styled.div`
  display: grid;
  grid-template-areas:
    'titleAr toggle'
    'captionAr toggle'
  ;
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
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SBlockedUsersContainerTitle = styled(Text)`
  margin-top: 16px;
`;

const SBlockedUserCard = styled.div`
  display: grid;
  grid-template-areas:
    'avatar nickname unblock'
    'avatar username unblock'
  ;
  grid-template-columns: 52px 2fr 4fr;
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
  grid-area: nickname;
`;

const SUsername = styled(Caption)`
  grid-area: username;
  position: relative;
  top: -6px;

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
    'captionAr delete'
  ;
  grid-template-columns: 5fr 1fr;

  padding-top: 16px;
  padding-bottom: 16px;
`;

const SCloseAccountButton = styled(Button)`
  grid-area: delete;
  justify-self: right;
`;
