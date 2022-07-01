import React from 'react';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';
import EllipseModal, { EllipseModalButton } from '../../atoms/EllipseModal';

interface IChatEllipseModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  userBlocked?: boolean;
  onUserBlock: () => void;
  onUserReport: () => void;
  isAnnouncement?: boolean;
}

const ChatEllipseModal: React.FunctionComponent<IChatEllipseModal> = ({
  isOpen,
  zIndex,
  onClose,
  userBlocked,
  onUserBlock,
  onUserReport,
  isAnnouncement,
}) => {
  const { t } = useTranslation('common');
  const user = useAppSelector((state) => state.user);

  const blockUserHandler = () => {
    onUserBlock();
    onClose();
  };

  const reportUserHandler = () => {
    onUserReport();
    onClose();
  };

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      {user.userData?.options?.isCreator && !isAnnouncement && (
        <EllipseModalButton onClick={() => {}}>
          {t('ellipse.view')}
        </EllipseModalButton>
      )}
      <EllipseModalButton tone='error' onClick={reportUserHandler}>
        {!isAnnouncement ? t('ellipse.reportUser') : t('ellipse.reportGroup')}
      </EllipseModalButton>
      <EllipseModalButton onClick={blockUserHandler}>
        {
          // eslint-disable-next-line no-nested-ternary
          isAnnouncement
            ? userBlocked
              ? t('ellipse.unblockGroup')
              : t('ellipse.blockGroup')
            : userBlocked
            ? t('ellipse.unblockUser')
            : t('ellipse.blockUser')
        }
      </EllipseModalButton>
    </EllipseModal>
  );
};

export default ChatEllipseModal;

ChatEllipseModal.defaultProps = {
  userBlocked: false,
  isAnnouncement: false,
};
