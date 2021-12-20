import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'next-i18next';

interface IDecisionTabs {
  tabs: string[];
  activeTab: string;
  handleChangeTab: (val: string) => void;
}

const DecisionTabs: React.FunctionComponent<IDecisionTabs> = ({
  tabs,
  activeTab,
  handleChangeTab,
}) => {
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
    const activeTabIndex = tabs.findIndex((curr) => curr === activeTab);
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
            key={tab}
            ref={(el) => {
              tabRefs.current[i] = el!!;
            }}
            type="button"
            onClick={() => handleChangeTab(tab)}
            activeTab={tab === activeTab}
          >
            {t(`tabs.${tab}`)}
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

  ${({ theme }) => theme.media.laptop} {
    cursor: default;
  }
`;

const STabsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 24px;

  width: min-content;
  overflow: hidden;
  position: relative;
`;

interface ISTab {
  activeTab: boolean;
}

const STab = styled.button<ISTab>`
  position: relative;
  width: min-content;

  background: transparent;
  border: transparent;

  padding-bottom: 6px;

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
  background: ${({ theme }) => theme.gradients.blueHorizontal};

  transition: opacity .35s ease-in-out, left .25s linear, width .27s linear;
`;
