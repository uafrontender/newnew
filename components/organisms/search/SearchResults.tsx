/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import StatisticsIcon from '../../../public/images/svg/icons/outlined/Statistics.svg';
import StatisticsIconFilled from '../../../public/images/svg/icons/filled/Statistics.svg';
import InlineSvg from '../../atoms/InlineSVG';

const SearchDecisions = dynamic(() => import('./SearchDecisions'));
const SearchCreators = dynamic(() => import('./SearchCreators'));

export const SearchResults = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Search');
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState(router.query.query as string);
  const [activeTab, setActiveTab] = useState<string>(
    (router.query.tab as string) || 'posts'
  );

  useEffect(() => {
    if (router) {
      if (router.query.query) setSearchValue(router.query.query as string);
      if (router.query.tab) {
        if (router.query.tab === 'creators') {
          setActiveTab('creators');
        } else {
          setActiveTab('posts');
        }
      }
    }
  }, [router]);

  const tabTypes = useMemo(
    () => [
      {
        id: 'posts',
        title: t('mainContent.tabs.hashtags'),
      },
      {
        id: 'creators',
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
            onClick={() => {
              const clearedQuery = encodeURIComponent(searchValue);
              router.push(`/search?query=${clearedQuery}&tab=${tab.id}`);
            }}
          >
            <InlineSvg
              svg={tab.id === activeTab ? StatisticsIconFilled : StatisticsIcon}
              fill={
                tab.id === activeTab
                  ? theme.colorsThemed.text.primary
                  : theme.colorsThemed.text.secondary
              }
              width='24px'
              height='24px'
            />
            {tab.title}
          </STab>
        ))}
      </STabs>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {activeTab === 'posts' ? (
            <>
              {t('mainContent.title')} <SHashtag>#{searchValue}</SHashtag>
            </>
          ) : (
            <>
              {t('mainContent.title')} <Query>{searchValue}</Query>
            </>
          )}
        </SPageTitle>
      </SHeader>
      <Tabs />
      {activeTab === 'posts' ? (
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
`;

const SHashtag = styled.span`
  display: inline;
  word-spacing: normal;
  overflow-wrap: break-word;
  color: ${(props) => props.theme.colorsThemed.accent.blue};
`;

const Query = styled.span`
  overflow-wrap: break-word;
  color: ${(props) => props.theme.colorsThemed.text.primary};
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
