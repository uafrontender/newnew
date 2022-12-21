import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';

import Headline from '../Headline';
import Text from '../Text';
import InlineSvg from '../InlineSVG';
// import GenericSkeleton from '../../molecules/GenericSkeleton';

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
              // Can it be reworked wso it uses t inside the Link element (without Trans element)?
              // @ts-ignore
              components={[
                <SCreatorLink href={`/${winningOptionAc.creator?.username}`} />,
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
        {postType === 'mc' && winningOptionMc && (
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
                    {/* Can it be reworked wso it uses t inside the Link element (without Trans element)? */}
                    <Trans
                      i18nKey='postResponseTabModeration.winner.mc.optionCreator'
                      t={t}
                      // @ts-ignore
                      components={[
                        <SCreatorLink
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
                <SSpan>
                  {t('postResponseTabModeration.winner.mc.optionOwn')}
                </SSpan>
              )}
            </SText>
            <SHeadline variant={5}>{winningOptionMc.text}</SHeadline>
          </>
        )}
      </>
    );
  }

  return null;
};

export default WinningOption;

const SCreatorLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SInlineSvg = styled(InlineSvg)`
  flex-shrink: 0;
`;

const SText = styled(Text)`
  margin-top: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpan = styled.span`
  display: inline-flex;
  white-space: pre;
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

// const SSkeletonContainer = styled.div`
//   display: flex;
//   align-items: center;
// `;

// const SGenericSkeleton = styled(GenericSkeleton)`
//   height: 50px;
//   width: 30px;
//   margin-right: 2px;
//   border-radius: ${({ theme }) => theme.borderRadius.smallLg};
// `;
