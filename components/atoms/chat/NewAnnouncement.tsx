import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import megaphone from '../../../public/images/svg/icons/filled/Megaphone.svg';
import InlineSVG from '../InlineSVG';

interface INewAnnouncement {
  handleClick: () => void;
}

const NewAnnouncement: React.FC<INewAnnouncement> = ({ handleClick }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Chat');

  return (
    <SWrapper onClick={handleClick}>
      <SInlineSVG
        svg={megaphone}
        fill={theme.colorsThemed.text.secondary}
        width='26px'
        height='26px'
      />
      <SText>
        <STitle>{t('newAnnouncement.title')}</STitle>
        <p>{t('newAnnouncement.text')}</p>
      </SText>
    </SWrapper>
  );
};

export default NewAnnouncement;

const SWrapper = styled.div`
  cursor: pointer;
  padding: 10px 14px;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  &:hover {
    background: ${(props) => props.theme.colorsThemed.background.quaternary};
  }
`;

const SText = styled.div`
  display: flex;
  flex-direction: column;
`;

const STitle = styled.strong`
  color: #fff;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 4px;
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 14px;
`;
