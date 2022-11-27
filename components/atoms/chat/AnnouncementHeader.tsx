import React from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import getDisplayname from '../../../utils/getDisplayname';

interface IAnnouncementHeader {
  user: newnewapi.IUser | null;
}

const AnnouncementHeader: React.FC<IAnnouncementHeader> = React.memo(
  ({ user }) => {
    const { t } = useTranslation('page-Chat');

    return (
      <SAnnouncementHeader>
        <SAnnouncementText>
          {t('announcement.topMessageStart')}{' '}
          <SAnnouncementName>{getDisplayname(user)}</SAnnouncementName>{' '}
          {t('announcement.topMessageEnd')}
        </SAnnouncementText>
      </SAnnouncementHeader>
    );
  }
);

export default AnnouncementHeader;

const SAnnouncementHeader = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const SAnnouncementText = styled.div`
  text-align: center;
  font-size: 14px;
  padding: 12px 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};
`;

const SAnnouncementName = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
