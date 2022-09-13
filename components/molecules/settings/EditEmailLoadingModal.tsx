import React from 'react';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import InlineSvg from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import AnimatedPresence from '../../atoms/AnimatedPresence';
import Lottie from '../../atoms/Lottie';

import logoAnimation from '../../../public/animations/mobile_logo.json';
import Logo from '../../../public/images/svg/mobile-logo.svg';

interface IConfirmEmailModal {
  show: boolean;
  onClose: () => void;
  currentEmail?: string;
  errorMessage?: string;
  text: string;
  isLoading: boolean;
}

const EditEmailLoadingModal: React.FunctionComponent<IConfirmEmailModal> = ({
  show,
  onClose,
  errorMessage,
  text,
  isLoading,
}) => {
  const theme = useTheme();

  return (
    <Modal show={show} overlaydim transitionspeed={0} onClose={onClose}>
      {show && (
        <SModalPaper isCloseButton isMobileFullScreen onClose={onClose}>
          <SModalContent>
            <SLogo
              svg={Logo}
              fill={theme.colorsThemed.accent.blue}
              width='60px'
              height='40px'
            />
            <Headline variant={4}>{text}</Headline>
            {isLoading && (
              <SLoader>
                <Lottie
                  width={50}
                  height={50}
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: logoAnimation,
                  }}
                />
              </SLoader>
            )}
            {errorMessage && (
              <AnimatedPresence animateWhenInView={false} animation='t-09'>
                <SErrorDiv variant={2}>{errorMessage}</SErrorDiv>
              </AnimatedPresence>
            )}
          </SModalContent>
        </SModalPaper>
      )}
    </Modal>
  );
};

export default EditEmailLoadingModal;

const SModalPaper = styled(ModalPaper)`
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

const SModalContent = styled.div`
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
`;

const SLogo = styled(InlineSvg)`
  margin-bottom: 35px;
`;

const SErrorDiv = styled(Text)`
  font-weight: bold;
  margin-top: 50px;

  // NB! Temp
  color: ${({ theme }) => theme.colorsThemed.accent.error};

  ${({ theme }) => theme.media.tablet} {
    line-height: 20px;
  }
`;

const SLoader = styled.div`
  margin-top: 40px;
`;
