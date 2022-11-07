import React from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';

import Modal from './Modal';
import ModalPaper from './ModalPaper';
import Text from '../atoms/Text';

import Button from '../atoms/Button';

import assets from '../../constants/assets';

interface IPushNotificationsRequestModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PushNotificationsRequestModal: React.FC<
  IPushNotificationsRequestModal
> = ({ isOpen, onClose, onConfirm }) => {
  const theme = useTheme();

  return (
    <Modal show={isOpen} overlaydim onClose={onClose}>
      <SWrapper>
        <motion.div initial={MInitial} animate={MAnimation}>
          <SModalPaper onClose={onClose} isCloseButton>
            <SContent>
              <SLogo
                src={
                  theme.name === 'light'
                    ? assets.common.lightAnimatedLogo
                    : assets.common.darkAnimatedLogo
                }
                alt='NewNew logo'
              />
              <STitle variant={1} weight={700}>
                Turn on notifications
              </STitle>
              <SHint weight={600}>
                Turn on web notifications and get alerts about new posts on
                NewNew.
              </SHint>
              <Button view='primaryGrad' onClick={onConfirm}>
                Turn on
              </Button>
            </SContent>
          </SModalPaper>
        </motion.div>
      </SWrapper>
    </Modal>
  );
};

export default PushNotificationsRequestModal;

const MInitial = {
  opacity: 0,
  y: 1000,
};

const MAnimation = {
  opacity: 1,
  y: 0,
  transition: {
    opacity: {
      duration: 0.1,
      delay: 0.1,
    },
    y: {
      type: 'spring',
      stiffness: 50,
      delay: 0.2,
    },
    default: { duration: 2 },
  },
};

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0 16px;
`;

const SModalPaper = styled(ModalPaper)`
  ${({ theme }) => theme.media.tablet} {
    max-width: 573px;
    width: 573px;
  }
`;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 8px;

  ${({ theme }) => theme.media.tablet} {
    padding: 16px 0;
  }
`;

const STitle = styled(Text)`
  margin-bottom: 8px;

  font-size: 24px;
  line-height: 32px;
`;

const SHint = styled(Text)`
  margin-bottom: 32px;
  max-width: 340px;

  text-align: center;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SLogo = styled.img`
  object-fit: contain;
  height: 160px;
  width: 144px;
  margin-bottom: 24px;
`;