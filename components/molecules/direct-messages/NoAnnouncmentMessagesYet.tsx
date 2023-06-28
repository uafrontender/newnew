import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSvg from '../../atoms/InlineSVG';

import CrystalBall from '../../../public/images/svg/CrystalBall.svg';

const NoAnnouncementMessagesYet: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Chat');

  return (
    <SContainer>
      <SContent>
        <SInlineSvg svg={CrystalBall} width='48px' height='48px' />
        <SText>{t('newAnnouncement.noAnnouncement')}</SText>
      </SContent>
    </SContainer>
  );
});

const SContainer = styled.div`
  position: absolute;
  left: 0;
  top: calc(50% - 50px);
  right: 0;
  padding: 0 20px;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  text-align: center;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SText = styled.p`
  margin: 0;
  font-weight: 600;
`;

const SContent = styled.div`
  max-width: 352px;
  margin: 0 auto;
`;

const SInlineSvg = styled(InlineSvg)`
  margin: 0 auto 12px;
`;

export default NoAnnouncementMessagesYet;
