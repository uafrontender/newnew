/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';

import { useAppSelector } from '../../../../redux-store/store';
import Text from '../../../atoms/Text';
import { TCfPledgeWithHighestField } from '../../../organisms/decision/regular/PostViewCF';

interface ICfPledgeCard {
  pledge: TCfPledgeWithHighestField;
  creator: newnewapi.IUser;
  index: number;
}

const CfPledgeCard: React.FunctionComponent<ICfPledgeCard> = ({
  pledge,
  creator,
  index,
}) => {
  const { t } = useTranslation('modal-Post');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const createdAtParsed = new Date(
    (pledge.createdAt?.seconds as number) * 1000
  );

  // Redirect to user's page
  const handleRedirectToUser = () => router.push(`/${creator?.username}`);

  return (
    <motion.div
      key={index}
      layout='position'
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
      <SContainer
        layout='position'
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        <SPledgeDetails>
          <SPledgeInfo>
            <SAvatar
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
              src={creator?.avatarUrl ?? ''}
              alt={pledge?.creator?.username ?? ''}
              draggable={false}
            />
            <SUsername
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
            >
              {creator?.uuid === user.userData?.userUuid
                ? t('cfPost.optionsTab.me')
                : creator?.username}
            </SUsername>
            <SAmount>
              {pledge.amount?.usdCents
                ? `$${(pledge?.amount?.usdCents / 100).toFixed(2)}`
                : '00.00'}
            </SAmount>
            {/* TODO: why mcPost? do other have tags? Remove excess texts */}
            {creator?.uuid === user.userData?.userUuid ? (
              <STag>{t('mcPost.optionsTab.tags.my_bid')}</STag>
            ) : null}
            {pledge.isHighest ? (
              <STag>{t('mcPost.optionsTab.tags.highest')}</STag>
            ) : null}
            {/* Comment out for now */}
            {/* {creator.isVIP
              ? (
                <STag>{t('mcPost.optionsTab.tags.vip')}</STag>
              ) : null} */}
          </SPledgeInfo>
          <SPledgeDate>
            {createdAtParsed.getDate()}{' '}
            {createdAtParsed.toLocaleString('default', { month: 'short' })}{' '}
            {createdAtParsed.getFullYear()}{' '}
          </SPledgeDate>
          {pledge.message ? (
            <SPledgeMessage variant={3}>{pledge.message}</SPledgeMessage>
          ) : null}
        </SPledgeDetails>
      </SContainer>
    </motion.div>
  );
};

CfPledgeCard.defaultProps = {};

export default CfPledgeCard;

const SContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SPledgeDetails = styled.div`
  display: grid;
  grid-template-areas:
    'info date'
    'message message';
  grid-template-columns: 7fr 2fr;
  gap: 16px;

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:hover {
    cursor: pointer;
  }
`;

const SPledgeInfo = styled.div`
  grid-area: info;

  vertical-align: middle;
  line-height: 24px;
`;

const SAvatar = styled.img`
  position: relative;
  top: 7.5px;

  display: inline;
  width: 24px;
  height: 24px;
  border-radius: 50%;

  margin-right: 8px;

  cursor: pointer;
`;

const SUsername = styled.div`
  display: inline;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  margin-right: 8px;

  transition: 0.2s linear;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const STag = styled.span`
  position: relative;
  top: -2px;

  white-space: nowrap;

  background-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: 50px;
  padding: 6px;

  font-weight: bold;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.background.primary};

  margin-right: 8px;
`;

const SAmount = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  margin-right: 8px;
`;

const SPledgeDate = styled.div`
  grid-area: date;
  align-self: center;
  justify-self: flex-end;

  position: relative;
  top: 4px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SPledgeMessage = styled(Text)`
  display: inline;
  line-break: loose;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
