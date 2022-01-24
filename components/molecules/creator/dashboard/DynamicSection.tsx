import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../../../atoms/Button';
import InlineSVG from '../../../atoms/InlineSVG';
import Indicator from '../../../atoms/Indicator';
import Tabs, { Tab } from '../../Tabs';
import AnimatedPresence, { TAnimation } from '../../../atoms/AnimatedPresence';

import useOnClickEsc from '../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';
import notificationsIcon from '../../../../public/images/svg/icons/filled/Notifications.svg';

export const DynamicSection = () => {
  const theme = useTheme();
  const { t } = useTranslation('creator');
  const router = useRouter();
  const containerRef: any = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState('o-12');

  const { query: { tab } } = router;
  const tabs: Tab[] = useMemo(() => [
    {
      url: '/creator/dashboard?tab=notifications',
      counter: 12,
      nameToken: 'notifications',
    },
    {
      url: '/creator/dashboard?tab=chat',
      counter: 6,
      nameToken: 'chat',
    },
  ], []);
  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);

  const handleChatClick = useCallback(() => {
    router.push('/creator/dashboard?tab=chat');
  }, [router]);
  const handleNotificationsClick = useCallback(() => {
    router.push('/creator/dashboard?tab=notifications');
  }, [router]);
  const handleMinimizeClick = useCallback(() => {
    router.push('/creator/dashboard');
  }, [router]);
  const handleAnimationEnd = useCallback(() => {
    setAnimate(false);
  }, []);
  const handleMarkAllAsRead = useCallback(() => {
    console.log('mark all as read');
  }, []);

  useOnClickEsc(containerRef, handleMinimizeClick);
  useOnClickOutside(containerRef, handleMinimizeClick);
  useEffect(() => {
    setAnimate(true);
    setAnimation(tab ? 'o-12' : 'o-12-reverse');
  }, [tab]);

  return (
    <STopButtons>
      <SButton
        view="secondary"
        onClick={handleNotificationsClick}
      >
        <SIconHolder>
          <SInlineSVG
            svg={notificationsIcon}
            fill={theme.name === 'light' ? theme.colors.black : theme.colors.white}
            width="24px"
            height="24px"
          />
          <SIndicatorContainer>
            <SIndicator minified />
          </SIndicatorContainer>
        </SIconHolder>
        {t('dashboard.button.notifications')}
      </SButton>
      <SButton
        view="secondary"
        onClick={handleChatClick}
      >
        <SIconHolder>
          <SInlineSVG
            svg={chatIcon}
            fill={theme.name === 'light' ? theme.colors.black : theme.colors.white}
            width="24px"
            height="24px"
          />
          <SIndicatorContainer>
            <SIndicator minified />
          </SIndicatorContainer>
        </SIconHolder>
        {t('dashboard.button.dms')}
      </SButton>
      <AnimatedPresence
        start={animate}
        animation={animation as TAnimation}
        onAnimationEnd={handleAnimationEnd}
        animateWhenInView={false}
      >
        <SAnimatedContainer ref={containerRef}>
          <SSectionTopLine>
            <STabsWrapper>
              <Tabs
                t={t}
                tabs={tabs}
                draggable={false}
                activeTabIndex={activeTabIndex}
              />
            </STabsWrapper>
            <SSectionTopLineButtons>
              <STopLineButton
                view="secondary"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </STopLineButton>
              <STopLineButton
                view="secondary"
                onClick={handleMinimizeClick}
              >
                Minimize
              </STopLineButton>
            </SSectionTopLineButtons>
          </SSectionTopLine>
        </SAnimatedContainer>
      </AnimatedPresence>
    </STopButtons>
  );
};

export default DynamicSection;

const STopButtons = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
`;

const SButton = styled(Button)`
  padding: 8px 12px;
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary)};
  margin-left: 12px;
  border-radius: 12px;

  span {
    display: flex;
    flex-direction: row;
  }
`;

const SIconHolder = styled.div`
  position: relative;
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 12px;
`;

const SIndicatorContainer = styled.div`
  top: -4px;
  right: 10px;
  position: absolute;
`;

const SIndicator = styled(Indicator)`
  border: 3px solid ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary)};
`;

const SAnimatedContainer = styled.div`
  top: 144px;
  right: 32px;
  width: calc(100vw - 244px);
  height: 86vh;
  z-index: 5;
  padding: 24px;
  position: fixed;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 24px;
`;

const STabsWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  justify-content: flex-start;
`;

const SSectionTopLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SSectionTopLineButtons = styled.div`
  display: flex;
  align-items: center;
`;

const STopLineButton = styled(Button)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;
