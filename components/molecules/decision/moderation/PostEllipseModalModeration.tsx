import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';
import { TPostType } from '../../../../utils/switchPostType';
import { Mixpanel } from '../../../../utils/mixpanel';

interface IPostEllipseModalModeration {
  postUuid: string;
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
  postUuid,
  postType,
  isOpen,
  zIndex,
  canDeletePost,
  onClose,
  handleOpenDeletePostModal,
}) => {
  const { t } = useTranslation('common');

  const handleOpenDeletePostModalMixpanel = useCallback(() => {
    Mixpanel.track('Open Delete Post Modal', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostEllipseModalModeration',
    });
    handleOpenDeletePostModal();
    onClose();
  }, [handleOpenDeletePostModal, onClose, postUuid]);

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      <EllipseModalButton
        disabled={!canDeletePost}
        onClick={() => handleOpenDeletePostModalMixpanel()}
      >
        {t('ellipse.deleteDecision', {
          postType: t(`postType.${postType}`),
        })}
      </EllipseModalButton>
    </EllipseModal>
  );
};

export default PostEllipseModalModeration;
