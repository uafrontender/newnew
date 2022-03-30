/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useMemo, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../../redux-store/store';
import { voteOnPostWithWallet } from '../../../../api/endpoints/multiple_choice';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';

import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import OptionActionMobileModal from '../OptionActionMobileModal';
import VotesAmountTextInput from '../../../atoms/decision/VotesAmountTextInput';

import { formatNumber } from '../../../../utils/format';

// Icons
import McSymbolIcon from '../../../../public/images/decision/mc-option-mock.png';

interface IMcOptionCardDoubleVote {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser,
  postId: string;
  index: number;
  hasAlreadyVoted: boolean;
  noAction: boolean;
  optionBeingSupported?: string;
  handleSetSupportedBid: (id: string) => void;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.MultipleChoice.Option) => void;
}

const McOptionCardDoubleVote: React.FunctionComponent<IMcOptionCardDoubleVote> = ({
  option,
  creator,
  postId,
  index,
  hasAlreadyVoted,
  noAction,
  optionBeingSupported,
  handleSetSupportedBid,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);

  const isSupportedByMe = useMemo(() => option.isSupportedByMe, [option.isSupportedByMe]);
  const isSuggestedByMe = useMemo(
    () => option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid]
  );
  const isCreatorsBid = useMemo(() => {
    if (!option.creator) return true;
    return false;
  }, [option.creator]);
  const supporterCountSubsctracted = useMemo(() => {
    if (!isSupportedByMe) return option.supporterCount;
    return  option.supporterCount - 1;
  }, [option.supporterCount, isSupportedByMe]);

  const [doubleVoteAmount, setDoubleVoteAmount] = useState('');

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => {
    window?.history.replaceState({
      fromPost: true,
    }, '', '');
    router.push(`/${creator?.username}`);
  }

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  // Handlers
  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  const handleDoubleVoteWithWallet = useCallback(() => {

  }, []);

  const handleDoubleVoteWithCardStripeRedirect = useCallback(() => {

  }, []);

  return (
    <motion.div
      key={index}
      layout="position"
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      <SContainerDoubleVote
        layout="position"
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        <SBidDetailsDoubleVote>
          <SBidAmount>
            <SOptionSymbolImg
              src={McSymbolIcon.src}
            />
            <div>
              {
                option.voteCount && option.voteCount > 0
                ? `${formatNumber(option?.voteCount, true)}`
                : t('McPost.OptionsTab.OptionCard.noVotes')
              }
            </div>
          </SBidAmount>
          <SOptionInfo
            variant={3}
          >
            {option.text}
          </SOptionInfo>
          <SBiddersInfo
            variant={3}
          >
            {isCreatorsBid ? (
              <>
                <SSpanBiddersHighlightedDoubleVote>
                  {`${t('me')}`}
                </SSpanBiddersHighlightedDoubleVote>
                {supporterCountSubsctracted > 0 ? (
                  <>
                    <SSpanBiddersRegularDoubleVote>
                      {option.isSupportedByMe || option.isCreatedBySubscriber ? ` & ` : ''}
                    </SSpanBiddersRegularDoubleVote>
                    <SSpanBiddersHighlightedDoubleVote>
                      {formatNumber(
                        supporterCountSubsctracted,
                        true,
                      )}
                      { ' ' }
                      {t('McPost.OptionsTab.OptionCard.others')}
                    </SSpanBiddersHighlightedDoubleVote>
                    {' '}
                    <SSpanBiddersRegularDoubleVote>
                      {t('McPost.OptionsTab.OptionCard.voted')}
                    </SSpanBiddersRegularDoubleVote>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <SSpanBiddersHighlightedDoubleVote
                  onClick={() => {
                    if (!isSuggestedByMe) {
                      handleRedirectToOptionCreator()
                    }
                  }}
                  style={{
                    ...(!isSuggestedByMe && option.isCreatedBySubscriber ? {
                      color: theme.colorsThemed.accent.yellow,
                    } : {}),
                    ...(!isSuggestedByMe ? {
                      cursor: 'pointer',
                    } : {}),
                  }}
                >
                  {isSuggestedByMe
                    ? t('McPost.OptionsTab.OptionCard.my_suggestion')
                    : t(
                      'McPost.OptionsTab.OptionCard.subscriber_suggestion',
                      {
                        nickname: option.creator?.nickname ?? option.creator?.username
                      }
                    )
                  }
                </SSpanBiddersHighlightedDoubleVote>
                {isSupportedByMe && !isSuggestedByMe ? (
                  <SSpanBiddersHighlightedDoubleVote>
                    {`, ${t('me')}`}
                  </SSpanBiddersHighlightedDoubleVote>
                ) : null}
                {supporterCountSubsctracted > 0 ? (
                  <>
                    <SSpanBiddersRegularDoubleVote>
                      {isSupportedByMe && !isSuggestedByMe ? (
                        ` & `
                        ) : (
                          `, `
                      )}
                    </SSpanBiddersRegularDoubleVote>
                    <SSpanBiddersHighlightedDoubleVote>
                      {formatNumber(
                        option.supporterCount - (isSupportedByMe && !isSuggestedByMe ? 2 : 1),
                        true,
                      )}
                      { ' ' }
                      {
                        option.isCreatedBySubscriber || option.isSupportedByMe ? (
                          t('McPost.OptionsTab.OptionCard.others')
                        ) : (
                          t('McPost.OptionsTab.OptionCard.voters')
                        )
                      }
                    </SSpanBiddersHighlightedDoubleVote>
                  </>
                ) : null}
                {' '}
                <SSpanBiddersRegularDoubleVote>
                  {t('McPost.OptionsTab.OptionCard.voted')}
                </SSpanBiddersRegularDoubleVote>
              </>
            )
            }
          </SBiddersInfo>
          <SDoubleMyVote>
            <SDoubleMyVoteCaption>
              { t('McPost.OptionsTab.OptionCard.doubleMyVoteCaption') }
            </SDoubleMyVoteCaption>
            <SDoubleMyVoteButton
              onClick={() => handleTogglePaymentModalOpen()}
            >
            { t('McPost.OptionsTab.OptionCard.doubleMyVoteButton') }
            </SDoubleMyVoteButton>
          </SDoubleMyVote>
        </SBidDetailsDoubleVote>
      </SContainerDoubleVote>
      {/* Double my vote */}
      {paymentModalOpen ? (
        <PaymentModal
          zIndex={12}
          showTocApply={!user?.loggedIn}
          isOpen={paymentModalOpen}
          amount={`$${parseInt(doubleVoteAmount, 10) * 5}`}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithWallet={handleDoubleVoteWithWallet}
          handlePayWithCardStripeRedirect={handleDoubleVoteWithCardStripeRedirect}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle
              variant={3}
            >
              { t('McPost.paymenModalHeader.subtitle') }
            </SPaymentModalTitle>
            <SPaymentModalOptionText>
              { option.text }
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null }
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </motion.div>
  );
};

McOptionCardDoubleVote.defaultProps = {
  optionBeingSupported: undefined,
};

export default McOptionCardDoubleVote;

const SBidAmount = styled.div`
  grid-area: amount;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  margin-bottom: 6px;
`;

const SOptionSymbolImg = styled.img`
  height: 24px;
`;

const SOptionInfo = styled(Text)`
  grid-area: optionInfo;

  color: #FFFFFF;

  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
  }
`;

const SBiddersInfo = styled(Text)`
  grid-area: bidders;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
  }
`;

// Payment modal header
const SPaymentModalHeader = styled.div``;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Double my vote view
const SContainerDoubleVote = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;

    padding: 16px;
  }
`;

const SBidDetailsDoubleVote = styled.div`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders'
    'doubleVote doubleVote';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  color: #FFFFFF !important;

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
    'amount bidders'
    'optionInfo optionInfo'
    'doubleVote doubleVote';
    grid-template-columns: 3fr 7fr;

    padding: initial;
  }
`;

const SSpanBiddersHighlightedDoubleVote = styled.span`
  color: #FFFFFF;
`;

const SSpanBiddersRegularDoubleVote = styled.span`
  color: #FFFFFF;
  opacity: 0.6;
`;

const SDoubleMyVote = styled.div`
  grid-area: doubleVote;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  margin-top: 12px;

  padding: 12px 16px;
  gap: 8px;

  background: rgba(255, 255, 255, 0.3);

  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;

  width: calc(100% + 32px);
  position: relative;
  left: -16px;
  top: 16px;

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: nowrap;
    border-radius: 16px;

    width: initial;
    position: static;
  }
`;

const SDoubleMyVoteCaption = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: #FFFFFF;
`;

const SDoubleMyVoteButton = styled(Button)`
  background: #FFFFFF;
  color: #2C2C33;
  width: 100%;
  height: 48px;

  &:focus:enabled,
  &:hover:enabled  {
    background: #FFFFFF;
  }

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: fit-content;
  }
`;
