import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';
import { TPostType } from '../../../../utils/switchPostType';

interface IPostEllipseModalModeration {
  postType: TPostType;
  isOpen: boolean;
  canDeletePost: boolean;
  zIndex: number;
  onClose: () => void;
  handleOpenDeletePostModal: () => void;
}

const PostEllipseModalModeration: React.FunctionComponent<
  IPostEllipseModalModeration
> = ({
  postType,
  isOpen,
  zIndex,
  canDeletePost,
  onClose,
  handleOpenDeletePostModal,
}) => {
  const { t } = useTranslation('common');

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      <EllipseModalButton
        disabled={!canDeletePost}
        onClick={() => {
          handleOpenDeletePostModal();
          onClose();
        }}
      >
        {t('ellipse.deleteDecision', {
          postType: t(`postType.${postType}`),
        })}
      </EllipseModalButton>
    </EllipseModal>
  );
};

export default PostEllipseModalModeration;
