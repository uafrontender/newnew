/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Trans, useTranslation } from 'next-i18next';

import InlineSvg from '../../../atoms/InlineSVG';

import StatisticsIconFilled from '../../../../public/images/svg/icons/filled/Statistics.svg';
import { formatNumber } from '../../../../utils/format';

interface IPostVotingTab {
  children: string;
  bundleVotes?: number;
}

const PostVotingTab: React.FunctionComponent<IPostVotingTab> = ({
  children,
  bundleVotes,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');

  return (
    <STabs>
      <STabsContainer>
        <STab>
          <InlineSvg
            svg={StatisticsIconFilled}
            fill={theme.colorsThemed.text.primary}
            width='24px'
            height='24px'
          />
          <div>{children}</div>
        </STab>
        {bundleVotes ? (
          <SBundleVotes>
            <Trans
              t={t}
              i18nKey='optionsTabLine.bundleVotes'
              // @ts-ignore
              components={[
                <VotesNumberSpan />,
                { amount: formatNumber(bundleVotes as number, true) },
              ]}
            />
          </SBundleVotes>
        ) : null}
      </STabsContainer>
    </STabs>
  );
};

export default PostVotingTab;

const STabs = styled.div`
  position: relative;
  /* overflow: hidden; */

  padding-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 16px;
  }
`;

const STabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 24px;

  width: 100%;
  overflow: hidden;
  position: relative;

  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const STab = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  position: relative;
  width: 50%;

  background: transparent;
  border: transparent;

  padding-bottom: 12px;

  white-space: nowrap;
  font-weight: 600;

  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 18px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 12px;
  }
`;

const SBundleVotes = styled.p`
  color: ${(props) =>
    props.theme.name === 'dark'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.text.tertiary};
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
`;

const VotesNumberSpan = styled.span`
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.accent.yellow};
`;
