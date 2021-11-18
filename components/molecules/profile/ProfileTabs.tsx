import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import isBrowser from '../../../utils/isBrowser';

interface IProfileTabs {
  tabs: Tab[];
  pageType: 'myProfile' | 'othersProfile';
}

export interface Tab {
  url: string;
  nameToken: string;
}

const findActiveTab = (tabs: Tab[], currentPathname: string, pageType: 'myProfile' | 'othersProfile') => {
  if (pageType === 'myProfile') {
    return tabs.findIndex((tab) => currentPathname.split('/').join('') === tab.url.split('/').join(''));
  }

  let pathnameCleaned = currentPathname.substring(0, 3) + currentPathname.substring(currentPathname.indexOf('/', 6));

  if (pathnameCleaned.includes('[')) {
    pathnameCleaned = currentPathname.substring(0, 3);
  }

  return tabs.findIndex((tab) => {
    const tabNameCleaned = `/u/${tab.url.indexOf('/', 3) !== -1 ? tab.url.substring(tab.url.indexOf('/', 3)) : ''}`;

    return pathnameCleaned.split('/').join('') === tabNameCleaned.split('/').join('');
  });
};

const ProfileTabs: React.FunctionComponent<IProfileTabs> = ({
  tabs,
  pageType,
}) => {
  const { t } = useTranslation('profile');
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

  const shouldDrag = tabsWidth!! >= containerWidth!!;

  const [isDragging, setIsDragging] = useState(false);
  const [posLeft, setPosLeft] = useState<number>(0);
  const [prevLeft, setPrevLeft] = useState<number>(0);

  const [wasDragged, setWasDragged] = useState(false);
  const [mouseInitial, setMouseInitial] = useState<number>();

  const [activeTab, setActiveTab] = useState(findActiveTab(tabs, router.pathname, pageType));

  const profileTabsRef = useRef<HTMLDivElement>();
  const tabRefs = useRef<HTMLButtonElement[]>(new Array(tabs.length));

  // Route change
  const handleChangeRoute = useCallback((path: string) => {
    router.push(path);
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
    const updateContainerWidth = () => {
      setContainerWidth(profileTabsRef.current?.getBoundingClientRect().width!!);
      setWindowSize({
        width: window.innerWidth ?? 0,
        height: window.innerHeight ?? 0,
      });
    };

    window.addEventListener('resize', updateContainerWidth);

    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  useEffect(() => {
    setActiveTab(findActiveTab(tabs, router.pathname, pageType));
  }, [router.pathname, setActiveTab, tabs, pageType]);

  useEffect(() => {
    if (activeTab === -1) return;
    const boundingRect = tabRefs.current[activeTab].getBoundingClientRect();

    if (boundingRect.left < 0) {
      setPosLeft((curr) => curr + (0 - boundingRect.left) + 12);
      setPrevLeft((curr) => curr + (0 - boundingRect.left) + 12);
    } else if (boundingRect.right > windowSize.width) {
      setPosLeft((curr) => curr + windowSize.width - boundingRect.right - 12);
      setPrevLeft((curr) => curr + windowSize.width - boundingRect.right - 12);
    }
  }, [activeTab, windowSize, setPrevLeft, setPosLeft]);

  useEffect(() => {
    if (!shouldDrag) setPosLeft(0);
  }, [shouldDrag]);

  return (
    <SProfileTabs
      ref={(el) => {
        profileTabsRef.current = el!!;
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
        style={{
          transform: `translateX(${posLeft}px`,
        }}
        draggable={false}
        shouldDrag={shouldDrag}
      >
        {tabs && tabs.map((tab, i) => (
          <STab
            key={tab.nameToken}
            extraMargin={i === 0 && shouldDrag}
            type="button"
            activeTab={i === activeTab}
            ref={(el) => {
              tabRefs.current[i] = el!!;
            }}
            onMouseDownCapture={(e) => handleButtonMouseDownCapture(e)}
            onMouseLeave={handleButtonMouseLeave}
            onClick={(e) => handleButtonClick(e, tab)}
          >
            { t(`ProfileLayout.tabs.${tab.nameToken}`) }
          </STab>
        ))}
      </STabsContainer>
    </SProfileTabs>
  );
};

export default ProfileTabs;

const SProfileTabs = styled.div`
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
`;

const STab = styled.button<{
  activeTab: boolean;
  extraMargin: boolean;
}>`
  position: relative;
  width: min-content;

  background: transparent;
  border: transparent;

  padding-bottom: 12px;

  margin-left: ${({ extraMargin }) => (extraMargin ? '24px' : 'initial')};

  white-space: nowrap;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  color: ${({ activeTab, theme }) => (activeTab ? theme.colorsThemed.text.primary : theme.colorsThemed.text.secondary)};

  cursor: pointer;
  transition: .2s ease-in-out;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &::before {
    position: absolute;
    bottom: 0;
    left: 0;

    opacity: ${({ activeTab }) => (activeTab ? 1 : 0)};
    transform: ${({ activeTab }) => (activeTab ? 'scaleX(1)' : 'scaleX(0)')};
    transform-origin: center;

    height: 4px;
    width: 100%;

    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.gradients.blueHorizontal};

    transition: .2s ease-in-out;

    content: '';
  }
`;
