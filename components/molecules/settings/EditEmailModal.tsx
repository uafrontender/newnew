import React, { useState, useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import EditEmailStepOne from './EditEmailStepOne';
import EditEmailStepTwo from './EditEmailStepTwo';
import EditEmailStepThree from './EditEmailStepThree';
import EditEmailSuccess from './EditEmailSuccess';

import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

interface IEditEmailModal {
  show: boolean;
  skipCurrentEmailVerificationStep: boolean;
  onClose: () => void;
}

// eslint-disable-next-line no-shadow
enum Steps {
  verifyEmail = 0,
  newEmail = 1,
  verifyNewEmail = 2,
  success = 3,
}

const EditEmailModal = ({
  show,
  skipCurrentEmailVerificationStep,
  onClose,
}: IEditEmailModal) => {
  const { resizeMode } = useAppState();

  const [newEmail, setNewEmail] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);

  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const [step, setStep] = useState<number | null>(
    skipCurrentEmailVerificationStep ? Steps.newEmail : Steps.verifyEmail
  );

  useEffect(() => {
    if (show && !step) {
      setStep(
        skipCurrentEmailVerificationStep ? Steps.newEmail : Steps.verifyEmail
      );
    }
  }, [show, step, skipCurrentEmailVerificationStep]);

  useEffect(() => {
    if (!show) {
      setStep(null);
    }
  }, [show]);

  const handleClose = useCallback(() => {
    Mixpanel.track('Close Edit Email Modal', {
      _stage: 'Settings',
    });
    onClose();
  }, [onClose]);

  const completeStepOne = useCallback(() => {
    setStep(1);
  }, []);

  const completeStepTwo = useCallback(
    (email: string, newRetryAfter: number) => {
      setNewEmail(email);
      setRetryAfter(newRetryAfter);
      setStep(2);
    },
    []
  );

  const completeStepThree = useCallback(() => {
    setStep(3);
  }, []);

  if (step === null) {
    return null;
  }

  return (
    <Modal
      show={show}
      transitionspeed={isMobileOrTablet ? 0.15 : 0}
      onClose={handleClose}
    >
      {show && (
        <SModalPaper isCloseButton onClose={onClose} isMobileFullScreen>
          {(step === Steps.verifyEmail || step === Steps.newEmail) &&
            !skipCurrentEmailVerificationStep && (
              <AnimationContent
                initial={step === Steps.newEmail ? MInitialDisappear : false}
                animate={step === Steps.newEmail ? MAnimationDisappear : false}
              >
                <AnimatePresence>
                  <SContent>
                    <EditEmailStepOne onComplete={completeStepOne} />
                  </SContent>
                </AnimatePresence>
              </AnimationContent>
            )}

          {(step === Steps.newEmail || step === Steps.verifyNewEmail) && (
            <AnimationContent
              initial={
                // eslint-disable-next-line no-nested-ternary
                step === Steps.newEmail
                  ? skipCurrentEmailVerificationStep
                    ? false
                    : MInitialAppear
                  : MInitialDisappear
              }
              animate={
                step === Steps.newEmail ? MAnimationAppear : MAnimationDisappear
              }
            >
              <AnimatePresence>
                <SContent>
                  <EditEmailStepTwo onComplete={completeStepTwo} />
                </SContent>
              </AnimatePresence>
            </AnimationContent>
          )}

          {(step === Steps.verifyNewEmail || step === Steps.success) && (
            <AnimationContent
              initial={
                step === Steps.verifyNewEmail
                  ? MInitialAppear
                  : MInitialDisappear
              }
              animate={
                step === Steps.verifyNewEmail
                  ? MAnimationAppear
                  : MAnimationDisappear
              }
            >
              <AnimatePresence>
                <SContent>
                  <EditEmailStepThree
                    onComplete={completeStepThree}
                    newEmail={newEmail}
                    retryAfter={retryAfter}
                  />
                </SContent>
              </AnimatePresence>
            </AnimationContent>
          )}

          {step === Steps.success && (
            <AnimationContent
              initial={MInitialAppear}
              animate={MAnimationAppear}
              $centered
            >
              <AnimatePresence>
                <SContent>
                  <EditEmailSuccess onComplete={handleClose} />
                </SContent>
              </AnimatePresence>
            </AnimationContent>
          )}
        </SModalPaper>
      )}
    </Modal>
  );
};

export default EditEmailModal;

const MInitialAppear = {
  x: 600,
  y: 0,
  opacity: 0,
};

const MAnimationAppear = {
  x: 0,
  y: 0,
  opacity: 1,
  transition: {
    duration: 1,
  },
};

const MInitialDisappear = {
  x: 0,
  y: 0,
  opacity: 1,
};

const MAnimationDisappear = {
  x: -600,
  y: 0,
  opacity: 0,
  transition: {
    duration: 1,
  },
};

const SModalPaper = styled(ModalPaper)`
  overflow: hidden;
  height: 100%;

  ${({ theme }) => theme.media.tablet} {
    max-height: 400px;
    max-width: 417px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 609px;
    max-height: 470px;
  }
`;

interface IAnimationContent {
  $centered?: boolean;
}

const AnimationContent = styled(motion.div)<IAnimationContent>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  margin-top: min(12vh, 92px);

  ${({ theme }) => theme.media.tablet} {
    margin-top: 56px;
  }

  ${({ $centered }) =>
    $centered
      ? css`
          ${({ theme }) => theme.media.tablet} {
            justify-content: center;
            margin-top: 0;
          }
        `
      : ''}
`;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 35px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 401px;
    padding: 0;
  }
`;
