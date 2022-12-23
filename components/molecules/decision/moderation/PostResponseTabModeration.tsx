/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import PostTitleContent from '../../../atoms/PostTitleContent';
import WinningOption from '../../../atoms/moderation/WinningOption';
import PostResponseTabModerationHeader from '../../../atoms/moderation/PostResponseModerationHeader';
import PostResponseSuccessModal from './PostResponseSuccessModal';

import { getMyEarningsByPosts } from '../../../../api/endpoints/payments';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';
import { TPostType } from '../../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
import { formatNumber } from '../../../../utils/format';
import copyToClipboard from '../../../../utils/copyToClipboard';
import PostEarnings from '../../../atoms/moderation/PostEarnings';

interface IPostResponseTabModeration {
  postUuid: string;
  postShortId: string;
  postType: TPostType;
  postStatus: TPostStatusStringified;
  postTitle: string;
  winningOptionAc?: newnewapi.Auction.Option;
  winningOptionMc?: newnewapi.MultipleChoice.Option;
  moneyBacked?: newnewapi.MoneyAmount;
  options?: newnewapi.MultipleChoice.Option[];
}

const PostResponseTabModeration: React.FunctionComponent<
  IPostResponseTabModeration
> = ({
  postUuid,
  postShortId,
  postType,
  postStatus,
  postTitle,
  winningOptionAc,
  winningOptionMc,
  moneyBacked,
  options,
}) => {
  const { t } = useTranslation('page-Post');

  const {
    coreResponseUploading,
    responseUploadSuccess,
    additionalResponseUploading,
    readyToUploadAdditionalResponse,
    responseFileUploadLoading,
    uploadedResponseVideoUrl,
    responseFileProcessingLoading,
    handleUploadVideoProcessed,
    handleUploadAdditionalVideoProcessed,
  } = usePostModerationResponsesContext();

  const responseReadyToBeUploaded = useMemo(
    () =>
      !!uploadedResponseVideoUrl &&
      !responseFileUploadLoading &&
      !responseFileProcessingLoading,
    [
      responseFileProcessingLoading,
      responseFileUploadLoading,
      uploadedResponseVideoUrl,
    ]
  );

  // Earned amount
  const [earnedAmount, setEarnedAmount] = useState<
    newnewapi.MoneyAmount | undefined
  >(undefined);
  const [earnedAmountLoading, setEarnedAmountLoading] = useState(false);
  const [isEarnedAmountFetched, setIsEarnedAmountFetched] = useState(false);

  const amountSwitch = useCallback(() => {
    if (earnedAmount && !earnedAmountLoading) {
      return formatNumber(earnedAmount.usdCents / 100 ?? 0, false);
    }

    if (!winningOptionAc && (!options || !options.length) && !moneyBacked) {
      return undefined;
    }

    if (postType === 'ac' && winningOptionAc?.totalAmount?.usdCents) {
      return formatNumber(
        winningOptionAc.totalAmount.usdCents / 100 ?? 0,
        true
      );
    }
    if (postType === 'mc' && options) {
      return formatNumber(
        options.reduce(
          (sum, option) => sum + (option.totalAmount?.usdCents || 0),
          0
        ) / 100 ?? 0,
        true
      );
    }

    if (postType === 'cf' && moneyBacked?.usdCents) {
      return formatNumber(moneyBacked.usdCents / 100 ?? 0, true);
    }

    return '0';
  }, [
    earnedAmount,
    earnedAmountLoading,
    moneyBacked,
    postType,
    winningOptionAc,
    options,
  ]);

  // Share
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  const handleCopyLink = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/p/${postShortId ?? postUuid}`;

      copyToClipboard(url)
        .then(() => {
          setIsCopiedUrl(true);
          setTimeout(() => {
            setIsCopiedUrl(false);
          }, 1500);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [postShortId, postUuid]);

  useEffect(() => {
    async function loadEarnedAmount() {
      setEarnedAmountLoading(true);
      try {
        const payload = new newnewapi.GetMyEarningsByPostsRequest({
          postUuids: [postUuid],
          ignoreTransactionStatus: true,
        });

        const res = await getMyEarningsByPosts(payload);

        if (!res.data || !res.data?.earningsByPosts[0]?.earnings || res.error)
          throw new Error('Request failed');

        setEarnedAmount(
          res.data.earningsByPosts[0].earnings as newnewapi.MoneyAmount
        );
      } catch (err) {
        console.error(err);
      } finally {
        setEarnedAmountLoading(false);
        setIsEarnedAmountFetched(true);
      }
    }

    if (postStatus === 'succeeded') {
      loadEarnedAmount();
    }
  }, [postUuid, postStatus]);

  if (postStatus === 'succeeded') {
    return (
      <>
        <SSucceededContainer
          dimmed={
            additionalResponseUploading ||
            responseFileProcessingLoading ||
            responseFileUploadLoading ||
            !!uploadedResponseVideoUrl
          }
        >
          <PostResponseTabModerationHeader
            title={t('postResponseTabModeration.succeeded.topHeader')}
            successVariant
          />
          <STextContentWrapper>
            <PostEarnings
              amount={amountSwitch()}
              label={t('postResponseTabModeration.succeeded.youMade')}
              isEarnedAmountFetched={isEarnedAmountFetched}
              loading={earnedAmountLoading || !isEarnedAmountFetched}
            />
            <WinningOption
              postType={postType}
              winningOptionAc={winningOptionAc}
              winningOptionMc={winningOptionMc}
            />
            <SText variant={2} weight={600}>
              <SSpan>
                {t('postResponseTabModeration.winner.inResponseToYourPost')}
              </SSpan>
            </SText>
            <SHeadline variant={5}>
              <PostTitleContent>{postTitle}</PostTitleContent>
            </SHeadline>
          </STextContentWrapper>
        </SSucceededContainer>
        {!additionalResponseUploading &&
        !readyToUploadAdditionalResponse &&
        !responseFileUploadLoading &&
        !responseFileProcessingLoading ? (
          <SShareButton onClick={handleCopyLink}>
            {isCopiedUrl
              ? t('postResponseTabModeration.succeeded.linkCopied')
              : t('postResponseTabModeration.succeeded.shareBtn')}
          </SShareButton>
        ) : readyToUploadAdditionalResponse ? (
          <SUploadButton
            className='uploadButton'
            disabled={!responseReadyToBeUploaded}
            loading={additionalResponseUploading}
            onClick={handleUploadAdditionalVideoProcessed}
          >
            {t('postResponseTabModeration.awaiting.postResponseBtn')}
          </SUploadButton>
        ) : (
          <div
            style={{
              height: '64px',
            }}
          />
        )}
        {/* Success modal */}
        {amountSwitch() && amountSwitch() !== '0' && (
          <PostResponseSuccessModal
            amount={`$${amountSwitch()!!}`}
            isOpen={responseUploadSuccess}
            zIndex={20}
          />
        )}
      </>
    );
  }

  return (
    <SContainer>
      <PostResponseTabModerationHeader
        title={t('postResponseTabModeration.awaiting.topHeader')}
      />

      <STextContentWrapper>
        <PostEarnings
          amount={amountSwitch()}
          label={t('postResponseTabModeration.awaiting.youWillGet')}
        />

        <WinningOption
          postType={postType}
          winningOptionAc={winningOptionAc}
          winningOptionMc={winningOptionMc}
        />
        <SText variant={2} weight={600}>
          <SSpan>
            {t('postResponseTabModeration.winner.inResponseToYourPost')}
          </SSpan>
        </SText>
        <SHeadline variant={5}>
          <PostTitleContent>{postTitle}</PostTitleContent>
        </SHeadline>
      </STextContentWrapper>
      <SUploadButton
        disabled={coreResponseUploading || !responseReadyToBeUploaded}
        onClick={handleUploadVideoProcessed}
      >
        {t('postResponseTabModeration.awaiting.postResponseBtn')}
      </SUploadButton>
      {/* Success modal */}
      {amountSwitch() && amountSwitch() !== '0' && (
        <PostResponseSuccessModal
          amount={`$${amountSwitch()!!}`}
          isOpen={responseUploadSuccess}
          zIndex={20}
        />
      )}
    </SContainer>
  );
};

export default PostResponseTabModeration;

const SContainer = styled.div`
  height: 100%;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    display: grid;
    flex: 1 1 auto;
  }
`;

const SSucceededContainer = styled.div<{
  dimmed?: boolean;
}>`
  height: 100%;
  width: 100%;

  opacity: ${({ dimmed }) => (dimmed ? 0.3 : 1)};

  ${({ theme }) => theme.media.tablet} {
    display: grid;
    flex: 1 1 auto;
  }
`;

const STextContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  margin-top: 32px;
`;

const SText = styled(Text)`
  margin-top: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpan = styled.span`
  display: inline-flex;
  white-space: pre;
`;

const SHeadline = styled(Headline)`
  white-space: pre-wrap;
  word-break: break-word;
`;

const SUploadButton = styled(Button)`
  position: fixed;
  bottom: 16px;

  width: calc(100% - 32px);
  height: 56px;

  z-index: 10;

  &:disabled {
    opacity: 1;
    &::after {
      z-index: -10;
      opacity: 0.4;
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      background: #ffffff;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    align-self: end;
    position: relative;
    width: 100%;

    bottom: 1px;

    z-index: initial;

    &:disabled {
      opacity: 0.5;
      &::after {
        display: none;
      }
    }
  }
`;

const SShareButton = styled(Button)`
  align-self: end;
  position: static;
  width: 100%;

  margin-top: 16px;

  background-color: ${({ theme }) =>
    theme.name === 'light' ? theme.colors.dark : '#FFFFFF'};
  color: ${({ theme }) =>
    theme.name === 'light' ? '#FFFFFF' : theme.colors.dark};

  &:focus:enabled,
  &:hover:enabled {
    background-color: ${({ theme }) =>
      theme.name === 'light' ? theme.colors.dark : '#FFFFFF'};
    color: ${({ theme }) =>
      theme.name === 'light' ? '#FFFFFF' : theme.colors.dark};

    filter: brightness(400%);
    -webkit-filter: brightness(400%);
  }
`;
