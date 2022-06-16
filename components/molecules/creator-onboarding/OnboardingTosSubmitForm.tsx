/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../../atoms/Button';
import { useAppSelector } from '../../../redux-store/store';
import CheckMark from '../CheckMark';

interface IOnboardingTosSubmitForm {
  handleGoToNext: () => void;
  hasScrolledDown?: boolean;
  hasScrolledDownDesktop?: boolean;
}

const OnboardingTosSubmitForm: React.FunctionComponent<IOnboardingTosSubmitForm> =
  ({ handleGoToNext, hasScrolledDown, hasScrolledDownDesktop }) => {
    const { t } = useTranslation('page-CreatorOnboarding');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [agreed, setAgreed] = useState(false);

    if (isMobile) {
      return (
        <SMobileButtonContainer>
          <SMobileButton
            view='primaryGrad'
            disabled={!hasScrolledDown}
            onClick={() => handleGoToNext()}
          >
            {t('tosSection.button.submit')}
          </SMobileButton>
        </SMobileButtonContainer>
      );
    }

    return (
      <STabletForm>
        <SCheckBox
          label={
            hasScrolledDownDesktop
              ? t('tosSection.agreedToTosCheckbox')
              : t('tosSection.scrollDownToContinue')
          }
          selected={agreed}
          disabled={!hasScrolledDownDesktop}
          handleChange={(e: any) => setAgreed(!agreed)}
        />
        <Button
          view='primaryGrad'
          disabled={!agreed}
          onClick={() => handleGoToNext()}
        >
          {t('tosSection.button.submit')}
        </Button>
      </STabletForm>
    );
  };

OnboardingTosSubmitForm.defaultProps = {
  hasScrolledDown: undefined,
  hasScrolledDownDesktop: undefined,
};

export default OnboardingTosSubmitForm;

const SMobileButtonContainer = styled.div`
  position: fixed;
  left: 16px;
  bottom: 24px;

  width: calc(100% - 32px);

  border-radius: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  box-shadow: 0px 0px 32px 36px
    ${({ theme }) =>
      theme.name === 'dark'
        ? 'rgba(20, 21, 31, .9)'
        : 'rgba(241, 243, 249, 1)'}; ;
`;

const SMobileButton = styled(Button)`
  height: 56px;
  width: 100%;
`;

const STabletForm = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 20px;
  padding-bottom: 20px;

  height: 102px;
  padding-left: 152px;
  padding-right: 152px;

  ${({ theme }) => theme.media.laptop} {
    height: 118px;

    padding-left: 0;
    padding-right: 104px;
  }
`;

const SCheckBox = styled(CheckMark)`
  position: relative;
  top: 12px;
`;
