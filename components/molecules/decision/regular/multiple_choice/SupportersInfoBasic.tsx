import React, { useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'react-i18next';

import OptionCardUsernameSpan from '../../common/OptionCardUsernameSpan';
import { formatNumber } from '../../../../../utils/format';
import { SSpanBiddersHighlighted, SSpanBiddersRegular } from './common';
import getDeletedUserPlaceholder from '../../../../../utils/getDeletedUserPlaceholder';

const SupportersInfoBasic: React.FC<{
  isBlue: boolean;
  supporterCount: number;
  firstVoter?: newnewapi.IUser;
  whiteListedSupporter?: newnewapi.IUser;
}> = ({ isBlue, supporterCount, firstVoter, whiteListedSupporter }) => {
  const { t } = useTranslation('page-Post');
  const supporterCountSubtracted = useMemo(() => {
    if (supporterCount > 0) {
      return supporterCount - 1;
    }
    return supporterCount;
  }, [supporterCount]);

  return (
    <>
      <OptionCardUsernameSpan
        user={whiteListedSupporter ?? firstVoter ?? getDeletedUserPlaceholder()}
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
};

export default SupportersInfoBasic;
