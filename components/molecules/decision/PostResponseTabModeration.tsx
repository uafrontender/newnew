/* eslint-disable camelcase */
/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { TPostType } from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';

import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

import assets from '../../../constants/assets';

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
        <SHeaderDiv>
          <SHeaderHeadline variant={3}>
            {t('postResponseTabModeration.awaiting.topHeader')}
          </SHeaderHeadline>
          <SCoin_1 src={assets.decision.gold} alt='coin' draggable={false} />
          <SCoin_2 src={assets.decision.gold} alt='coin' draggable={false} />
          <SCoin_3 src={assets.decision.gold} alt='coin' draggable={false} />
          <SCoin_4 src={assets.decision.gold} alt='coin' draggable={false} />
          <SCoin_5 src={assets.decision.gold} alt='coin' draggable={false} />
        </SHeaderDiv>
        <SUploadButton
          disabled={responseUploading || !responseReadyToBeUploaded}
          onClick={handleUploadResponse}
        >
          {t('postResponseTabModeration.awaiting.postResponseBtn')}
        </SUploadButton>
      </SContainer>
    );
  };

export default PostResponseTabModeration;

const SContainer = styled.div``;

const SHeaderDiv = styled.div`
  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  padding-left: 32px;
  padding-top: 24px;
  padding-bottom: 24px;

  background: linear-gradient(
    74.02deg,
    #00c291 2.52%,
    #07df74 49.24%,
    #0ff34f 99.43%
  );
  border-radius: 16px 16px 0px 0px;

  width: 100%;
  min-height: 122px;

  margin-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    min-height: 128px;
    margin-top: 0px;
  }
`;

const SHeaderHeadline = styled(Headline)`
  color: #ffffff;
  white-space: pre;
`;

const SCoin_1 = styled.img`
  position: absolute;
  width: 56px;
  bottom: -32px;
  left: 5px;

  transform: rotate(180deg) scale(1, -1);

  object-fit: contain;
`;

const SCoin_2 = styled.img`
  position: absolute;
  width: 86px;
  top: -48px;
  left: 15%;

  object-fit: contain;
`;

const SCoin_3 = styled.img`
  position: absolute;
  width: 98px;
  top: 10%;
  right: 5%;
  transform: rotate(180deg) scale(1, -1);

  object-fit: contain;
`;

const SCoin_4 = styled.img`
  position: absolute;
  width: 20px;
  top: 10px;
  left: 10px;

  object-fit: contain;
`;

const SCoin_5 = styled.img`
  position: absolute;
  width: 20px;
  top: 10px;
  left: 10px;

  object-fit: contain;
`;

const SUploadButton = styled(Button)`
  position: fixed;
  bottom: 16px;

  width: calc(100% - 32px);
  height: 56px;

  z-index: 10;

  ${({ theme }) => theme.media.tablet} {
    position: static;
    width: 100%;
  }
`;
