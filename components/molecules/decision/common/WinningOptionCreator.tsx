/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import { useAppSelector } from '../../../../redux-store/store';
import getDisplayname from '../../../../utils/getDisplayname';
import { formatNumber } from '../../../../utils/format';

import InlineSvg from '../../../atoms/InlineSVG';

import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';

interface IWinningOptionCreator {
  type: 'mc' | 'ac';
  postCreator: newnewapi.IUser;
  winningOptionAc?: newnewapi.Auction.IOption;
  winningOptionMc?: newnewapi.MultipleChoice.IOption;
}

const WinningOptionCreator: React.FC<IWinningOptionCreator> = ({
  type,
  postCreator,
  winningOptionAc,
  winningOptionMc,
}) => {
  const { t } = useTranslation('page-Post');
  const userData = useAppSelector((state) => state.user?.userData);

  const winningOption = useMemo(
    () => (type === 'ac' ? winningOptionAc!! : winningOptionMc!!),
    [type, winningOptionAc, winningOptionMc]
  );

  const isVerified = useMemo(
    () => winningOption.creator?.options?.isVerified,
    [winningOption.creator?.options?.isVerified]
  );

  if (type === 'mc') {
    return (
      <SWinningBidCreator>
        <SCreator>
          {isVerified ? (
            <Link
              href={`/${
                winningOption.creator?.uuid !== postCreator?.uuid
                  ? winningOption.creator?.username!!
                  : (winningOption as newnewapi.MultipleChoice.IOption)
                      .firstVoter?.username!!
              }`}
            >
              <SCreatorImage
                src={
                  winningOption.creator?.uuid !== postCreator?.uuid
                    ? winningOption.creator?.avatarUrl!!
                    : (winningOption as newnewapi.MultipleChoice.IOption)
                        .firstVoter?.avatarUrl!!
                }
              />
            </Link>
          ) : (
            <SCreatorImage
              src={
                winningOption.creator?.uuid !== postCreator?.uuid
                  ? winningOption.creator?.avatarUrl!!
                  : (winningOption as newnewapi.MultipleChoice.IOption)
                      .firstVoter?.avatarUrl!!
              }
            />
          )}
          <SWinningBidCreatorText>
            <SSpan>
              {isVerified ? (
                <Link
                  href={`/${
                    winningOption.creator?.uuid !== postCreator?.uuid
                      ? winningOption.creator?.username!!
                      : (winningOption as newnewapi.MultipleChoice.IOption)
                          .firstVoter?.username!!
                  }`}
                >
                  {winningOption.creator?.uuid === userData?.userUuid ||
                  winningOption.isSupportedByMe
                    ? winningOption.supporterCount &&
                      winningOption.supporterCount > 1
                      ? t('me')
                      : t('I')
                    : getDisplayname(
                        winningOption.creator?.uuid !== postCreator?.uuid
                          ? winningOption.creator!!
                          : (winningOption as newnewapi.MultipleChoice.IOption)
                              .firstVoter!!
                      )}
                </Link>
              ) : (
                <>
                  {winningOption.creator?.uuid === userData?.userUuid ||
                  winningOption.isSupportedByMe
                    ? winningOption.supporterCount &&
                      winningOption.supporterCount > 1
                      ? t('me')
                      : t('I')
                    : getDisplayname(
                        winningOption.creator?.uuid !== postCreator?.uuid
                          ? winningOption.creator!!
                          : (winningOption as newnewapi.MultipleChoice.IOption)
                              .firstVoter!!
                      )}
                </>
              )}
            </SSpan>
            {winningOption.creator?.options?.isVerified && (
              <SInlineSVG svg={VerificationCheckmark} fill='none' />
            )}
            {winningOption.supporterCount &&
            winningOption.supporterCount > 1 ? (
              <>
                {' & '}
                {formatNumber(winningOption.supporterCount - 1, true)}{' '}
                {t('mcPostSuccess.others')}
              </>
            ) : null}{' '}
            {t('mcPostSuccess.voted')}
          </SWinningBidCreatorText>
        </SCreator>
      </SWinningBidCreator>
    );
  }

  if (type === 'ac') {
    return (
      <SWinningBidCreator>
        <SCreator>
          {isVerified ? (
            <Link
              href={`/${
                winningOption.creator?.uuid === userData?.userUuid ||
                winningOption.isSupportedByMe
                  ? 'profile'
                  : winningOption.creator?.username
              }`}
            >
              <SCreatorImage
                src={
                  winningOption.creator?.uuid === userData?.userUuid ||
                  winningOption.isSupportedByMe
                    ? userData?.avatarUrl ?? ''
                    : winningOption.creator?.avatarUrl ?? ''
                }
              />
            </Link>
          ) : (
            <SCreatorImage
              src={
                winningOption.creator?.uuid === userData?.userUuid ||
                winningOption.isSupportedByMe
                  ? userData?.avatarUrl ?? ''
                  : winningOption.creator?.avatarUrl ?? ''
              }
            />
          )}
          <SWinningBidCreatorText>
            <SSpan>
              {isVerified ? (
                <Link
                  href={`/${
                    winningOption.creator?.uuid === userData?.userUuid ||
                    winningOption.isSupportedByMe
                      ? 'profile'
                      : winningOption.creator?.username
                  }`}
                >
                  {winningOption.creator?.uuid === userData?.userUuid ||
                  winningOption.isSupportedByMe
                    ? winningOption.supporterCount &&
                      winningOption.supporterCount > 1
                      ? t('me')
                      : t('my')
                    : getDisplayname(winningOption.creator!!)}
                </Link>
              ) : (
                <>
                  {winningOption.creator?.uuid === userData?.userUuid ||
                  winningOption.isSupportedByMe
                    ? winningOption.supporterCount &&
                      winningOption.supporterCount > 1
                      ? t('me')
                      : t('my')
                    : getDisplayname(winningOption.creator!!)}
                </>
              )}
            </SSpan>
            {winningOption.creator?.options?.isVerified && (
              <SInlineSVG svg={VerificationCheckmark} fill='none' />
            )}
            {winningOption.supporterCount &&
            winningOption.supporterCount > 1 ? (
              <>
                {' & '}
                {formatNumber(winningOption.supporterCount - 1, true)}{' '}
                {t('acPostSuccess.others')}
              </>
            ) : null}{' '}
            {t('acPostSuccess.bid')}
          </SWinningBidCreatorText>
        </SCreator>
      </SWinningBidCreator>
    );
  }

  return null;
};

export default WinningOptionCreator;

const SCreator = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 24px;

  vertical-align: middle;
`;

const SCreatorImage = styled.img`
  display: inline-block;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  margin-right: 4px;
`;

const SWinningBidCreator = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;

  margin-top: 32px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;

    flex-direction: row;
    justify-content: space-between;
  }
`;

const SWinningBidCreatorText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: pre;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SSpan = styled.span`
  a {
    cursor: pointer;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;

const SInlineSVG = styled(InlineSvg)`
  height: 16px;
  width: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: 24px;
    width: 24px;
  }
`;
