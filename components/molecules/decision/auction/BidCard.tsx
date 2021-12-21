/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { newnewapi } from 'newnew-api';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Button from '../../../atoms/Button';
import Text from '../../../atoms/Text';

interface IBidCard {
  bid: newnewapi.Auction.Option;
  onSupportBtnClick: (bid: newnewapi.Auction.Option) => void;
}

const BidCard: React.FunctionComponent<IBidCard> = ({
  bid,
  onSupportBtnClick,
}) => {
  return (
    <SContainer>
      <SBidDetails>
        <SBidTitle
          variant={3}
        >
          { bid.title }
        </SBidTitle>
        <SBidInfo>
          <SAvatarArea>
            <img
              src={bid?.creator?.avatarUrl!! as string}
              alt={bid?.creator?.username!!}
            />
          </SAvatarArea>
          <SUsername>
            { bid?.creator?.username }
          </SUsername>
          <SAmount>
            {bid.totalAmount?.usdCents
              ? (
                `$${(bid?.totalAmount?.usdCents / 100).toFixed(2)}`
              ) : '00.00'}
              {` by `}
              { bid.supporterCount }
              {` bidders `}
          </SAmount>
        </SBidInfo>
      </SBidDetails>
      <SSupportButton
        view="secondary"
      >
        Support
      </SSupportButton>
    </SContainer>
  );
};

export default BidCard;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
`;

const SBidDetails = styled.div`
  display: grid;

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    max-width: 402px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 430px;
  }
`;

const SBidTitle = styled(Text)`
  margin-bottom: 8px;
`;

const SBidInfo = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
`;

const SAvatarArea = styled.div`
  overflow: hidden;
  border-radius: 50%;
  width: 36px;
  height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SUsername = styled.div`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SAmount = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary}
`;

const SSupportButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0;
    margin-right: 16px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover:enabled, &:focus:enabled {
      background: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;
