import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';

import isBrowser from '../../utils/isBrowser';

interface ITabs {
  t: any;
  tabs: Tab[];
  draggable?: boolean;
  activeTabIndex: number;
  withTabIndicator?: boolean;
}

export interface Tab {
  url: string;
  nameToken: string;
}

const Tabs: React.FunctionComponent<ITabs> = (props) => {
  const {
    t,
    tabs,
    draggable,
    activeTabIndex,
    withTabIndicator,
  } = props;
  const router = useRouter();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth ?? 0,
    height: window.innerHeight ?? 0,
  });

  const [containerWidth, setContainerWidth] = useState<number>(
    isBrowser() ? window.innerWidth : 768,
  );
  const [tabsWidth, setTabsWidth] = useState<number>(
    tabs.length * 100,
  );

  const shouldDrag = (draggable ?? true) && tabsWidth!! >= containerWidth!!;

  const [isDragging, setIsDragging] = useState(false);
  const [posLeft, setPosLeft] = useState<number>(0);
  const [prevLeft, setPrevLeft] = useState<number>(0);

  const [wasDragged, setWasDragged] = useState(false);
  const [mouseInitial, setMouseInitial] = useState<number>();

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

  // Route change
  const handleChangeRoute = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  // Scrolling the tabs with mouse & touch
  const extractPositionDelta = (e: any) => {
    const left = e.clientX;

    const delta = {
      left: left - prevLeft,
    };

    setPrevLeft(left);

    return delta;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!shouldDrag) return;

    setIsDragging(true);
    extractPositionDelta(e);

    const { left } = extractPositionDelta(e.touches[0]);

    if (posLeft + left <= 0) {
      setPosLeft(posLeft + left);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!shouldDrag) return;

    if (!isDragging) {
      return;
    }
    const { left } = extractPositionDelta(e.touches[0]);

    const newLeft = posLeft + left;

    // Too far to the right
    if (newLeft <= 0 && newLeft + tabsWidth!! < containerWidth) return;

    // Too far to the left
    if (newLeft >= 0 && containerWidth - newLeft < tabsWidth!!) return;

    setPosLeft(newLeft);
  };

  const handleTouchEnd = () => {
    if (!shouldDrag) return;

    setIsDragging(false);

    if (posLeft <= 0 && posLeft + tabsWidth!! < containerWidth) {
      const position = -1 * (tabsWidth!!) + containerWidth;
      setPosLeft(position);
      setPrevLeft(position);
    } else if (posLeft >= 0 && containerWidth - posLeft < tabsWidth!!) {
      const position = 0;
      setPosLeft(position);
      setPrevLeft(position);
    } else {
      setPosLeft(posLeft);
      setPrevLeft(posLeft);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldDrag) return;

    setIsDragging(true);
    extractPositionDelta(e);

    const { left } = extractPositionDelta(e);

    if (posLeft + left <= 0) {
      setPosLeft(posLeft + left);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldDrag) return;

    if (!isDragging) {
      return;
    }

    if (mouseInitial && e.clientX !== mouseInitial) {
      setWasDragged(true);
    }

    const { left } = extractPositionDelta(e);

    const newLeft = posLeft + left;

    // Too far to the right
    if (newLeft <= 0 && newLeft + tabsWidth!! < containerWidth) return;

    // Too far to the left
    if (newLeft >= 0 && containerWidth - newLeft < tabsWidth!!) return;

    setPosLeft(newLeft);
  };

  const handleMouseUp = () => {
    if (!shouldDrag) return;

    setIsDragging(false);

    if (posLeft <= 0 && posLeft + tabsWidth!! < containerWidth) {
      const position = -1 * (tabsWidth!!) + containerWidth;
      setPosLeft(position);
      setPrevLeft(position);
    } else if (posLeft >= 0 && containerWidth - posLeft < tabsWidth!!) {
      const position = 0;
      setPosLeft(position);
      setPrevLeft(position);
    } else {
      setPosLeft(posLeft);
      setPrevLeft(posLeft);
    }
  };

  // Button-specific handlers to prevent unwanted cliks on Mouse event
  const handleButtonMouseDownCapture = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!shouldDrag) return;
    setMouseInitial(e.clientX);
  };

  const handleButtonMouseLeave = () => {
    if (wasDragged) {
      setWasDragged(false);
      setMouseInitial(undefined);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, tab: Tab) => {
    if (wasDragged) {
      e.preventDefault();
      setWasDragged(false);
      setMouseInitial(undefined);
      return;
    }
    setMouseInitial(undefined);
    handleChangeRoute(tab.url);
  };

  useEffect(() => {
    const tabsWidthUpdated = tabRefs.current
      .reduce((acc, tabEl) => {
        const w = tabEl.getBoundingClientRect().width;
        return w + acc;
      }, 0);

    setTabsWidth(tabsWidthUpdated + (tabs.length + 1) * 24);
  }, [tabs.length]);

  useEffect(() => {
    let timeout: any;

    const updateContainerWidth = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setContainerWidth(tabsRef.current?.getBoundingClientRect().width!!);
        setWindowSize({
          width: window.innerWidth ?? 0,
          height: window.innerHeight ?? 0,
        });
      }, 1500);
    };

    window.addEventListener('resize', updateContainerWidth);

    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  useEffect(() => {
    if (activeTabIndex === -1) return;
    const boundingRect = tabRefs.current[activeTabIndex].getBoundingClientRect();

    if (boundingRect.left < 0) {
      setPosLeft((curr) => curr + (0 - boundingRect.left) + 12);
      setPrevLeft((curr) => curr + (0 - boundingRect.left) + 12);
    } else if (boundingRect.right > windowSize.width) {
      setPosLeft((curr) => curr + windowSize.width - boundingRect.right - 12);
      setPrevLeft((curr) => curr + windowSize.width - boundingRect.right - 12);
    }

    setActiveTabIndicator((current) => ({
      ...current,
      width: boundingRect.width ?? 0,
      left: (boundingRect.left - (tabsContainerRef.current?.getBoundingClientRect()?.left || 0)!!)
        ?? 0,
    }));
  }, [activeTabIndex, windowSize, setPrevLeft, setPosLeft, setActiveTabIndicator]);

  useEffect(() => {
    if (!shouldDrag) setPosLeft(0);
  }, [shouldDrag]);

  return (
    <STabs
      ref={(el) => {
        tabsRef.current = el!!;
      }}
      style={{
        cursor: shouldDrag ? 'grab' : 'default',
      }}
      draggable={false}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <STabsContainer
        ref={(el) => {
          tabsContainerRef.current = el!!;
        }}
        style={{
          transform: `translateX(${posLeft}px`,
        }}
        draggable={false}
        shouldDrag={shouldDrag}
      >
        {tabs && tabs.map((tab, i) => (
          <STab
            key={tab.nameToken}
            ref={(el) => {
              tabRefs.current[i] = el!!;
            }}
            type="button"
            onClick={(e) => handleButtonClick(e, tab)}
            activeTab={i === activeTabIndex}
            extraMargin={i === 0 && shouldDrag}
            onMouseLeave={handleButtonMouseLeave}
            withTabIndicator={withTabIndicator}
            onMouseDownCapture={(e) => handleButtonMouseDownCapture(e)}
          >
            {t(`tabs.${tab.nameToken}`)}
          </STab>
        ))}
        {withTabIndicator && (
          <SActiveTabIndicator
            style={{
              width: activeTabIndicator.width,
              left: activeTabIndicator.left,
            }}
          />
        )}
      </STabsContainer>
    </STabs>
  );
};

export default Tabs;

Tabs.defaultProps = {
  draggable: true,
  withTabIndicator: true,
};

const STabs = styled.div`
  position: relative;
  overflow: hidden;

  ${({ theme }) => theme.media.laptop} {
    cursor: default;
  }
`;

const STabsContainer = styled.div<{
  shouldDrag: boolean;
}>`
  display: flex;
  justify-content: ${({ shouldDrag }) => (shouldDrag ? 'flex-start' : 'center')};
  gap: 24px;

  width: ${({ shouldDrag }) => (shouldDrag ? 'min-content' : '100%')};
  overflow: hidden;
  position: relative;
`;

interface ISTab {
  activeTab: boolean;
  extraMargin: boolean;
  withTabIndicator?: boolean;
}

const STab = styled.button<ISTab>`
  position: relative;
  width: min-content;

  background: transparent;
  border: transparent;

  padding-bottom: ${({ withTabIndicator }) => (withTabIndicator ? '6px' : '0')};

  margin-left: ${({ extraMargin }) => (extraMargin ? '24px' : 'initial')};

  white-space: nowrap;
  font-weight: 600;

  font-size: 14px;
  line-height: 24px;
  
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
