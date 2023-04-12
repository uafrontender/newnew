import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

type TSettingsEmailInput = React.ComponentPropsWithoutRef<'input'> & {
  labelCaption: string;
  onEditButtonClick: () => void;
};

const SettingsEmailInput: React.FunctionComponent<TSettingsEmailInput> = ({
  value,
  labelCaption,
  onEditButtonClick,
}) => {
  const { t } = useTranslation('page-Profile');

  return (
    <SContainer>
      <SLabel htmlFor='settings_email_input'>{labelCaption}</SLabel>
      <SInputWrapper>
        <SSettingsEmailInput isEmpty={!value}>
          {value ||
            t('Settings.sections.personalInformation.emailInput.placeholder')}
        </SSettingsEmailInput>
        <SEditButton onClick={onEditButtonClick}>
          {t('Settings.sections.personalInformation.emailInput.edit')}
        </SEditButton>
      </SInputWrapper>
    </SContainer>
  );
};

export default SettingsEmailInput;

const SContainer = styled.div`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 344px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 352px;
  }
`;

const SLabel = styled.label`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

interface ISSettingsEmailInput {
  errorBordersShown?: boolean;
  isEmpty?: boolean;
}

const SInputWrapper = styled.div`
  position: relative;
`;

const SSettingsEmailInput = styled.div<ISSettingsEmailInput>`
  display: block;

  height: 44px;
  width: 100%;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 50px 12px 20px;

  overflow: hidden;
  text-overflow: ellipsis;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.background.outlines1;
    }
    return theme.colorsThemed.accent.error;
  }};

  color: ${({ theme, isEmpty }) =>
    isEmpty
      ? theme.colorsThemed.text.quaternary
      : theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    height: 48px;

    font-size: 16px;
    line-height: 21px;
  }
`;

const SEditButton = styled.button`
  position: absolute;
  right: 20px;
  top: 14px;

  background: transparent;
  border: none;
  /* outline: none; */
  cursor: pointer;
  text-decoration: underline;

  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    top: 16px;
  }
`;
