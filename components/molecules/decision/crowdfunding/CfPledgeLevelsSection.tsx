/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../../redux-store/store';

import CfMakeStandardPledgeCard from './CfMakeStandardPledgeCard';
import CfMakeCustomPledgeCard from './CfMakeCustomPledgeCard';
import Button from '../../../atoms/Button';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import LoadingModal from '../LoadingModal';
import PaymentModal from '../PaymentModal';
import PlaceCfBidForm from './PlaceCfBidForm';
import { doPledgeCrowdfunding } from '../../../../api/endpoints/crowdfunding';

interface ICfPledgeLevelsSection {
  pledgeLevels: newnewapi.IMoneyAmount[];
  post: newnewapi.Crowdfunding;
  handleSetHeightDelta: (newValue: number) => void;
}

const CfPledgeLevelsSection: React.FunctionComponent<ICfPledgeLevelsSection> = ({
  pledgeLevels,
  post,
  handleSetHeightDelta,
}, ref) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const containerRef = useRef<HTMLDivElement>();

  const [customPledgeAmount, setCustomPledgeAmount] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState<number | undefined>(undefined);
  const [selectedPledgeLevelIdx, setSelectedPledgeLevelIdx] = useState(-1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pledgeMessage, setPledgeMessage] = useState('');
  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  const handleOpenPledgeForm = useCallback((idx: number, amount: number) => {
    setPledgeAmount(amount);
    setSelectedPledgeLevelIdx(idx);
    setIsFormOpen(true);
  }, [
    setPledgeAmount,
    setSelectedPledgeLevelIdx,
  ]);

  const handleClosePledgeForm = () => {
    setPledgeAmount(undefined);
    setSelectedPledgeLevelIdx(-1);
    setIsFormOpen(false);
  };

  const handleTogglePaymentModalOpen = () => {
    if (!user.loggedIn) {
      router.push('/sign-up?reason=make-pledge');
      return;
    }
    setPaymentModalOpen(true);
  };

  // Make a pledge and close all forms and modals
  const handleMakePledge = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const makePledgePayload = new newnewapi.DoPledgeRequest({
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(pledgeAmount?.toString()!!, 10),
        }),
        postUuid: post.postUuid,
        ...(pledgeMessage ? (
          {
            message: pledgeMessage,
          }
        ) : {}),
      });

      console.log(makePledgePayload);

      const res = await doPledgeCrowdfunding(makePledgePayload);

      if (!res.data
        || res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      setCustomPledgeAmount('');
      setSelectedPledgeLevelIdx(-1);
      setIsFormOpen(false);
      setPledgeMessage('');
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
    } catch (err) {
      console.error(err);
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
    }
  }, [pledgeAmount, pledgeMessage, post.postUuid]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log(containerRef.current?.getBoundingClientRect().height);
      handleSetHeightDelta(containerRef.current?.getBoundingClientRect().height ?? 256);
    };

    containerRef.current?.addEventListener('resize', handleUpdate);

    return () => containerRef.current?.removeEventListener('resize', handleUpdate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPledgeLevelIdx === 100) {
      setPledgeAmount(parseInt(customPledgeAmount, 10) * 100);
    }
  }, [customPledgeAmount, selectedPledgeLevelIdx]);

  useEffect(() => {
    if (selectedPledgeLevelIdx !== -1 && selectedPledgeLevelIdx !== 100) {
      setPledgeAmount(pledgeLevels[selectedPledgeLevelIdx].usdCents!!);
    }
  }, [selectedPledgeLevelIdx, pledgeLevels]);

  return (
    <>
      <SSectionContainer
        ref={(el) => {
          // eslint-disable-next-line no-param-reassign
          containerRef.current = el!!;
        }}
      >
        {pledgeLevels.map((pledgeLevel, i, arr) => (
          <CfMakeStandardPledgeCard
            amount={pledgeLevel}
            isHighest={i === arr.length - 2}
            grandsVipStatus={i === arr.length - 1}
            disabled={selectedPledgeLevelIdx !== -1 && selectedPledgeLevelIdx !== i}
            handleOpenMakePledgeForm={() => {
              handleOpenPledgeForm(i, pledgeLevel.usdCents!!);
            }}
          />
        ))}
        <CfMakeCustomPledgeCard
          customAmount={customPledgeAmount}
          disabled={selectedPledgeLevelIdx !== -1 && selectedPledgeLevelIdx !== 100}
          isSelected={selectedPledgeLevelIdx === 100}
          handleSetCustomAmount={(newValue: string) => setCustomPledgeAmount(newValue)}
          handleOpenMakePledgeForm={() => {
            handleOpenPledgeForm(100, parseInt(customPledgeAmount, 10));
          }}
        />
        <SCaption>
          { t('You won\'t get charged until a decision has been made.') }
        </SCaption>
        {!isMobile && isFormOpen ? (
          <SNewPledgeForm>
            <SuggestionTextArea
              value={pledgeMessage}
              placeholder={t('McPost.PledgeLevelsSection.messagePlaceholder')}
              onChange={(e) => setPledgeMessage(e.target.value)}
            />
            <Button
              view="primaryGrad"
              size="sm"
              onClick={() => handleTogglePaymentModalOpen()}
            >
              { t('AcPost.OptionsTab.ActionSection.placeABidBtn') }
            </Button>
            <SCancelButton
              view="secondary"
              onClick={() => handleClosePledgeForm()}
            >
              { t('AcPost.OptionsTab.OptionCard.cancelBtn') }
            </SCancelButton>
          </SNewPledgeForm>
        ) : null}
      </SSectionContainer>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceCfBidForm
            optionTitle={pledgeMessage}
            amountRounded={pledgeAmount?.toString() ?? ''}
            handlePlaceBid={handleMakePledge}
          />
        </PaymentModal>
      ) : null }
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </>
  );
};

export default CfPledgeLevelsSection;

const SSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: calc(100% - 16px);

  padding-bottom: 24px;
  margin-bottom: 24px;

  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const SCaption = styled.div`
  order: -1;
  text-align: center;

  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    order: unset;
    width: 100%;
  }
`;

const SNewPledgeForm = styled.div`
  width: 100%;
  display: flex;
`;

const SCancelButton = styled(Button)`
  width: auto;

  padding: 0px 12px;
  margin-right: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover:enabled, &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;
