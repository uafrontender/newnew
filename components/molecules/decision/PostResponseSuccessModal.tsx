import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import Modal from '../../organisms/Modal';
import PostSuccessAnimationBackground from './PostSuccessAnimationBackground';

// import assets from '../../../constants/assets';

// header
// youMade
// makeNewPostButton
// subtitle

interface IPostResponseSuccessModal {
  isOpen: boolean;
  zIndex: number;
}

const PostResponseSuccessModal: React.FunctionComponent<IPostResponseSuccessModal> =
  ({ isOpen, zIndex }) => {
    const { t } = useTranslation('modal-ResponseSuccessModa');
    const { resizeMode } = useAppSelector((state) => state.ui);

    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    return (
      <Modal show={isOpen} additionalz={zIndex}>
        {!isMobile && <PostSuccessAnimationBackground noBlur />}
        <SWrapper>
          <SContentContainer>{t('')}</SContentContainer>
        </SWrapper>
      </Modal>
    );
  };

export default PostResponseSuccessModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: fit-content;
    margin: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
  }
`;
