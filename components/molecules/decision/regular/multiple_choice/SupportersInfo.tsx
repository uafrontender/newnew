import React from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { formatNumber } from '../../../../../utils/format';
import OptionCardUsernameSpan from '../../common/OptionCardUsernameSpan';

// TODO: Just use option and useMemo instead of individual option fields
// TODO: Add logic that accepts option and returns users (me) to show  (not a component)
const SupportersInfo: React.FunctionComponent<{
  isBlue: boolean;
  isCreatorsBid: boolean;
  isSuggestedByMe: boolean;
  isSupportedByMe: boolean;
  supporterCount: number;
  supporterCountSubtracted: number;
  optionCreator?: newnewapi.IUser;
  firstVoter?: newnewapi.IUser;
  whiteListedSupporter?: newnewapi.IUser;
}> = ({
  isBlue,
  isCreatorsBid,
  isSupportedByMe,
  isSuggestedByMe,
  supporterCount,
  supporterCountSubtracted,
  optionCreator,
  firstVoter,
  whiteListedSupporter,
}) => {
  const { t } = useTranslation('page-Post');

  if (isCreatorsBid && !isSupportedByMe) {
    console.log('1');
    console.log(firstVoter);
    return (
      <>
        {supporterCount > 0 ? (
          <>
            <OptionCardUsernameSpan
              user={whiteListedSupporter ?? firstVoter}
              isBlue={isBlue}
            />
            <SSpanBiddersRegular className='spanRegular'>
              {supporterCountSubtracted > 0 ? ` & ` : ''}
            </SSpanBiddersRegular>
            {supporterCountSubtracted > 0 ? (
              <SSpanBiddersHighlighted className='spanHighlighted'>
                {formatNumber(supporterCountSubtracted, true)}{' '}
                {supporterCountSubtracted > 1
                  ? t('mcPost.optionsTab.optionCard.others')
                  : t('mcPost.optionsTab.optionCard.other')}
              </SSpanBiddersHighlighted>
            ) : null}
            <SSpanBiddersRegular className='spanRegular'>
              {' '}
              {t('mcPost.optionsTab.optionCard.voted')}
            </SSpanBiddersRegular>
          </>
        ) : null}
      </>
    );
  }

  if (isCreatorsBid && isSupportedByMe) {
    return (
      <>
        {supporterCount > 0 ? (
          <>
            <OptionCardUsernameSpan
              user={supporterCountSubtracted > 0 ? t('me') : t('I')}
              isBlue={isBlue}
            />
            <SSpanBiddersRegular className='spanRegular'>
              {supporterCountSubtracted > 0 ? ` & ` : ''}
            </SSpanBiddersRegular>
            {supporterCountSubtracted > 0 ? (
              <SSpanBiddersHighlighted className='spanHighlighted'>
                {formatNumber(supporterCountSubtracted, true)}{' '}
                {supporterCountSubtracted > 1
                  ? t('mcPost.optionsTab.optionCard.others')
                  : t('mcPost.optionsTab.optionCard.other')}
              </SSpanBiddersHighlighted>
            ) : null}
            <SSpanBiddersRegular className='spanRegular'>
              {' '}
              {t('mcPost.optionsTab.optionCard.voted')}
            </SSpanBiddersRegular>
          </>
        ) : null}
      </>
    );
  }

  if (!isCreatorsBid && !isSuggestedByMe && !isSupportedByMe) {
    return (
      <>
        <OptionCardUsernameSpan
          user={whiteListedSupporter ?? optionCreator}
          isBlue={isBlue}
        />
        <SSpanBiddersRegular className='spanRegular'>
          {supporterCountSubtracted > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubtracted > 0 ? (
          <>
            <SSpanBiddersHighlighted className='spanHighlighted'>
              {formatNumber(supporterCountSubtracted, true)}{' '}
              {supporterCountSubtracted > 1
                ? t('mcPost.optionsTab.optionCard.others')
                : t('mcPost.optionsTab.optionCard.other')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}
        <SSpanBiddersRegular className='spanRegular'>
          {' '}
          {t('mcPost.optionsTab.optionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  if (!isCreatorsBid && !isSuggestedByMe && isSupportedByMe) {
    return (
      <>
        <OptionCardUsernameSpan
          user={whiteListedSupporter ?? optionCreator}
          isBlue={isBlue}
        />
        {', '}
        <OptionCardUsernameSpan user={`${t('me')}`} isBlue={isBlue} />
        <SSpanBiddersRegular className='spanRegular'>
          {supporterCountSubtracted - 1 > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubtracted - 1 > 0 ? (
          <>
            <SSpanBiddersHighlighted className='spanHighlighted'>
              {formatNumber(supporterCountSubtracted - 1, true)}{' '}
              {supporterCountSubtracted - 1 > 1
                ? t('mcPost.optionsTab.optionCard.others')
                : t('mcPost.optionsTab.optionCard.other')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}
        <SSpanBiddersRegular className='spanRegular'>
          {' '}
          {t('mcPost.optionsTab.optionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  if (!isCreatorsBid && isSuggestedByMe) {
    return (
      <>
        <OptionCardUsernameSpan
          user={supporterCount > 1 ? t('me') : t('I')}
          isBlue={isBlue}
        />
        <SSpanBiddersRegular className='spanRegular'>
          {supporterCountSubtracted > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubtracted > 0 ? (
          <>
            <SSpanBiddersHighlighted className='spanHighlighted'>
              {formatNumber(supporterCountSubtracted, true)}{' '}
              {supporterCountSubtracted > 1
                ? t('mcPost.optionsTab.optionCard.others')
                : t('mcPost.optionsTab.optionCard.other')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}
        <SSpanBiddersRegular className='spanRegular'>
          {' '}
          {t('mcPost.optionsTab.optionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  return null;
};

export default SupportersInfo;

const SSpanBiddersHighlighted = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  a {
    color: inherit !important;
  }
`;

const SSpanBiddersRegular = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
