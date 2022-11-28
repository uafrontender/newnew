/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-pascal-case */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';

import { TPostType } from '../../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';

import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import assets from '../../../../constants/assets';
import Text from '../../../atoms/Text';
import { formatNumber } from '../../../../utils/format';
import { getMyEarningsByPosts } from '../../../../api/endpoints/payments';
import getDisplayname from '../../../../utils/getDisplayname';
import { useAppSelector } from '../../../../redux-store/store';
import { useGetAppConstants } from '../../../../contexts/appConstantsContext';
import PostResponseSuccessModal from './PostResponseSuccessModal';
import PostTitleContent from '../../../atoms/PostTitleContent';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import InlineSvg from '../../../atoms/InlineSVG';

interface IPostResponseTabModeration {
  postId: string;
  postType: TPostType;
  postStatus: TPostStatusStringified;
  postTitle: string;
  winningOptionAc?: newnewapi.Auction.Option;
  winningOptionMc?: newnewapi.MultipleChoice.Option;
  moneyBacked?: newnewapi.MoneyAmount;
}

const PostResponseTabModeration: React.FunctionComponent<
  IPostResponseTabModeration
> = ({
  postId,
  postType,
  postStatus,
  postTitle,
  winningOptionAc,
  winningOptionMc,
  moneyBacked,
}) => {
  const { t } = useTranslation('page-Post');
  const user = useAppSelector((state) => state.user);
  const { appConstants } = useGetAppConstants();

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

  const amountSwitch = useCallback(() => {
    if (earnedAmount && !earnedAmountLoading) {
      return `$${formatNumber(earnedAmount.usdCents / 100 ?? 0, false)}`;
    }

    if (postType === 'ac' && winningOptionAc?.totalAmount?.usdCents) {
      return `$${formatNumber(
        winningOptionAc.totalAmount.usdCents / 100 ?? 0,
        true
      )}`;
    }
    if (postType === 'mc' && winningOptionMc?.voteCount) {
      return `$${formatNumber(
        winningOptionMc.voteCount * Math.round(appConstants.mcVotePrice / 100),
        true
      )}`;
    }

    if (postType === 'cf' && moneyBacked?.usdCents) {
      return `$${formatNumber(moneyBacked.usdCents / 100 ?? 0, true)}`;
    }

    return '';
  }, [
    appConstants.mcVotePrice,
    earnedAmount,
    earnedAmountLoading,
    moneyBacked,
    postType,
    winningOptionAc?.totalAmount?.usdCents,
    winningOptionMc?.voteCount,
  ]);

  // Share
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handleCopyLink = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/post/${postId}`;

      copyPostUrlToClipboard(url)
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
  }, [postId]);

  useEffect(() => {
    async function loadEarnedAmount() {
      setEarnedAmountLoading(true);
      try {
        const payload = new newnewapi.GetMyEarningsByPostsRequest({
          postUuids: [postId],
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
      }
    }

    if (postStatus === 'succeeded') {
      loadEarnedAmount();
    }
  }, [postId, postStatus]);

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
          <SHeaderDiv>
            <SHeaderHeadline variant={3} successVariant>
              {t('postResponseTabModeration.succeeded.topHeader')}
            </SHeaderHeadline>
            <SCoin_1
              className='headerDiv__coinImage'
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
            <SCoin_2
              className='headerDiv__coinImage'
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
            <SCoin_3
              className='headerDiv__coinImage'
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
            <SCoin_4
              className='headerDiv__coinImage'
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
            <SCoin_5
              className='headerDiv__coinImage'
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
            <SCoin_6
              className='headerDiv__coinImage'
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
          </SHeaderDiv>
          <STextContentWrapper>
            <Text variant={2} weight={600}>
              {t('postResponseTabModeration.succeeded.youMade')}
            </Text>
            {earnedAmount?.usdCents && !earnedAmountLoading && (
              <SAmountHeadline variant={1}>
                ${formatNumber(earnedAmount.usdCents / 100 ?? 0, false)}
              </SAmountHeadline>
            )}
            {postType === 'ac' && winningOptionAc && (
              <>
                <SText variant={2} weight={600}>
                  <SSpan>
                    {winningOptionAc.supporterCount === 1
                      ? t(
                          'postResponseTabModeration.winner.ac.numBiddersChoseSingular',
                          {
                            amount: 1,
                          }
                        )
                      : t(
                          'postResponseTabModeration.winner.ac.numBiddersChose',
                          {
                            amount: formatNumber(
                              winningOptionAc.supporterCount ?? 0,
                              true
                            ),
                          }
                        )}
                  </SSpan>
                  <SUserAvatar
                    draggable={false}
                    src={winningOptionAc?.creator?.avatarUrl!!}
                  />
                  <SSpan>
                    <Trans
                      i18nKey='postResponseTabModeration.winner.ac.optionCreator'
                      t={t}
                      // Can it be reworked wso it uses t inside the Link element (without Trans element)?
                      // @ts-ignore
                      components={[
                        <SCreatorLink
                          href={`/${winningOptionAc.creator?.username}`}
                        />,
                        winningOptionAc.creator?.options?.isVerified ? (
                          <SInlineSvg
                            svg={VerificationCheckmark}
                            width='22px'
                            height='22px'
                            fill='none'
                          />
                        ) : null,
                        { nickname: getDisplayname(winningOptionAc.creator!!) },
                      ]}
                    />
                  </SSpan>
                </SText>
                <SHeadline variant={5}>{winningOptionAc.title}</SHeadline>
              </>
            )}
            {postType === 'mc' && winningOptionMc && (
              <>
                <SText variant={2} weight={600}>
                  <SSpan>
                    {winningOptionMc.supporterCount === 1
                      ? t(
                          'postResponseTabModeration.winner.mc.numBiddersChoseSingular',
                          {
                            amount: 1,
                          }
                        )
                      : t(
                          'postResponseTabModeration.winner.mc.numBiddersChose',
                          {
                            amount: formatNumber(
                              winningOptionMc.supporterCount ?? 0,
                              true
                            ),
                          }
                        )}
                  </SSpan>{' '}
                  {winningOptionMc.creator &&
                  winningOptionMc?.creator?.uuid !== user.userData?.userUuid ? (
                    <>
                      <SUserAvatar
                        draggable={false}
                        src={winningOptionMc?.creator?.avatarUrl!!}
                      />
                      <SSpan>
                        {/* Can it be reworked wso it uses t inside the Link element (without Trans element)? */}
                        <Trans
                          i18nKey='postResponseTabModeration.winner.mc.optionCreator'
                          t={t}
                          // @ts-ignore
                          components={[
                            <SCreatorLink
                              href={`/${winningOptionMc.creator?.username}`}
                            />,
                            winningOptionMc.creator?.options?.isVerified ? (
                              <SInlineSvg
                                svg={VerificationCheckmark}
                                width='22px'
                                height='22px'
                                fill='none'
                              />
                            ) : null,
                            {
                              nickname: getDisplayname(
                                winningOptionMc.creator!!
                              ),
                            },
                          ]}
                        />
                      </SSpan>
                    </>
                  ) : (
                    <SSpan>
                      {t('postResponseTabModeration.winner.mc.optionOwn')}
                    </SSpan>
                  )}
                </SText>
                <SHeadline variant={5}>{winningOptionMc.text}</SHeadline>
              </>
            )}
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
        <PostResponseSuccessModal
          amount={amountSwitch()}
          isOpen={responseUploadSuccess}
          zIndex={20}
        />
      </>
    );
  }

  return (
    <SContainer>
      <SHeaderDiv>
        <SHeaderHeadline variant={3}>
          {t('postResponseTabModeration.awaiting.topHeader')}
        </SHeaderHeadline>
        <SCoin_1
          className='headerDiv__coinImage'
          src={assets.decision.gold}
          alt='coin'
          draggable={false}
        />
        <SCoin_2
          className='headerDiv__coinImage'
          src={assets.decision.gold}
          alt='coin'
          draggable={false}
        />
        <SCoin_3
          className='headerDiv__coinImage'
          src={assets.decision.gold}
          alt='coin'
          draggable={false}
        />
        <SCoin_4
          className='headerDiv__coinImage'
          src={assets.decision.gold}
          alt='coin'
          draggable={false}
        />
        <SCoin_5
          className='headerDiv__coinImage'
          src={assets.decision.gold}
          alt='coin'
          draggable={false}
        />
        <SCoin_6
          className='headerDiv__coinImage'
          src={assets.decision.gold}
          alt='coin'
          draggable={false}
        />
      </SHeaderDiv>
      <STextContentWrapper>
        <Text variant={2} weight={600}>
          {t('postResponseTabModeration.awaiting.youWillGet')}
        </Text>
        {postType === 'ac' && winningOptionAc?.totalAmount?.usdCents && (
          <SAmountHeadline variant={1}>
            $
            {formatNumber(
              winningOptionAc.totalAmount.usdCents / 100 ?? 0,
              true
            )}
          </SAmountHeadline>
        )}
        {postType === 'mc' && winningOptionMc?.voteCount && (
          <SAmountHeadline variant={1}>
            $
            {formatNumber(
              winningOptionMc.voteCount *
                Math.round(appConstants.mcVotePrice / 100),
              true
            )}
          </SAmountHeadline>
        )}
        {postType === 'cf' && moneyBacked?.usdCents && (
          <SAmountHeadline variant={1}>
            ${formatNumber(moneyBacked.usdCents / 100 ?? 0, true)}
          </SAmountHeadline>
        )}
        {postType === 'ac' && winningOptionAc && (
          <>
            <SText variant={2} weight={600}>
              <SSpan>
                {winningOptionAc.supporterCount === 1
                  ? t(
                      'postResponseTabModeration.winner.ac.numBiddersChoseSingular',
                      {
                        amount: 1,
                      }
                    )
                  : t('postResponseTabModeration.winner.ac.numBiddersChose', {
                      amount: formatNumber(
                        winningOptionAc.supporterCount ?? 0,
                        true
                      ),
                    })}
              </SSpan>
              <SUserAvatar
                draggable={false}
                src={winningOptionAc?.creator?.avatarUrl!!}
              />
              <SSpan>
                <Trans
                  i18nKey='postResponseTabModeration.winner.ac.optionCreator'
                  t={t}
                  // @ts-ignore
                  components={[
                    <SCreatorLink
                      href={`/${winningOptionAc.creator?.username}`}
                    />,
                    winningOptionAc.creator?.options?.isVerified ? (
                      <SInlineSvg
                        svg={VerificationCheckmark}
                        width='22px'
                        height='22px'
                        fill='none'
                      />
                    ) : null,
                    { nickname: getDisplayname(winningOptionAc.creator!!) },
                  ]}
                />
              </SSpan>
            </SText>
            <SHeadline variant={5}>{winningOptionAc.title}</SHeadline>
          </>
        )}
        {postType === 'mc' && winningOptionMc && (
          <>
            <SText variant={2} weight={600}>
              <SSpan>
                {winningOptionMc.supporterCount === 1
                  ? t(
                      'postResponseTabModeration.winner.mc.numBiddersChoseSingular',
                      {
                        amount: 1,
                      }
                    )
                  : t('postResponseTabModeration.winner.mc.numBiddersChose', {
                      amount: formatNumber(
                        winningOptionMc.supporterCount ?? 0,
                        true
                      ),
                    })}
              </SSpan>{' '}
              {winningOptionMc.creator &&
              winningOptionMc?.creator?.uuid !== user.userData?.userUuid ? (
                <>
                  <SUserAvatar
                    draggable={false}
                    src={winningOptionMc?.creator?.avatarUrl!!}
                  />
                  <SSpan>
                    <Trans
                      i18nKey='postResponseTabModeration.winner.mc.optionCreator'
                      t={t}
                      // @ts-ignore
                      components={[
                        <SCreatorLink
                          href={`/${winningOptionMc.creator?.username}`}
                        />,
                        winningOptionMc.creator?.options?.isVerified ? (
                          <SInlineSvg
                            svg={VerificationCheckmark}
                            width='22px'
                            height='22px'
                            fill='none'
                          />
                        ) : null,
                        {
                          nickname: getDisplayname(winningOptionMc.creator!!),
                        },
                      ]}
                    />
                  </SSpan>
                </>
              ) : (
                <SSpan>
                  {t('postResponseTabModeration.winner.mc.optionOwn')}
                </SSpan>
              )}
            </SText>
            <SHeadline variant={5}>{winningOptionMc.text}</SHeadline>
          </>
        )}
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
      <PostResponseSuccessModal
        amount={amountSwitch()}
        isOpen={responseUploadSuccess}
        zIndex={20}
      />
    </SContainer>
  );
};

export default PostResponseTabModeration;

const SCreatorLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SInlineSvg = styled(InlineSvg)`
  margin-right: 4px;
`;

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

  .headerDiv__coinImage {
    position: absolute;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    min-height: 128px;
    margin-top: 0px;
  }
`;

const SHeaderHeadline = styled(Headline)<{
  successVariant?: boolean;
}>`
  color: #ffffff;
  white-space: pre;

  ${({ theme }) => theme.media.laptopL} {
    font-size: 56px;
    line-height: 64px;
    ${({ successVariant }) =>
      successVariant
        ? css`
            white-space: initial;
          `
        : null}
  }
`;

const SCoin_1 = styled.img`
  width: 56px;
  bottom: -32px;
  left: 5px;

  transform: scale(0.8) rotate(180deg) scale(1, -1);

  ${({ theme }) => theme.media.tablet} {
    transform: rotate(180deg) scale(1, -1);
  }
`;

const SCoin_2 = styled.img`
  width: 86px;
  top: -48px;
  left: 15%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

const SCoin_3 = styled.img`
  width: 98px;
  top: 10%;
  right: 5%;
  transform: scale(0.8) rotate(180deg) scale(1, -1);

  ${({ theme }) => theme.media.tablet} {
    transform: rotate(180deg) scale(1, -1);
  }
`;

const SCoin_4 = styled.img`
  width: 56px;
  top: 16%;
  right: 25%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

const SCoin_5 = styled.img`
  width: 84px;
  bottom: -28px;
  right: 25%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

const SCoin_6 = styled.img`
  width: 32px;
  top: 16px;
  right: 35%;

  transform: scale(0.8);

  ${({ theme }) => theme.media.tablet} {
    transform: initial;
  }
`;

const STextContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  margin-top: 32px;
`;

const SAmountHeadline = styled(Headline)``;

const SText = styled(Text)`
  margin-top: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpan = styled.span`
  display: inline-flex;
  white-space: pre;
`;

const SUserAvatar = styled.img`
  position: relative;
  top: 6px;

  width: 24px;
  margin-left: 8px;
  margin-right: 4px;

  border-radius: 50%;
  object-fit: contain;
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
