/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
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
import { Mixpanel } from '../../../../utils/mixpanel';
import EditPostTitleModal from './EditPostTitleModal';
import InlineSvg from '../../../atoms/InlineSVG';
import EditIconFilled from '../../../../public/images/svg/icons/filled/EditTransparent.svg';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../atoms/decision/TutorialTooltip';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';

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
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [isTutorialVisible, setIsTutorialVisible] = useState(true);

  const goToNextStep = useCallback(async () => {
    if (postType === 'ac') {
      if (
        user.userTutorialsProgress.remainingAcResponseCurrentStep &&
        user.userTutorialsProgress.remainingAcResponseCurrentStep[0]
      ) {
        if (user.loggedIn) {
          const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            acResponseCurrentStep:
              user.userTutorialsProgress.remainingAcResponseCurrentStep[0],
          });
          await markTutorialStepAsCompleted(payload);
        }
        dispatch(
          setUserTutorialsProgress({
            remainingAcResponseCurrentStep: [
              ...user.userTutorialsProgress.remainingAcResponseCurrentStep,
            ].slice(1),
          })
        );
      }
    } else if (postType === 'mc') {
      if (
        user.userTutorialsProgress.remainingMcResponseCurrentStep &&
        user.userTutorialsProgress.remainingMcResponseCurrentStep[0]
      ) {
        if (user.loggedIn) {
          const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            mcResponseCurrentStep:
              user.userTutorialsProgress.remainingMcResponseCurrentStep[0],
          });
          await markTutorialStepAsCompleted(payload);
        }
        dispatch(
          setUserTutorialsProgress({
            remainingMcResponseCurrentStep: [
              ...user.userTutorialsProgress.remainingMcResponseCurrentStep,
            ].slice(1),
          })
        );
      }
    }
  }, [
    dispatch,
    postType,
    user.loggedIn,
    user.userTutorialsProgress.remainingAcResponseCurrentStep,
    user.userTutorialsProgress.remainingMcResponseCurrentStep,
  ]);

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

  // Edit title
  const [isEditTitleMenuOpen, setIsEditTitleMenuOpen] = useState(false);

  const handleOpenEditTitleMenuMixpanel = useCallback(() => {
    Mixpanel.track('Open Edit Title Menu', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostResponseTabModeration',
    });
    setIsEditTitleMenuOpen(true);
  }, [setIsEditTitleMenuOpen, postUuid]);

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
    Mixpanel.track('Click copy link', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostResponseTabModeration',
    });

    if (window) {
      const url = `${window.location.origin}/p/${postShortId || postUuid}`;

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

  const handleUploadVideoProcessedMixpanel = useCallback(() => {
    Mixpanel.track('Click upload response response', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostResponseTabModeration',
    });
    handleUploadVideoProcessed();
  }, [handleUploadVideoProcessed, postUuid]);

  const handleUploadAdditionalVideoProcessedMixpanel = useCallback(() => {
    Mixpanel.track('Click upload additional response', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostResponseTabModeration',
    });
    handleUploadAdditionalVideoProcessed();
  }, [handleUploadAdditionalVideoProcessed, postUuid]);

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

  useEffect(() => {
    if (user.userTutorialsProgressSynced) {
      switch (postType) {
        case 'mc': {
          if (
            user.userTutorialsProgress.remainingMcResponseCurrentStep &&
            user.userTutorialsProgress.remainingMcResponseCurrentStep[0] ===
              newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE
          ) {
            setIsTutorialVisible(true);
          }

          break;
        }
        default: {
          if (
            user.userTutorialsProgress.remainingAcResponseCurrentStep &&
            user.userTutorialsProgress.remainingAcResponseCurrentStep[0] ===
              newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE
          ) {
            setIsTutorialVisible(true);
          }

          break;
        }
      }
    } else {
      setIsTutorialVisible(false);
    }
  }, [
    postType,
    user.userTutorialsProgress.remainingAcResponseCurrentStep,
    user.userTutorialsProgress.remainingMcCrCurrentStep,
    user.userTutorialsProgress.remainingMcResponseCurrentStep,
    user.userTutorialsProgressSynced,
  ]);

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
            <STextTitle variant={2} weight={600}>
              <SSpan>
                {t('postResponseTabModeration.winner.inResponseToYourPost')}
              </SSpan>
              <SEditTitleButton
                view='transparent'
                iconOnly
                withDim
                withShrink
                style={{
                  padding: '8px',
                }}
                onClick={() => handleOpenEditTitleMenuMixpanel()}
              >
                <InlineSvg
                  svg={EditIconFilled}
                  fill={theme.colorsThemed.text.secondary}
                  width='20px'
                  height='20px'
                />
              </SEditTitleButton>
            </STextTitle>
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
            id='upload-button'
            className='uploadButton'
            disabled={!responseReadyToBeUploaded}
            loading={additionalResponseUploading}
            onClick={handleUploadAdditionalVideoProcessedMixpanel}
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
        {/* Edit Post title */}
        {isEditTitleMenuOpen ? (
          <EditPostTitleModal
            modalType='initial'
            show={isEditTitleMenuOpen}
            closeModal={() => setIsEditTitleMenuOpen(false)}
          />
        ) : null}
      </>
    );
  }

  return (
    <SContainer dimmed={isTutorialVisible}>
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
        <STextTitle variant={2} weight={600} undimmed={isTutorialVisible}>
          <SSpan>
            {t('postResponseTabModeration.winner.inResponseToYourPost')}
          </SSpan>
          <SEditTitleButton
            view='transparent'
            iconOnly
            withDim
            withShrink
            style={{
              padding: '8px',
            }}
            onClick={() => handleOpenEditTitleMenuMixpanel()}
          >
            <InlineSvg
              svg={EditIconFilled}
              fill={
                !isTutorialVisible
                  ? theme.colorsThemed.text.secondary
                  : theme.colorsThemed.text.primary
              }
              width='20px'
              height='20px'
            />
          </SEditTitleButton>
          {isTutorialVisible ? (
            <STutorialTooltipHolder>
              <TutorialTooltip
                isTooltipVisible={isTutorialVisible}
                closeTooltip={goToNextStep}
                title={t('postResponseTabModeration.tutorialEditTitle.title')}
                text={t('postResponseTabModeration.tutorialEditTitle.body')}
                dotPosition={DotPositionEnum.TopRight}
              />
            </STutorialTooltipHolder>
          ) : null}
        </STextTitle>
        <SHeadline variant={5} undimmed={isTutorialVisible}>
          <PostTitleContent>{postTitle}</PostTitleContent>
        </SHeadline>
      </STextContentWrapper>
      <SUploadButton
        id='upload-button'
        disabled={coreResponseUploading || !responseReadyToBeUploaded}
        onClick={handleUploadVideoProcessedMixpanel}
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
      {/* Edit Post title */}
      {isEditTitleMenuOpen ? (
        <EditPostTitleModal
          modalType='initial'
          show={isEditTitleMenuOpen}
          closeModal={() => setIsEditTitleMenuOpen(false)}
        />
      ) : null}
    </SContainer>
  );
};

export default PostResponseTabModeration;

const SContainer = styled.div<{
  dimmed: boolean;
}>`
  height: 100%;
  width: 100%;

  &::before {
    content: '';
    width: 100%;
    height: 100vh;
    position: absolute;
    z-index: 10;

    box-shadow: ${({ theme, dimmed }) =>
      dimmed ? `inset 0px 200px 263px 50px rgba(0, 0, 0, 0.75);` : 'unset'};
  }

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

const STextTitle = styled(Text)<{
  undimmed?: boolean;
}>`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ undimmed }) =>
    undimmed
      ? css`
          z-index: 11;
        `
      : null}

  ${({ theme }) => theme.media.tablet} {
    justify-content: space-between;
  }
`;

const SSpan = styled.span`
  display: inline-flex;
  white-space: pre;
`;

const SHeadline = styled(Headline)<{
  undimmed?: boolean;
}>`
  white-space: pre-wrap;
  word-break: break-word;

  ${({ theme }) => theme.media.laptop} {
    ${({ undimmed }) =>
      undimmed
        ? css`
            z-index: 11;
          `
        : null}
  }
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
  }
`;

const SEditTitleButton = styled(Button)`
  background: none;
  padding: 0px;
  &:focus:enabled {
    background: ${({ theme, view }) =>
      view ? theme.colorsThemed.button.background[view] : ''};
  }
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 0;
  top: 42px;
  text-align: left;

  ${({ theme }) => theme.media.laptop} {
    left: initial;
    right: 36px;
    top: 36px;
  }
`;
