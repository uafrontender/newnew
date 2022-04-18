/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-expressions */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Sort from '../../../public/images/svg/icons/outlined/Sort.svg';
import Close from '../../../public/images/svg/icons/outlined/Close.svg';
import CheckBox from '../../molecules/CheckBox';
import List from './List';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { searchPosts } from '../../../api/endpoints/search';
import NoResults from '../../atoms/search/NoResults';
import isBrowser from '../../../utils/isBrowser';
import PostModal from '../decision/PostModal';
import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

interface IFunction {
  query: string;
}

export const SearchDecisions: React.FC<IFunction> = ({ query }) => {
  const { t } = useTranslation('search');
  const theme = useTheme();
  const filterContainerRef: any = useRef();

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] =
    useState<newnewapi.IPost | undefined>();

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [postSorting, setPostSorting] = useState<newnewapi.PostSorting>(
    newnewapi.PostSorting.MOST_FUNDED_FIRST
  );
  const [isFilterOpened, setIsFilterOpened] = useState(false);

  const [hasNoResults, setHasNoResults] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [resultsPosts, setResultsPosts] = useState<newnewapi.IPost[]>([]);
  const [postsNextPageToken, setPostsRoomsNextPageToken] =
    useState<string | undefined | null>('');

  useOnClickOutside(filterContainerRef, () => {
    if (isFilterOpened) {
      setIsFilterOpened(false);
    }
  });

  const getSearchResult = useCallback(
    async (pageToken?: string) => {
      if (loadingPosts) return;
      try {
        setLoadingPosts(true);
        const payload = new newnewapi.SearchPostsRequest({
          query,
          paging: {
            limit: 10,
            pageToken,
          },
          sorting: postSorting,
        });
        const res = await searchPosts(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (!initialLoad) setInitialLoad(true);

        if (res.data.posts && res.data.posts.length > 0) {
          if (hasNoResults) setHasNoResults(false);
          setResultsPosts((curr) => {
            const arr = [...curr, ...(res.data?.posts as newnewapi.IPost[])];
            return arr;
          });
          setPostsRoomsNextPageToken(res.data.paging?.nextPageToken);
        } else {
          setHasNoResults(true);
        }

        if (!res.data.paging?.nextPageToken && postsNextPageToken)
          setPostsRoomsNextPageToken(null);
        setLoadingPosts(false);
      } catch (err) {
        setLoadingPosts(false);
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingPosts, postSorting, query]
  );

  useEffect(() => {
    if (query.length > 0) {
      setResultsPosts([]);
      getSearchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (initialLoad) {
      switch (activeFilter) {
        case 'numberOfParticipants':
          setPostSorting(newnewapi.PostSorting.MOST_VOTED_FIRST);
          break;
        case 'mostFunded':
          setPostSorting(newnewapi.PostSorting.MOST_FUNDED_FIRST);
          break;
        case 'newest':
          setPostSorting(newnewapi.PostSorting.NEWEST_FIRST);
          break;
        default:
          setPostSorting(newnewapi.PostSorting.MOST_FUNDED_FIRST);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  useEffect(() => {
    if (initialLoad) {
      setResultsPosts([]);
      setPostsRoomsNextPageToken(null);
      getSearchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSorting]);

  useEffect(() => {
    if (inView && !loadingPosts && postsNextPageToken) {
      getSearchResult(postsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loadingPosts, postsNextPageToken]);

  const tabTypes = useMemo(
    () => [
      {
        id: 'auction',
        title: t('decisions.postTypes.events'),
      },
      {
        id: 'multipleChoice',
        title: t('decisions.postTypes.superpolls'),
      },
      {
        id: 'crowdfunding',
        title: t('decisions.postTypes.goals'),
      },
    ],
    [t]
  );

  const filterTypes = useMemo(
    () => [
      {
        id: 'all',
        title: t('decisions.sort.all'),
      },
      {
        id: 'numberOfParticipants',
        title: t('decisions.sort.numberOfParticipants'),
      },
      {
        id: 'mostFunded',
        title: t('decisions.sort.mostFunded'),
      },
      {
        id: 'newest',
        title: t('decisions.sort.newest'),
      },
    ],
    [t]
  );

  const updateActiveTabs = useCallback((id: string) => {
    setActiveTabs((curr) => {
      const arr = [...curr];
      const index = arr.findIndex((item) => item === id);
      index < 0 ? arr.push(id) : arr.splice(index, 1);
      return arr;
    });
  }, []);

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((tab) => (
          <STab
            size="sm"
            view="secondary"
            active={activeTabs.findIndex((item) => item === tab.id) > -1}
            key={tab.id}
            onClick={() => updateActiveTabs(tab.id)}
          >
            {tab.title}
          </STab>
        ))}
      </STabs>
    ),
    [activeTabs, tabTypes, updateActiveTabs]
  );

  const handleTypeChange = useCallback(
    (e: React.MouseEvent, id: string | undefined) => {
      /* eslint-disable no-unused-expressions */
      id && setActiveFilter(id);
      setIsFilterOpened(false);
    },
    []
  );

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setPostModalOpen(true);
  };
  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  const handleSetDisplayedPost = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
  };

  return (
    <div>
      {resultsPosts.length > 1 && (
        <SToolBar disabled={hasNoResults}>
          <Tabs />
          <SSort>
            <SSortButton
              size="sm"
              view="secondary"
              onClick={() => {
                setIsFilterOpened(true);
              }}
            >
              {t('decisions.sort.title')}
              <InlineSvg
                // @ts-ignore
                svg={isFilterOpened === true ? Close : Sort}
                fill={theme.colorsThemed.text.secondary}
                width="24px"
                height="24px"
              />
            </SSortButton>
            {isFilterOpened && (
              <SCheckBoxList ref={filterContainerRef}>
                {filterTypes.map((item) => (
                  <SCheckBoxWrapper key={item.id}>
                    <CheckBox
                      id={item.id}
                      label={item.title}
                      selected={activeFilter === item.id}
                      handleChange={handleTypeChange}
                    />
                  </SCheckBoxWrapper>
                ))}
              </SCheckBoxList>
            )}
          </SSort>
        </SToolBar>
      )}

      {!hasNoResults ? (
        <>
          <SCardsSection>
            {initialLoad && (
              <List
                categories={activeTabs}
                loading={loadingPosts}
                collection={resultsPosts}
                handlePostClicked={handleOpenPostModal}
              />
            )}
          </SCardsSection>
          {postsNextPageToken && !loadingPosts && (
            <SRef ref={loadingRef}>Loading...</SRef>
          )}
          {displayedPost && (
            <PostModal
              isOpen={postModalOpen}
              post={displayedPost}
              manualCurrLocation={isBrowser() ? window.location.pathname : ''}
              handleClose={() => handleClosePostModal()}
              handleOpenAnotherPost={handleSetDisplayedPost}
            />
          )}
        </>
      ) : (
        <SNoResults>
          {initialLoad ? (
            <NoResults />
          ) : (
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          )}
        </SNoResults>
      )}
    </div>
  );
};

export default SearchDecisions;

interface ISToolBar {
  disabled: boolean;
}

const SToolBar = styled.div<ISToolBar>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  text-align: center;
  position: relative;
  ${(props) => {
    if (props.disabled) {
      return css`
        opacity: 0.1;
        &:after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
        }
      `;
    }
    return css``;
  }}
`;

const SSort = styled.div`
  position: relative;
`;

const STabs = styled.div`
  display: flex;
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

const SSortButton = styled(Button)`
  border-radius: 12px !important;
  padding: 8px 16px;
  span {
    display: flex;
    div {
      margin-left: 12px;
    }
  }
`;

const SCheckBoxList = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 50px;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
  padding: 18px;
  width: 230px;
  z-index: 100;
  text-align: left;
`;

const SCheckBoxWrapper = styled.div`
  margin-bottom: 22px;
  font-size: 14px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SNoResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
`;
