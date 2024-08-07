import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import LoadingModal from '../LoadingModal';
import GoBackButton from '../GoBackButton';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import OnboardingBioTextarea from './OnboardingBioTextarea';
import { updateMe } from '../../../api/endpoints/user';
import { validateText } from '../../../api/endpoints/infrastructure';
import validateInputText from '../../../utils/validateMessageText';
import { I18nNamespaces } from '../../../@types/i18next';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';
import { useUserData } from '../../../contexts/userDataContext';

const errorSwitch = (status: newnewapi.ValidateTextResponse.Status) => {
  switch (status) {
    case newnewapi.ValidateTextResponse.Status.TOO_LONG:
      return 'tooLong';
    case newnewapi.ValidateTextResponse.Status.TOO_SHORT:
      return 'tooShort';
    case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE:
      return 'inappropriate';
    case newnewapi.ValidateTextResponse.Status.ATTEMPT_AT_REDIRECTION:
      return 'linksForbidden';
    default:
      return 'generic';
  }
};

interface IOnboardingSectionAbout {}

const OnboardingSectionAbout: React.FunctionComponent<
  IOnboardingSectionAbout
> = () => {
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { t } = useTranslation('page-CreatorOnboarding');
  const { userData, creatorData, updateUserData } = useUserData();
  const { resizeMode, logoutAndRedirect } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Bio
  const [bioInEdit, setBioInEdit] = useState(userData?.bio ?? '');
  const [bioError, setBioError] = useState('');
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);

  const validateTextAbortControllerRef = useRef<AbortController | undefined>();
  const validateBioViaApi = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (validateTextAbortControllerRef.current) {
        validateTextAbortControllerRef.current?.abort();
      }
      validateTextAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        const text = e.target.value;

        if (text.length === 0) {
          return;
        }

        const payload = new newnewapi.ValidateTextRequest({
          kind: newnewapi.ValidateTextRequest.Kind.CREATOR_BIO,
          text,
        });

        const res = await validateText(
          payload,
          validateTextAbortControllerRef?.current?.signal
        );

        if (!res.data?.status) {
          throw new Error('An error occurred');
        }

        if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
          setBioError(errorSwitch(res.data?.status));
        } else {
          setBioError('');
        }

        setIsAPIValidateLoading(false);
      } catch (err) {
        console.error(err);
        setIsAPIValidateLoading(false);
        if ((err as Error).message === 'No token') {
          logoutAndRedirect();
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          logoutAndRedirect('/sign-up?reason=session_expired');
        }
      }
    },
    [setBioError, logoutAndRedirect]
  );

  const handleUpdateBioInEdit = (value: string) => {
    setBioInEdit(value);
  };

  // Is form valid
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = useCallback(async () => {
    try {
      Mixpanel.track('Submit Bio', {
        _stage: 'Onboarding',
        _button: 'Save Changes',
        _component: 'OnboardingSectionAbout',
      });

      setLoadingModalOpen(true);

      // Validate text
      const payload = new newnewapi.ValidateTextRequest({
        kind: newnewapi.ValidateTextRequest.Kind.CREATOR_BIO,
        text: bioInEdit,
      });

      const res = await validateText(
        payload,
        validateTextAbortControllerRef?.current?.signal
      );

      if (!res.data?.status) {
        throw new Error('An error occurred');
      }

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setBioError(errorSwitch(res.data?.status));
        setLoadingModalOpen(false);
        return;
      }

      const updateBioPayload = new newnewapi.UpdateMeRequest({
        bio: bioInEdit.trim(),
      });

      const updateMeRes = await updateMe(updateBioPayload);

      if (!updateMeRes?.data || updateMeRes.error) {
        throw new Error(updateMeRes?.error?.message ?? 'Request failed');
      }

      updateUserData({
        bio: updateMeRes.data.me?.bio,
      });

      // redirect user to dashboard if Stripe is already connected
      if (
        creatorData?.stripeConnectStatus ===
        newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
          .CONNECTED_ALL_GOOD
      ) {
        router.replace('/creator/dashboard');
      } else {
        router.replace('/creator-onboarding-stripe');
      }

      setLoadingModalOpen(false);
    } catch (err) {
      console.log(err);
      setLoadingModalOpen(false);
      if ((err as Error).message === 'No token') {
        logoutAndRedirect();
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        logoutAndRedirect('/sign-up?reason=session_expired');
      }
    }
  }, [
    bioInEdit,
    router,
    creatorData?.stripeConnectStatus,
    logoutAndRedirect,
    updateUserData,
  ]);

  useEffect(() => {
    if (validateInputText(bioInEdit) && bioError === '') {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [bioError, bioInEdit]);

  return (
    <>
      <SContainer>
        {isMobile && (
          <SGoBackButton
            onClick={() => goBackOrRedirect('/creator/dashboard')}
          />
        )}
        <SHeading variant={5}>{t('aboutSection.heading')}</SHeading>
        <STopContainer>
          <SFormItemContainer>
            <OnboardingBioTextarea
              value={bioInEdit}
              isValid={bioError === ''}
              errorCaption={t(
                `aboutSection.bio.errors.${
                  bioError as keyof I18nNamespaces['page-CreatorOnboarding']['aboutSection']['bio']['errors']
                }`
              )}
              placeholder={t('aboutSection.bio.placeholder')}
              maxChars={150}
              onChange={(e) => handleUpdateBioInEdit(e.target.value)}
              onBlur={validateBioViaApi}
              onFocus={() => setBioError('')}
            />
          </SFormItemContainer>
        </STopContainer>
        <SControlsDiv>
          {!isMobile && (
            <GoBackButton
              noArrow
              onClick={() => {
                Mixpanel.track('Navigation Item Clicked', {
                  _stage: 'Onboarding',
                  _button: 'Back button',
                  _component: 'OnboardingSectionAbout',
                });
                goBackOrRedirect('/creator/dashboard');
              }}
            >
              {t('aboutSection.button.back')}
            </GoBackButton>
          )}
          <Button
            id='submit'
            view='primaryGrad'
            disabled={!isFormValid}
            style={{
              width: isMobile ? '100%' : 'initial',
              ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
            }}
            onClick={() => handleSubmit()}
          >
            {t('aboutSection.button.submit')}
          </Button>
        </SControlsDiv>
      </SContainer>
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
    </>
  );
};

export default OnboardingSectionAbout;

const SContainer = styled.div`
  padding: 0 20px 20px;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.media.tablet} {
    padding: 114px 152px 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: fit-content;
    padding-left: 0;
    padding-right: 104px;
    padding-top: 44px;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 16px;
  padding-bottom: 22px;
  margin-left: -4px;
`;

const SHeading = styled(Headline)`
  padding-right: 32px;
  margin-bottom: 24px;
  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 40px;
  }
`;

const STopContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    background-color: initial;
    padding: initial;
    border-radius: initial;
    margin-bottom: initial;
  }
`;

const SFormItemContainer = styled.div`
  width: 100%;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    /* width: 284px; */
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    /* width: 296px; */
  }
`;

const SControlsDiv = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;
    margin-left: initial;
    width: 100%;
    padding: 0;
    button {
      width: 170px;
      height: 48px;
    }
  }
`;
