/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Sort from '../../../public/images/svg/icons/outlined/Sort.svg';
import Close from '../../../public/images/svg/icons/outlined/Close.svg';
import CheckBox from '../../molecules/CheckBox';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import List from '../creation/List';

export const SeachDecisions = () => {
  // const router = useRouter();
  const { t } = useTranslation('search');
  const theme = useTheme();
  const filterContainerRef: any = useRef();

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<newnewapi.IPost | undefined>();

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

  const [activeTab, setActiveTab] = useState<string>('decisionsTab');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isFilterOpened, setIsFilterOpened] = useState(false);

  useOnClickOutside(filterContainerRef, () => {
    if (isFilterOpened) {
      setIsFilterOpened(false);
    }
  });

  // useEffect(() => {
  //   if (inView && !isLoading) {
  //     if (pageToken) {
  //       loadPosts(pageToken);
  //     } else if (!triedLoading && !pageToken && posts?.length === 0) {
  //       loadPosts(undefined, true);
  //     }
  //   } else if (!triedLoading && posts?.length === 0) {
  //     loadPosts(undefined, true);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [inView, pageToken, isLoading, triedLoading, posts?.length]);

  const tabTypes = useMemo(
    () => [
      {
        id: 'eventsTab',
        title: t('decisions.postTypes.events'),
      },
      {
        id: 'superpollsTab',
        title: t('decisions.postTypes.superpolls'),
      },
      {
        id: 'goalsTab',
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

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((tab) => (
          <STab
            size="sm"
            view="secondary"
            active={activeTab === tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </STab>
        ))}
      </STabs>
    ),
    [activeTab, tabTypes]
  );

  const handleTypeChange = useCallback((e: React.MouseEvent, id: string | undefined) => {
    /* eslint-disable no-unused-expressions */
    id && setActiveFilter(id);
    setIsFilterOpened(false);
  }, []);

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  return (
    <div>
      <SToolBar>
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
      {/* <SCardsSection>
        {posts && (
          <List
            category=""
            loading={isLoading}
            collection={posts}
            wrapperStyle={{
              left: 0,
            }}
            handlePostClicked={handleOpenPostModal}
          />
        )}
      </SCardsSection> */}
      <div ref={loadingRef} />
    </div>
  );
};

export default SeachDecisions;

const SToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  text-align: center;
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

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }
`;
