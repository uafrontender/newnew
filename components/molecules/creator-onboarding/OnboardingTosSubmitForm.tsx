/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../../atoms/Button';
import { useAppSelector } from '../../../redux-store/store';
import CheckBox from '../CheckBox';

interface IOnboardingTosSubmitForm {
  handleGoToNext: () => void;
}

const OnboardingTosSubmitForm: React.FunctionComponent<IOnboardingTosSubmitForm> = ({
  handleGoToNext,
}) => {
  const { t } = useTranslation('creator-onboarding');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [agreed, setAgreed] = useState(false);

  if (isMobile) {
    return (
      <SMobileButton
        view="primaryGrad"
        onClick={() => handleGoToNext()}
      >
        { t('TosSection.submitMobile') }
      </SMobileButton>
    );
  }

  return (
    <STabletForm>
      <SCheckBox
        label={t('TosSection.agreenToTosCheckbox')}
        selected={agreed}
        handleChange={(e) => setAgreed(!agreed)}
      />
      <Button
        view="primaryGrad"
        disabled={!agreed}
        onClick={() => handleGoToNext()}
      >
        { t('TosSection.submitDesktop') }
      </Button>
    </STabletForm>
  );
};

export default OnboardingTosSubmitForm;

const SMobileButton = styled(Button)`
  position: fixed;
  left: 16px;
  bottom: 24px;

  height: 56px;
  width: calc(100% - 32px);
`;

const STabletForm = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 20px;

  height: 102px;
  padding-left: 152px;
  padding-right: 152px;

  ${({ theme }) => theme.media.laptop} {
    height: 118px;

    padding-left: 0;
    padding-right: 104px;
  }
`;

const SCheckBox = styled(CheckBox)`
  position: relative;
  top: 12px;
`;
