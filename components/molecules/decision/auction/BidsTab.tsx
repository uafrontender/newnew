/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import BidCard from './BidCard';
import Button from '../../../atoms/Button';

interface IBidsTab {
  bids: newnewapi.Auction.Option[];
  bidsLoading: boolean;
  pagingToken: string | undefined | null;
  handleLoadBids: (token?: string) => void;
}

const BidsTab: React.FunctionComponent<IBidsTab> = ({
  bids,
  bidsLoading,
  pagingToken,
  handleLoadBids,
}) => {
  const {
    ref: loadingRef,
    inView,
  } = useInView();
  const textareaRef = useRef<HTMLTextAreaElement>();

  useEffect(() => {
    if (inView && !bidsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, bidsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SBidsContainer>
          {bids.length > 0 && Array(20).fill(bids[0]).map((bid) => (
            <BidCard
              key={bid.id.toString()}
              bid={bid}
              onSupportBtnClick={() => {}}
            />
          ))}
        </SBidsContainer>
        <SLoaderDiv
          ref={loadingRef}
        />
        <SActionSection>
          <STextarea
            ref={(el) => {
              textareaRef.current = el!!;
            }}
            rows={1}
            placeholder="Add a suggestion ..."
            onChangeCapture={() => {
              if (textareaRef?.current) {
                textareaRef.current.style.height = '';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
              }
            }}
          />
          <SAmountInput
            value="$5"
          />
          <Button
            view="primaryGrad"
            size="sm"
          >
            Place a bid
          </Button>
        </SActionSection>
      </STabContainer>
    </>
  );
};

export default BidsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 112px);
`;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 125px;
  }
`;

const SLoaderDiv = styled.div`

`;

const SActionSection = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;

    position: absolute;
    min-height: 85px;
    width: 100%;
    z-index: 5;
    bottom: 0;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    box-shadow: 0px -50px 18px 20px rgba(20, 21, 31, 0.9);
  }
`;

const STextarea = styled.textarea`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px 20px;
  resize: none;
  width: 277px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
  }
`;

const SAmountInput = styled.input`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px 5px;
  width: 80px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: center;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
  }
`;
