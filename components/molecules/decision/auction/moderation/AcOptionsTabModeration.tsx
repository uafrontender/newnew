/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
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

import { TAcOptionWithHighestField } from '../../../../organisms/decision/PostViewAC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import AcOptionCardModeration from './AcOptionCardModeration';

import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import NoContentYetImg from '../../../../../public/images/decision/no-content-yet-mock.png';

interface IAcOptionsTabModeration {
  postId: string;
  options: newnewapi.Auction.Option[];
  optionToAnimate?: string;
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadBids: (token?: string) => void;
  overviewedOption?: newnewapi.Auction.Option;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.Auction.Option) => void;
  handleCloseOptionBidHistory: () => void;
  handleOpenOptionBidHistory: (
    optionToOpen: newnewapi.Auction.Option
  ) => void;
}

const AcOptionsTabModeration: React.FunctionComponent<IAcOptionsTabModeration> = ({
  postId,
  options,
  optionToAnimate,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadBids,
  overviewedOption,
  handleAddOrUpdateOptionFromResponse,
  handleCloseOptionBidHistory,
  handleOpenOptionBidHistory,
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

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  const mainContainer = useRef<HTMLDivElement>();
  const overviewedRefId = useRef('');

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        ref={(el) => {
          mainContainer.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {options.length === 0 && !optionsLoading ? (
          <SNoOptionsYet>
            <SNoOptionsImgContainer>
              <img
                src={NoContentYetImg.src}
                alt='No content yet'
              />
            </SNoOptionsImgContainer>
            <SNoOptionsCaption
              variant={3}
            >
              { t('AcPostModeration.OptionsTab.NoOptions.caption_1') }
            </SNoOptionsCaption>
            <SNoOptionsCaption
              variant={3}
            >
              { t('AcPostModeration.OptionsTab.NoOptions.caption_2') }
            </SNoOptionsCaption>
          </SNoOptionsYet>
        ) : null}
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
        >
          {!isMobile ? (
            <>
              <GradientMask positionTop active={showTopGradient} />
              <GradientMask positionBottom={0} active={showBottomGradient} />
            </>
          ) : null}
          {options.map((option, i) => (
            <AcOptionCardModeration
              key={option.id.toString()}
              option={option as TAcOptionWithHighestField}
              index={i}
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
                  view="secondary"
                  onClick={() => handleLoadBids(pagingToken)}
                >
                  { t('AcPost.OptionsTab.loadMoreBtn') }
                </SLoadMoreBtn>
              )
            ) : null
          )}
        </SBidsContainer>
      </STabContainer>
    </>
  );
};

AcOptionsTabModeration.defaultProps = {
  overviewedOption: undefined,
  optionToAnimate: undefined,
};

export default AcOptionsTabModeration;

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

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: 100%;
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: .2s linear;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: .2s linear;
    }

    &:hover {
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }
`;

const SShadowTop = styled.div`
  position: absolute;
  top: 0px;
  left: 0;

  width: calc(100% - 18px);
  height: 0px;

  z-index: 1;
  box-shadow:
    0px 0px 32px 40px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 1)' : 'rgba(241, 243, 249, 1)')};
  ;
  clip-path: inset(0px 0px -100px 0px);

  transition: linear .2s;
`;

const SShadowBottom = styled.div<{
  heightDelta: number;
}>`
  position: absolute;
  bottom: ${({ heightDelta }) => heightDelta}px;
  left: 0;

  width: calc(100% - 18px);
  height: 0px;

  z-index: 1;
  box-shadow:
    0px 0px 32px 40px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 1)' : 'rgba(241, 243, 249, 1)')};
  ;
  clip-path: inset(-100px 0px 0px 0px);
  transition: linear .2s;
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: calc(100% - 16px);
  height: 56px;
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
    align-items: flex-end;
    gap: 16px;

    position: absolute;
    min-height: 50px;
    width: 100%;
    z-index: 5;
    bottom: 0;

    padding-top: 8px;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;


// No options yet
const SNoOptionsYet = styled.div`
  position: absolute;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 400px;
`;

const SNoOptionsImgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  margin-bottom: 16px;
`;

const SNoOptionsCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
