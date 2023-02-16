import React from 'react';
import styled from 'styled-components';

import Modal from '../organisms/Modal';
import Lottie from '../atoms/Lottie';

import loadingAnimation from '../../public/animations/logo-loading-blue.json';

interface ILoadingModal {
  isOpen: boolean;
  zIndex: number;
}

const LoadingModal: React.FunctionComponent<ILoadingModal> = ({
  isOpen,
  zIndex,
}) => (
  <Modal show={isOpen} additionalz={zIndex} onClose={() => {}}>
    <SAnimationContainer
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Lottie
        width={64}
        height={64}
        options={{
          loop: true,
          autoplay: true,
          animationData: loadingAnimation,
        }}
      />
    </SAnimationContainer>
  </Modal>
);

export default LoadingModal;

const SAnimationContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
