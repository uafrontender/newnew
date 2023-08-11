import React, { useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '../../../../../utils/format';
import OptionCardUsernameSpan from '../../common/OptionCardUsernameSpan';
import { SSpanBiddersHighlighted, SSpanBiddersRegular } from './common';
import SupportersInfoBasic from './SupportersInfoBasic';
import { useAppState } from '../../../../../contexts/appStateContext';

// TODO: Just use option and useMemo instead of individual option fields
// TODO: Add logic that accepts option and returns users (me) to show  (not a component)
const SupportersInfo: React.FunctionComponent<{
  isBlue: boolean;
  isCreatorsBid: boolean;
  isSuggestedByMe: boolean;
  isSupportedByMe: boolean;
  supporterCount: number;
  optionCreator?: newnewapi.IUser;
  firstVoter?: newnewapi.IUser;
  whiteListedSupporter?: newnewapi.IUser;
}> = ({
  isBlue,
  isCreatorsBid,
  isSupportedByMe,
  isSuggestedByMe,
  supporterCount,
  optionCreator,
  firstVoter,
  whiteListedSupporter,
}) => {
  const { t } = useTranslation('page-Post');
  const { userUuid } = useAppState();

  const supporterCountSubtracted = useMemo(() => {
    if (supporterCount > 0) {
      return supporterCount - 1;
    }
    return supporterCount;
  }, [supporterCount]);

  const userToShowForCustomOption = useMemo(() => {
    if (whiteListedSupporter) {
      return whiteListedSupporter;
    }

    if (optionCreator?.options?.isTombstone && firstVoter) {
      return firstVoter;
    }

    return optionCreator;
  }, [whiteListedSupporter, optionCreator, firstVoter]);

  if (isCreatorsBid) {
    // TODO: Why do we check it?
    if (supporterCount < 1) {
      return null;
    }

    if (isSupportedByMe) {
      return (
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
      );
    }

    return (
      <SupportersInfoBasic
        isBlue={isBlue}
        supporterCount={supporterCount}
        firstVoter={firstVoter}
        whiteListedSupporter={whiteListedSupporter}
      />
    );
  }

  if (isSuggestedByMe || userToShowForCustomOption?.uuid === userUuid) {
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

  if (isSupportedByMe) {
    return (
      <>
        <OptionCardUsernameSpan
          user={userToShowForCustomOption}
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

  return (
    <>
      <OptionCardUsernameSpan
        user={userToShowForCustomOption}
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
};

export default SupportersInfo;
