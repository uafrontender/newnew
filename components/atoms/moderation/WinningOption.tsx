/* eslint-disable react/destructuring-assignment */
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import Link, { LinkProps } from 'next/link';

import Headline from '../Headline';
import Text from '../Text';
import InlineSvg from '../InlineSVG';
import GenericSkeleton from '../../molecules/GenericSkeleton';

import { useAppSelector } from '../../../redux-store/store';
import { TPostType } from '../../../utils/switchPostType';
import { formatNumber } from '../../../utils/format';
import getDisplayname from '../../../utils/getDisplayname';

import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';

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
  const user = useAppSelector((state) => state.user);
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
          <SUserAvatar
            draggable={false}
            src={winningOptionAc?.creator?.avatarUrl!!}
          />
          <SSpan>
            <Trans
              i18nKey='postResponseTabModeration.winner.ac.optionCreator'
              t={t}
              // @ts-ignore
              components={[
                <CreatorLink href={`/${winningOptionAc.creator?.username}`} />,
                winningOptionAc.creator?.options?.isVerified ? (
                  <SInlineSvg
                    svg={VerificationCheckmark}
                    width='22px'
                    height='22px'
                    fill='none'
                  />
                ) : null,
                { nickname: getDisplayname(winningOptionAc.creator!!) },
              ]}
            />
          </SSpan>
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
          winningOptionMc?.creator?.uuid !== user.userData?.userUuid ? (
            <>
              <SUserAvatar
                draggable={false}
                src={winningOptionMc?.creator?.avatarUrl!!}
              />
              <SSpan>
                <Trans
                  i18nKey='postResponseTabModeration.winner.mc.optionCreator'
                  t={t}
                  // @ts-ignore
                  components={[
                    <CreatorLink
                      href={`/${winningOptionMc.creator?.username}`}
                    />,
                    winningOptionMc.creator?.options?.isVerified ? (
                      <SInlineSvg
                        svg={VerificationCheckmark}
                        width='22px'
                        height='22px'
                        fill='none'
                      />
                    ) : null,
                    {
                      nickname: getDisplayname(winningOptionMc.creator!!),
                    },
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

const SCreatorLink = styled(Link)``;

type TCreatorLink<T> = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.PropsWithChildren<T>;

const CreatorLink = ({
  href,
  children,
  ...restProps
}: TCreatorLink<LinkProps>) => (
  <SCreatorLink href={href || ''}>
    <a {...restProps} className='creatorLinkAnchor'>
      {children}
    </a>
  </SCreatorLink>
);

const SInlineSvg = styled(InlineSvg)`
  flex-shrink: 0;
`;

const SText = styled(Text)`
  margin-top: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:first-child {
    margin-top: 0;
  }
`;

const SSpan = styled.span`
  display: inline-flex;
  white-space: pre;

  .creatorLinkAnchor {
    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover {
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
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
