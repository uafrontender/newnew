/* eslint-disable no-unsafe-optional-chaining */
import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSvg from '../../atoms/InlineSVG';

import BackersIcon from '../../../public/images/svg/icons/filled/Backers.svg';
import CommentsIcon from '../../../public/images/svg/icons/outlined/Comments.svg';

type TDecisonTab = {
  label: string;
  value: string;
  amount?: string | undefined;
}

interface IDecisionTabs {
  tabs: TDecisonTab[];
  activeTab: string;
  handleChangeTab: (val: string) => void;
}

const DecisionTabs: React.FunctionComponent<IDecisionTabs> = ({
  tabs,
  activeTab,
  handleChangeTab,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const [activeTabIndicator, setActiveTabIndicator] = useState<{
    width: number;
    left: number;
  }>({
    width: 0,
    left: 0,
  });

  const tabsRef = useRef<HTMLDivElement>();
  const tabsContainerRef = useRef<HTMLDivElement>();
  const tabRefs = useRef<HTMLButtonElement[]>(new Array(tabs.length));

  useEffect(() => {
    const activeTabIndex = tabs.findIndex((curr) => curr.value === activeTab);
    if (activeTabIndex === -1) return;
    const boundingRect = tabRefs.current[activeTabIndex].getBoundingClientRect();

    setActiveTabIndicator((current) => ({
      ...current,
      width: boundingRect.width ?? 0,
      left: (boundingRect.left - tabsContainerRef.current?.getBoundingClientRect()?.left!!)
        ?? 0,
    }));
  }, [activeTab, tabs, setActiveTabIndicator]);

  return (
    <STabs
      ref={(el) => {
        tabsRef.current = el!!;
      }}
    >
      <STabsContainer
        ref={(el) => {
          tabsContainerRef.current = el!!;
        }}
      >
        {tabs && tabs.map((tab, i) => (
          <STab
            key={tab.value}
            ref={(el) => {
              tabRefs.current[i] = el!!;
            }}
            type="button"
            onClick={() => handleChangeTab(tab.value)}
            activeTab={tab.value === activeTab}
          >
            <InlineSvg
              svg={i === 0 ? BackersIcon : CommentsIcon}
              fill={tab.value === activeTab ? theme.colorsThemed.text.primary : theme.colorsThemed.text.secondary}
              width="24px"
              height="24px"
            />
            <div>
              {t(`tabs.${tab.label}`)}
              {tab.amount ? ` ${tab.amount}` : ''}
            </div>
          </STab>
        ))}
        <SActiveTabIndicator
          style={{
            width: activeTabIndicator.width,
            left: activeTabIndicator.left,
          }}
        />
      </STabsContainer>
    </STabs>
  );
};

export default DecisionTabs;

const STabs = styled.div`
  position: relative;
  overflow: hidden;

  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-right: 16px;
  }
`;

const STabsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 24px;

  z-index: 2;

  width: 100%;
  overflow: hidden;
  position: relative;
`;

interface ISTab {
  activeTab: boolean;
}

const STab = styled.button<ISTab>`
  display: flex;
  align-items: center;
  justify-content: center;
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

  color: ${({
    activeTab,
    theme,
  }) => (activeTab ? theme.colorsThemed.text.primary : theme.colorsThemed.text.secondary)};

  cursor: pointer;
  transition: .2s ease-in-out;

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

const IndicatorInitialAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const SActiveTabIndicator = styled.div`
  position: absolute;
  bottom: 0;

  height: 4px;
  width: 0px;

  opacity: 0;

  animation-duration: 1s;
  animation-delay: .3s;
  animation-fill-mode: forwards;
  animation-name: ${IndicatorInitialAnimation};

  border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colorsThemed.text.primary};

  transition: opacity .35s ease-in-out, left .25s linear, width .27s linear;
`;
