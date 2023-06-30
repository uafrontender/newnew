import React from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';

import Headline from '../Headline';
import Text from '../Text';
import GenericSkeleton from '../../molecules/GenericSkeleton';

import { useUserData } from '../../../contexts/userDataContext';
import { TPostType } from '../../../utils/switchPostType';
import { formatNumber } from '../../../utils/format';
import DisplayName from '../DisplayName';

interface IWinningOption {
  postType: TPostType;
  winningOptionAc?: newnewapi.Auction.Option;
  winningOptionMc?: newnewapi.MultipleChoice.Option;
}

const WinningOption: React.FunctionComponent<IWinningOption> = ({
  postType,
  winningOptionAc,
  winningOptionMc,
}) => {
  const { t } = useTranslation('page-Post');
  const { userData } = useUserData();
  const theme = useTheme();

  if (postType === 'ac' && winningOptionAc) {
    return (
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
          {winningOptionAc?.creator ? (
            <>
              {winningOptionAc.creator.options?.isVerified ? (
                <Link href={`/${winningOptionAc.creator?.username}`}>
                  <SUserAvatar
                    draggable={false}
                    src={winningOptionAc?.creator?.avatarUrl!!}
                  />
                </Link>
              ) : (
                <SUserAvatar
                  draggable={false}
                  src={winningOptionAc?.creator?.avatarUrl!!}
                />
              )}
              <SSpan>
                <Trans
                  i18nKey='postResponseTabModeration.winner.ac.optionCreator'
                  t={t}
                  components={[
                    <SDisplayName
                      user={winningOptionAc.creator}
                      suffix={t('postResponseTabModeration.winner.ac.suffix')}
                      href={
                        winningOptionAc.creator.options?.isVerified
                          ? `/${winningOptionAc.creator?.username}`
                          : undefined
                      }
                    />,
                  ]}
                />
              </SSpan>
            </>
          ) : null}
        </SText>
        <SHeadline variant={5}>{winningOptionAc.title}</SHeadline>
      </>
    );
  }

  if (postType === 'mc' && winningOptionMc) {
    return (
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
          winningOptionMc?.creator?.uuid !== userData?.userUuid ? (
            <>
              {winningOptionMc.creator.options?.isVerified ? (
                <Link href={`/${winningOptionMc.creator?.username}`}>
                  <SUserAvatar
                    draggable={false}
                    src={winningOptionMc?.creator?.avatarUrl!!}
                  />
                </Link>
              ) : (
                <SUserAvatar
                  draggable={false}
                  src={winningOptionMc?.creator?.avatarUrl!!}
                />
              )}
              <SSpan>
                <Trans
                  i18nKey='postResponseTabModeration.winner.mc.optionCreator'
                  t={t}
                  components={[
                    <SDisplayName
                      user={winningOptionMc.creator}
                      suffix={t('postResponseTabModeration.winner.ac.suffix')}
                      href={
                        winningOptionMc.creator.options?.isVerified
                          ? `/${winningOptionMc.creator?.username}`
                          : undefined
                      }
                    />,
                  ]}
                />
              </SSpan>
            </>
          ) : (
            <SSpan>{t('postResponseTabModeration.winner.mc.optionOwn')}</SSpan>
          )}
        </SText>
        <SHeadline variant={5}>{winningOptionMc.text}</SHeadline>
      </>
    );
  }

  return (
    <SSkeletonContainer>
      <SGenericSkeletonTop
        bgColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.quaternary}
      />
      <SGenericSkeletonBottom
        bgColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.quaternary}
      />
    </SSkeletonContainer>
  );
};

export default WinningOption;

const SText = styled(Text)`
  margin-top: 24px;
  max-width: 100%;

  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:first-child {
    margin-top: 0;
  }

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }
`;

const SSpan = styled.span`
  display: inline-flex;
  white-space: pre;
  max-width: 100%;
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

const SDisplayName = styled(DisplayName)<{ href?: string }>`
  cursor: ${({ href }) => (href ? 'pointer' : undefined)};

  &:hover {
    color: ${({ theme, href }) =>
      href ? theme.colorsThemed.text.primary : undefined};
  }
`;

const SHeadline = styled(Headline)`
  white-space: pre-wrap;
  word-break: break-word;
`;

const SSkeletonContainer = styled.div`
  margin-top: 24px;

  &:first-child {
    margin-top: 0;
  }
`;

const SGenericSkeleton = styled(GenericSkeleton)`
  width: 250px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const SGenericSkeletonTop = styled(SGenericSkeleton)`
  height: 20px;
  margin-bottom: 5px;

  ${({ theme }) => theme.media.tablet} {
    height: 24px;
  }
`;

const SGenericSkeletonBottom = styled(SGenericSkeleton)`
  height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 24px;
    height: 30px;
  }
`;
