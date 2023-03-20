import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import Button from '../../atoms/Button';

const SearchDecisions = dynamic(() => import('./SearchDecisions'));
const SearchCreators = dynamic(() => import('./SearchCreators'));

export const SearchResults = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Search');
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
            size='sm'
            view='secondary'
            active={activeTab === tab.id}
            key={tab.id}
            onClick={() => {
              const clearedQuery = encodeURIComponent(searchValue);
              router.push(`/search?query=${clearedQuery}&tab=${tab.id}`);
            }}
          >
            {tab.title}
          </STab>
        ))}
      </STabs>
    ),
    [activeTab, tabTypes, router, searchValue]
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
  padding: 0 0 24px;
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
  display: flex;
  margin-bottom: 32px;
`;

interface ISTab {
  active: boolean;
}

const STab = styled(Button)<ISTab>`
  min-width: 96px;
  padding: 8px;
  cursor: pointer;
  margin-right: 16px;
  border-radius: 12px !important;
  ${(props) => {
    if (props.active) {
      return css`
        color: ${props.theme.colorsThemed.background.tertiary} !important;
        background: ${props.theme.colorsThemed.text.primary} !important;
      `;
    }
    return css`
      color: ${props.theme.colorsThemed.text.primary};
      background: ${props.theme.colorsThemed.background.secondary};
    `;
  }}
`;
