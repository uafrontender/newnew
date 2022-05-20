/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import Text from '../../atoms/Text';
// Icons
// import DownloadIcon from '../../../public/images/svg/icons/outlined/Upload.svg';
import Caption from '../../atoms/Caption';
import { useAppSelector } from '../../../redux-store/store';
import { formatNumber } from '../../../utils/format';

type ITransactionCard = {
  transaction: newnewapi.ITransaction;
};

const TransactionCard: React.FunctionComponent<ITransactionCard> = ({
  transaction,
}) => {
  const { t } = useTranslation('profile');
  const user = useAppSelector((state) => state.user);

  return (
    <STransactionCard>
      <SAvatar>
        <img alt={user.userData?.username} src={user.userData?.avatarUrl} />
      </SAvatar>
      <SActor variant={3} weight={600}>
        {t('Settings.sections.Transactions.you')}
      </SActor>
      {transaction.transactionType === 5 ? (
        <SAction variant={2}>
          {`${t(
            `Settings.sections.Transactions.actions.${transaction.transactionType}`
          )} `}
          <Link href={`/${transaction.relatedCreator?.nicknameOrUsername}`}>
            {`@${transaction.relatedCreator?.nicknameOrUsername}`}
          </Link>
        </SAction>
      ) : (
        <SAction variant={2}>
          {`${t(
            `Settings.sections.Transactions.actions.${transaction.transactionType}`
          )} `}
          <Link href={`/${transaction.relatedCreator?.nicknameOrUsername}`}>
            {`@${transaction.relatedCreator?.nicknameOrUsername}`}
          </Link>
          {`'s ${t(
            `Settings.sections.Transactions.type.${transaction.transactionType}`
          )}`}
        </SAction>
      )}
      {transaction?.amount?.usdCents && (
        <SAmount variant={3} weight={600} direction='from'>
          <span>- </span>
          {`$${formatNumber(transaction?.amount.usdCents / 100 ?? 0, true)}`}
        </SAmount>
      )}
      <SDate variant={2}>
        {moment((transaction.createdAt?.seconds as number) * 1000).format(
          'MMM DD YYYY'
        )}
      </SDate>
    </STransactionCard>
  );
};

export default TransactionCard;

const STransactionCard = styled.div`
  display: grid;
  grid-template-areas:
    'actor actor amount'
    'action action date';
  grid-template-columns: 4fr 4fr 2fr;
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
      'avatar actor actor date amount'
      'avatar action action date amount';
    grid-template-columns: 52px 2fr 2fr 2fr 2fr;
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
