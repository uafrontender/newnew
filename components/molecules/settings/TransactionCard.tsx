import React from 'react';
import Link from 'next/link';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { TUserData } from '../../../redux-store/slices/userStateSlice';

import Text from '../../atoms/Text';
import InlineSvg from '../../atoms/InlineSVG';
import { TTransactionsSectionItem } from '../../organisms/settings/TransactionsSection';

// Icons
import DownloadIcon from '../../../public/images/svg/icons/outlined/Upload.svg';
import Caption from '../../atoms/Caption';

type ITransactionCard = {
  cardInfo: TTransactionsSectionItem;
  currentUser: TUserData;
};

const TransactionCard: React.FunctionComponent<ITransactionCard> = ({
  cardInfo,
  currentUser,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('profile');

  return (
    <STransactionCard>
      <SInlineSvg
        svg={DownloadIcon}
        fill={theme.colorsThemed.text.tertiary}
        width='20px'
        height='20px'
      />
      <SAvatar>
        <img alt={cardInfo.actor.username} src={cardInfo.actor.avatarUrl} />
      </SAvatar>
      <SActor variant={3} weight={600}>
        {cardInfo.actor.username === currentUser.username
          ? t('Settings.sections.Transactions.you')
          : cardInfo.actor.username}
      </SActor>
      <SAction variant={2}>
        {cardInfo.action === 'topup' ? (
          t('Settings.sections.Transactions.actions.topup')
        ) : (
          <>
            <span>
              {t(`Settings.sections.Transactions.actions.${cardInfo.action}`)}{' '}
            </span>
            <Link href={`/${cardInfo.recipient.username}`}>
              <a href={`/${cardInfo.recipient.username}`}>
                {cardInfo.recipient.username}
                {"'s "}
              </a>
            </Link>
            <span>{t('Settings.sections.Transactions.actions.decision')}</span>
          </>
        )}
      </SAction>
      <SAmount variant={3} weight={600} direction={cardInfo.direction}>
        {cardInfo.direction === 'from' ? <span>- </span> : null}$
        {cardInfo.amount.toFixed(2)}
      </SAmount>
      <SDate variant={2}>
        {cardInfo.date.toLocaleDateString(router.locale).replaceAll('/', '.')}
      </SDate>
    </STransactionCard>
  );
};

export default TransactionCard;

const STransactionCard = styled.div`
  display: grid;
  grid-template-areas:
    'download actor actor amount'
    'download action action date';
  grid-template-columns: 36px 4fr 4fr 2fr;
  align-items: center;

  height: 38px;
  width: 100%;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'avatar actor actor date amount download'
      'avatar action action date amount download';
    grid-template-columns: 52px 2fr 2fr 2fr 1fr 1fr;
  }
`;

const SInlineSvg = styled(InlineSvg)`
  grid-area: download;
  justify-self: center;

  ${({ theme }) => theme.media.tablet} {
    justify-self: right;
  }
`;

const SAvatar = styled.div`
  display: none;
  position: relative;
  overflow: hidden;

  grid-area: avatar;
  justify-self: left;

  width: 36px;
  height: 36px;
  border-radius: 50%;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SActor = styled(Text)`
  grid-area: actor;
`;

const SAction = styled(Caption)`
  grid-area: action;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  a {
    color: ${({ theme }) => theme.colorsThemed.text.secondary};
  }
  a:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SAmount = styled(Text)<{
  direction: 'to' | 'from';
}>`
  grid-area: amount;

  text-align: right;

  ${({ direction }) =>
    direction === 'to'
      ? css`
          color: ${({ theme }) => theme.colorsThemed.accent.green};
        `
      : null}
`;

const SDate = styled(Caption)`
  grid-area: date;

  text-align: right;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
