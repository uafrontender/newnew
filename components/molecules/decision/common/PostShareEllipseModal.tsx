import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Headline from '../../../atoms/Headline';
import EllipseModal from '../../../atoms/EllipseModal';

import SharePanel from '../../../atoms/SharePanel';

interface IPostShareEllipseModal {
  isOpen: boolean;
  zIndex: number;
  postUuid: string;
  postShortId: string;
  onClose: () => void;
}

const PostShareEllipseModal: React.FunctionComponent<IPostShareEllipseModal> =
  React.memo(({ isOpen, zIndex, postUuid, postShortId, onClose }) => {
    const { t } = useTranslation('common');

    return (
      <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
        <ButtonsSection>
          <Headline variant={6}>{t('shareTo')}</Headline>
          <SSharePanel
            linkToShare={`${window.location.origin}/p/${
              postShortId || postUuid
            }`}
            onCopyLink={onClose}
          />
        </ButtonsSection>
      </EllipseModal>
    );
  });

export default PostShareEllipseModal;

const ButtonsSection = styled.div`
  padding: 16px;
`;

const SSharePanel = styled(SharePanel)`
  padding: 16px;
`;
