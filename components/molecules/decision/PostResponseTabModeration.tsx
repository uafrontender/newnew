import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { TPostType } from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import Button from '../../atoms/Button';

interface IPostResponseTabModeration {
  postType: TPostType;
  postStatus: TPostStatusStringified;
  postTitle: string;
  responseUploading: boolean;
  responseReadyToBeUploaded: boolean;
  winningOptionAc?: newnewapi.Auction.Option;
  winningOptionMc?: newnewapi.MultipleChoice.Option;
  handleUploadResponse: () => void;
}

const PostResponseTabModeration: React.FunctionComponent<IPostResponseTabModeration> =
  ({
    postType,
    postStatus,
    postTitle,
    responseUploading,
    responseReadyToBeUploaded,
    winningOptionAc,
    winningOptionMc,
    handleUploadResponse,
  }) => {
    const { t } = useTranslation('modal-Post');

    if (postStatus === 'succeeded') {
      <SContainer>success</SContainer>;
    }
    return (
      <SContainer>
        {t('hey')}
        <SUploadButton
          disabled={responseUploading || !responseReadyToBeUploaded}
          onClick={handleUploadResponse}
        >
          Post respones
        </SUploadButton>
      </SContainer>
    );
  };

export default PostResponseTabModeration;

const SContainer = styled.div``;

const SUploadButton = styled(Button)``;
