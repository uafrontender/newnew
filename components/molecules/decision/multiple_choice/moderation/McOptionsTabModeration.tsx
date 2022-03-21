/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useAppSelector } from '../../../../../redux-store/store';
import { TMcOptionWithHighestField } from '../../../../organisms/decision/PostViewMC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import McOptionCardModeration from './McOptionCardModeration';
import GradientMask from '../../../../atoms/GradientMask';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

interface IMcOptionsTabModeration {
  post: newnewapi.MultipleChoice;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadOptions: (token?: string) => void;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTabModeration: React.FunctionComponent<IMcOptionsTabModeration> = ({
  post,
  options,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadOptions,
  handleRemoveOption,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(containerRef);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
        >
          {!isMobile ? (
            <>
              <GradientMask gradientType="secondary" positionTop active={showTopGradient} />
              <GradientMask gradientType="secondary" positionBottom={0} active={showBottomGradient} />
            </>
          ) : null}
          {options.map((option, i) => (
            <McOptionCardModeration
              index={i}
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              creator={option.creator ?? post.creator!!}
              postId={post.postUuid}
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv
              ref={loadingRef}
            />
          ) : (
            pagingToken ? (
              (
                <SLoadMoreBtn
                  onClick={() => handleLoadOptions(pagingToken)}
                >
                  { t('loadMoreBtn') }
                </SLoadMoreBtn>
              )
            ) : null
          )}
        </SBidsContainer>
      </STabContainer>
    </>
  );
};

McOptionsTabModeration.defaultProps = {
};

export default McOptionsTabModeration;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 56px);
`;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  /* gap: 16px; */
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`

`;

const SActionButton = styled(Button)`
  position: fixed;
  z-index: 2;

  width: calc(100% - 32px);
  bottom: 16px;
  left: 16px;
`;

const SSuggestNewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;

  textarea {
    width: 100%;
  }
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
    box-shadow: 0px -50px 18px 20px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 0.9)' : 'rgba(241, 243, 249, 0.9)')};
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

// Payment modal header
const SPaymentModalHeader = styled.div`

`;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
