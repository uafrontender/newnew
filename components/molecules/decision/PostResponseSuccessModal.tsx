import React from 'react';
import { useTranslation } from 'next-i18next';

import Modal from '../../organisms/Modal';

interface IPostResponseSuccessModal {
  isOpen: boolean;
  zIndex: number;
}

const PostResponseSuccessModal: React.FunctionComponent<IPostResponseSuccessModal> =
  ({ isOpen, zIndex }) => {
    const { t } = useTranslation('modal-ResponseSuccessModa');

    return (
      <Modal show={isOpen} additionalz={zIndex}>
        {t('')}
      </Modal>
    );
  };

export default PostResponseSuccessModal;
