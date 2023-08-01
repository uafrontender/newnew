import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import isEmail from 'validator/lib/isEmail';

import AnimatedPresence from '../../atoms/AnimatedPresence';
import InlineSvg from '../../atoms/InlineSVG';
import SignInTextInput from '../../atoms/SignInTextInput';
import EmailSignInButton from './EmailSignInButton';
import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import { Mixpanel } from '../../../utils/mixpanel';
import { useSignup } from '../../../contexts/signUpContext';
import Lottie from '../../atoms/Lottie';
import logoAnimationWhite from '../../../public/animations/mobile_logo_white.json';

export interface IEmailSignInForm {
  animationVariants: Variants;
  onSubmit: (email: string) => void;
}

const EmailSignInForm: React.FunctionComponent<IEmailSignInForm> = ({
  animationVariants,
  onSubmit,
}) => {
  const { t } = useTranslation('page-SignUp');

  const { signupEmailInput } = useSignup();

  // Email input
  const [emailInput, setEmailInput] = useState(signupEmailInput ?? '');
  const [emailInputValid, setEmailInputValid] = useState(false);

  // Loading of email submission
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // NB! We won't have 'already exists' errors, but will probably
  // need some case for banned users, etc.
  const [submitError, setSubmitError] = useState('');

  const handleSubmitEmail = async () => {
    setIsSubmitLoading(true);
    setSubmitError('');
    try {
      await onSubmit(emailInput);
    } catch (err: any) {
      setIsSubmitLoading(false);
      // TODO: Process error. Don't show the one from BE.
      // TODO: If email with this account was deleted, show modal
      setSubmitError(err?.message ?? 'genericError');
    }
  };

  // Check if email is valid
  useEffect(() => {
    if (emailInput.length > 0) {
      setEmailInputValid(isEmail(emailInput));
    }
  }, [emailInput, setEmailInputValid]);

  return (
    <SEmailSignInForm
      id='authenticate-form'
      isLoading={isSubmitLoading}
      onSubmit={(e) => {
        e.preventDefault();
        if (!emailInputValid || isSubmitLoading || emailInput.length === 0) {
          return;
        }
        handleSubmitEmail();
      }}
    >
      <motion.div variants={animationVariants}>
        <SignInTextInput
          id='authenticate-input'
          name='email'
          type='email'
          autoComplete='true'
          value={emailInput}
          isValid={emailInputValid}
          disabled={isSubmitLoading}
          onFocus={() => {
            if (submitError) {
              setSubmitError('');
            }
          }}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder={t('signUpOptions.email')}
          errorCaption={t('error.emailInvalid')}
        />
      </motion.div>
      {submitError ? (
        <AnimatedPresence animateWhenInView={false} animation='t-09'>
          <SErrorDiv>
            <>
              <InlineSvg svg={AlertIcon} width='16px' height='16px' />
              {submitError}
            </>
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
      <motion.div variants={animationVariants}>
        <EmailSignInButton
          type='submit'
          disabled={
            !emailInputValid || isSubmitLoading || emailInput.length === 0
          }
          onClick={() => {
            Mixpanel.track('Sign In With Email Clicked', {
              _stage: 'Sign Up',
              _email: emailInput,
            });
          }}
        >
          <EmailSignInButtonContent>
            {t('signUpOptions.signInButton')}
            {/* Lottie must have a ky to force a re-render */}
            <Lottie
              key={`logo-${isSubmitLoading ? 'animated' : 'static'}`}
              width={24}
              height={24}
              options={{
                loop: isSubmitLoading,
                autoplay: isSubmitLoading,
                animationData: logoAnimationWhite,
              }}
            />
          </EmailSignInButtonContent>
        </EmailSignInButton>
      </motion.div>
    </SEmailSignInForm>
  );
};

export default EmailSignInForm;

const EmailSignInButtonContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const SEmailSignInForm = styled.form<{ isLoading?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'default')};
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;
