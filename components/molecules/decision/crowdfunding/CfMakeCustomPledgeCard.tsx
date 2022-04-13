import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Headline from '../../../atoms/Headline';

interface ICfMakeCustomPledgeCard {
  handleOpenMakePledgeForm: () => void;
}

const CfMakeCustomPledgeCard: React.FunctionComponent<ICfMakeCustomPledgeCard> = ({
  handleOpenMakePledgeForm,
}) => {
  const { t } = useTranslation('decision');

  return (
    <SStandardPledgeCard
      onClick={() => handleOpenMakePledgeForm()}
    >
      <SCardInfo>
        <SCardAmount>
          { t('CfPost.BackersTab.custom') }
        </SCardAmount>
      </SCardInfo>
    </SStandardPledgeCard>
  );
};

export default CfMakeCustomPledgeCard;

const SStandardPledgeCard = styled.button`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;

  cursor: pointer;
  transition: 0.2s linear;


  height: 96px;
  width: 96px;

  margin: 0px 6px;

  background-color: transparent;
  border: 1.5px solid ${({ theme }) => theme.colorsThemed.accent.blue};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  padding: 8px;

  &:hover, &:active, &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
    color: #FFFFFF;
  }
`;

const SCardInfo = styled.div`
  width: 80%;
  background: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;
    color: ${({ theme }) => theme.colorsThemed.text.secondary};
    background: transparent;
  }
`;

const SCardAmount = styled(Headline)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  text-align: center;
  vertical-align: bottom;

  ${({ theme }) => theme.media.tablet} {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }
`;
