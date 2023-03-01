import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/dist/client/router';

import { TPostType } from '../../../../utils/switchPostType';

interface IPostTimerEnded {
  timestampSeconds: number;
  postType: TPostType;
}

const PostTimerEnded: React.FunctionComponent<IPostTimerEnded> = ({
  timestampSeconds,
  postType,
}) => {
  const { t } = useTranslation('page-Post');
  const { locale } = useRouter();

  return (
    <SWrapper>
      <STimerItemEnded>
        {t(`postType.${postType}`)} {t('expires.ended_on')}{' '}
        {moment(timestampSeconds)
          .locale(locale || 'en-US')
          .format('DD MMM YYYY [at] hh:mm A')}
      </STimerItemEnded>
    </SWrapper>
  );
};

export default PostTimerEnded;

PostTimerEnded.defaultProps = {};

const SWrapper = styled.div`
  grid-area: timer;
  width: fit-content;
  justify-self: center;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 8px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  position: relative;
  top: -4px;

  ${({ theme }) => theme.media.tablet} {
    position: initial;
    top: initial;
  }
`;

const STimerItemEnded = styled.div`
  padding: 10px 14px;
  width: 100%;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  position: relative;
`;
