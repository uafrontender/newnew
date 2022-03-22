import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import AnimatedPresence from '../../atoms/AnimatedPresence';
import NotificationItem from '../../molecules/NotificationsItem';

import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_EXPLORE } from '../../../constants/timings';

export const HeroSection = () => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateSubTitle, setAnimateSubTitle] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  const notifications = useMemo(() => [
    {
      id: 'uniqueid-1',
      bid: 50,
      bidCurrency: '$',
      bidUser: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        nickname: '@sugardaddy',
      },
      bidForUser: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
        nickname: '@unicornbaby',
      },
    },
    {
      id: 'uniqueid-2',
      bid: 50,
      bidCurrency: '$',
      bidUser: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        nickname: '@sugardaddy',
      },
      bidForUser: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
        nickname: '@unicornbaby',
      },
    },
    {
      id: 'uniqueid-3',
      bid: 50,
      bidCurrency: '$',
      bidUser: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        nickname: '@sugardaddy',
      },
      bidForUser: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
        nickname: '@unicornbaby',
      },
    },
    {
      id: 'uniqueid-4',
      bid: 50,
      bidCurrency: '$',
      bidUser: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        nickname: '@sugardaddy',
      },
      bidForUser: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
        nickname: '@unicornbaby',
      },
    },
  ], []);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const handleSignInClick = () => {
    router.push('/sign-up');
  };
  const handleExploreClick = () => {
    scroller.scrollTo('topSection', {
      offset: isMobile ? -20 : -100,
      smooth: 'easeInOutQuart',
      duration: SCROLL_EXPLORE,
      containerId: 'generalScrollContainer',
    });
  };
  const renderItem = (item: any) => (
    <SNotificationItemHolder key={item.id}>
      <NotificationItem item={item} />
    </SNotificationItemHolder>
  );

  const handleTitleAnimationEnd = useCallback(() => {
    setAnimateSubTitle(true);
  }, []);
  const handleSubTitleAnimationEnd = useCallback(() => {
    setAnimateButton(true);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setAnimateTitle(true);
    }, 0);
  }, []);

  return (
    <SWrapper>
      <STopWrapper>
        <SHeadline>
          <AnimatedPresence
            start={animateTitle}
            animation="t-08"
            onAnimationEnd={handleTitleAnimationEnd}
          >
            {t('hero-block-title')}
          </AnimatedPresence>
        </SHeadline>
        <SSubTitle weight={600}>
          <AnimatedPresence
            start={animateSubTitle}
            animation="t-02"
            onAnimationEnd={handleSubTitleAnimationEnd}
          >
            {t('hero-block-subTitle')}
          </AnimatedPresence>
        </SSubTitle>
        <AnimatedPresence
          start={animateButton}
          animation="t-01"
        >
          <SButtonsHolder>
            {isMobile ? (
              <>
                <SButton
                  withDim
                  withShrink
                  view="primaryGrad"
                  onClick={handleSignInClick}
                >
                  {t('hero-block-sign-in')}
                </SButton>
                <SButton
                  withDim
                  withShrink
                  view="secondary"
                  onClick={handleExploreClick}
                >
                  {t('hero-block-explore')}
                </SButton>
              </>
            ) : (
              <SButton
                withShrink
                withRipple
                withShadow
                view="primaryGrad"
                customDebounce={0}
                onClick={handleExploreClick}
              >
                {t('hero-block-explore-now')}
              </SButton>
            )}
          </SButtonsHolder>
        </AnimatedPresence>
      </STopWrapper>
      <SNotificationsList>
        <GradientMask />
        {notifications.map(renderItem)}
      </SNotificationsList>
    </SWrapper>
  );
};

export default HeroSection;

const SWrapper = styled.section`
  display: flex;
  margin-bottom: 24px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
  }
`;

const STopWrapper = styled.div`
  flex: 1;
  white-space: pre-line;
`;

const SHeadline = styled(Headline)`
  max-width: 250px;

  ${(props) => props.theme.media.tablet} {
    max-width: 320px;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 480px;
  }
`;

const SSubTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 16px;
  max-width: 220px;

  ${(props) => props.theme.media.tablet} {
    max-width: 230px;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 340px;
  }
`;

const SButtonsHolder = styled.div`
  display: flex;
  margin-top: 24px;
  flex-direction: row;

  button {
    margin-right: 16px;
  }

  ${(props) => props.theme.media.tablet} {
    margin-top: 32px;
  }
`;

const SNotificationsList = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  margin-top: 44px;
  align-items: flex-end;
  flex-direction: column;
`;

const GradientMask = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  position: absolute;
  background: ${(props) => props.theme.gradients.heroNotifications};
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    background: ${(props) => props.theme.gradients.heroNotificationsTablet};
  }
`;

const SNotificationItemHolder = styled.div`
  width: 100%;
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    max-width: 344px;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 608px;
  }
`;

const SButton = styled(Button)`
  padding: 12px 24px;

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;
