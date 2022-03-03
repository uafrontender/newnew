import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

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
  justify-content: center;
  align-items: center;

  cursor: pointer;
  transition: 0.2s linear;

  border: transparent;

  height: 108px;
  width: 96px;

  margin: 0px 6px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 8px;

  &:hover, &:active {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
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

const SCardAmount = styled.div`
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
