/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import StatisticsIcon from '../../../public/images/svg/icons/outlined/Statistics.svg';
import StatisticsIconFilled from '../../../public/images/svg/icons/filled/Statistics.svg';
import InlineSvg from '../../atoms/InlineSVG';
import SearchDecisions from './SearchDecisions';
import SearchCreators from './SearchCreators';

export const SearchResults = () => {
  const router = useRouter();
  const { t } = useTranslation('search');
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<string>('decisionsTab');

  useEffect(() => {
    if (router && router.query.query)
      setSearchValue(router.query.query as string);
  }, [router]);

  const tabTypes = useMemo(
    () => [
      {
        id: 'decisionsTab',
        title: t('mainContent.tabs.decisions'),
      },
      {
        id: 'creatorsTab',
        title: t('mainContent.tabs.creators'),
      },
    ],
    [t]
  );

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((tab) => (
          <STab
            active={activeTab === tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <InlineSvg
              // @ts-ignore
              svg={tab.id === activeTab ? StatisticsIconFilled : StatisticsIcon}
              fill={
                tab.id === activeTab
                  ? theme.colorsThemed.text.primary
                  : theme.colorsThemed.text.secondary
              }
              width="24px"
              height="24px"
            />
            {tab.title}
          </STab>
        ))}
      </STabs>
    ),
    [
      activeTab,
      tabTypes,
      theme.colorsThemed.text.primary,
      theme.colorsThemed.text.secondary,
    ]
  );

  return (
    <SContainer>
      <SHeader>
        <SPageTitle>
          {t('mainContent.title')} <span>{searchValue}</span>
        </SPageTitle>
      </SHeader>
      <Tabs />
      {activeTab === 'decisionsTab' ? (
        <SearchDecisions query={searchValue} />
      ) : (
        <SearchCreators query={searchValue} />
      )}
    </SContainer>
  );
};

export default SearchResults;

const SContainer = styled.div`
  width: 100%;
  margin: 0 auto;

  ${(props) => props.theme.media.tablet} {
    max-width: 768px;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 1248px;
  }

  ${(props) => props.theme.media.laptopL} {
    max-width: 1248px;
  }
`;

const SHeader = styled.div`
  padding: 0 0 35px;
`;

const SPageTitle = styled.h1`
  font-weight: 700;
  font-size: 48px;
  line-height: 56px;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  margin: 0;
  span {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const STabs = styled.div`
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  display: flex;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
`;

interface ISTab {
  active: boolean;
}
const STab = styled.div<ISTab>`
  display: flex;
  width: 150px;
  padding: 15px;
  cursor: pointer;
  justify-content: center;
  position: relative;
  div {
    margin-right: 6px;
  }
  ${(props) => {
    if (props.active) {
      return css`
        color: ${props.theme.colorsThemed.text.primary};
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: ${props.theme.colorsThemed.text.primary};
          border-radius: 6px 6px 0 0;
        }
      `;
    }
    return css`
      color: ${props.theme.colorsThemed.text.secondary};
    `;
  }}
`;
