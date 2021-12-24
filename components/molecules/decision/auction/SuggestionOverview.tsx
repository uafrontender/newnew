/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { placeBidOnAuction } from '../../../../api/endpoints/auction';
import { useAppSelector } from '../../../../redux-store/store';

import SuggestionCard from './SuggestionCard';
import Button from '../../../atoms/Button';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import PaymentModal from '../PaymentModal';
import PlaceBidForm from './PlaceBidForm';
import LoadingModal from '../LoadingModal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import isBrowser from '../../../../utils/isBrowser';

interface ISuggestionOverview {
  overviewedSuggestion: newnewapi.Auction.Option;
  handleCloseSuggestionBidHistory: () => void;
}

const SuggestionOverview: React.FunctionComponent<ISuggestionOverview> = ({
  overviewedSuggestion,
  handleCloseSuggestionBidHistory,
}) => {
  // Close on back btn
  useEffect(() => {
    const verifySuggestionHistoryOpen = () => {
      if (!isBrowser()) return;

      const suggestionId = new URL(window.location.href).searchParams.get('suggestion');

      if (!suggestionId) {
        handleCloseSuggestionBidHistory();
      }
    };

    window.addEventListener('popstate', verifySuggestionHistoryOpen);

    return () => window.removeEventListener('popstate', verifySuggestionHistoryOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      Overview
    </div>
  );
};

export default SuggestionOverview;
