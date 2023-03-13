import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';
import { TPostType } from '../../../../utils/switchPostType';

interface IPostEllipseModal {
  postType: TPostType;
  isFollowingDecision: boolean;
  isOpen: boolean;
  zIndex: number;
  handleFollowDecision: () => void;
  handleReportOpen: () => void;
  onClose: () => void;
}

const PostEllipseModal: React.FunctionComponent<IPostEllipseModal> = ({
  postType,
  isFollowingDecision,
  isOpen,
  zIndex,
  handleFollowDecision,
  handleReportOpen,
  onClose,
}) => {
  const { t } = useTranslation('common');

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      <EllipseModalButton onClick={handleFollowDecision}>
        {!isFollowingDecision
          ? t('ellipse.followDecision', {
              postType: t(`postType.${postType}`),
            })
          : t('ellipse.unFollowDecision', {
              postType: t(`postType.${postType}`),
            })}
      </EllipseModalButton>
      <EllipseModalButton
        tone='error'
        onClick={() => {
          handleReportOpen();
          onClose();
        }}
      >
        {t('ellipse.report')}
      </EllipseModalButton>
    </EllipseModal>
  );
};

export default PostEllipseModal;
