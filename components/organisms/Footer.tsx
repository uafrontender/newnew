/* eslint-disable react/jsx-no-target-blank */
import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { animateScroll } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Caption from '../atoms/Caption';
import Container from '../atoms/Grid/Container';
import InlineSvg from '../atoms/InlineSVG';
import ChangeLanguage from '../atoms/ChangeLanguage';
import SettingsColorModeSwitch from '../molecules/profile/SettingsColorModeSwitch';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import mobileLogo from '../../public/images/svg/mobile-logo.svg';
// import twitterIcon from '../../public/images/svg/icons/filled/Twitter.svg';
// import tiktokIcon from '../../public/images/svg/icons/filled/TikTok.svg';
// import instagramIcon from '../../public/images/svg/icons/filled/Insragram.svg';

import { SCROLL_TO_TOP } from '../../constants/timings';
import {
  setColorMode,
  TColorMode,
} from '../../redux-store/slices/uiStateSlice';
import { I18nNamespaces } from '../../@types/i18next';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';

interface IFooter {}

type TItem = {
  key: keyof I18nNamespaces['common']['footer'];
  url: string;
  iconSrc?: string;
  email?: boolean;
  external?: boolean;
};

export const Footer: React.FC<IFooter> = React.memo(() => {
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector((state) => state.ui);
  const { resizeMode } = useAppState();

  const topItems: TItem[] = [
    {
      key: 'howItWorks',
      url: '/how-it-works',
      // external: true,
    },
    {
      key: 'faq',
      url: 'https://faqs.newnew.co',
    },
    {
      key: 'about',
      url: '/about-NewNew',
    },

    {
      key: 'guidelines',
      url: 'https://communityguidelines.newnew.co',
    },
    {
      key: 'jobs',
      url: 'https://jobs.lever.co/NewNew',
    },
  ];
  const centerItems: TItem[] = [
    // TODO: return twitter link later
    /* {
      key: 'twitter',
      url: 'https://twitter.com/newnewhq',
      external: true,
      iconSrc: twitterIcon,
    }, */
    {
      key: 'email' as any,
      url: 'hi@newnew.co',
      // external: true,
      email: true,
    },
  ];
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  useEffect(() => {
    Mixpanel.track_links(
      'footer a',
      'Navigation Item Clicked',
      (e: HTMLLinkElement) => ({
        _target: e?.getAttribute('href'),
      })
    );
  }, []);

  const handleLogoClick = () => {
    if (router.pathname === '/') {
      animateScroll.scrollToTop({
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
      });
    } else {
      router.push('/', '/');
    }
  };

  const handleSetColorMode = useCallback(
    (mode: TColorMode) => {
      Mixpanel.track('Color mode switched', {
        _component: 'Footer',
        _colorMode: mode,
      });
      dispatch(setColorMode(mode));
    },
    [dispatch]
  );

  const renderItem = (item: TItem) => {
    if (item.external) {
      return (
        <SExternalLink
          key={item.key}
          href={item.email ? `mailto: ${item.url}` : item.url}
          target='_blank'
        >
          {item.iconSrc ? (
            <SSvgHolder target='_blank'>
              <InlineSvg
                svg={item.iconSrc}
                fill={theme.colorsThemed.text.secondary}
                width='20px'
                height='20px'
                hoverFill={theme.colorsThemed.text.primary}
              />
            </SSvgHolder>
          ) : null}
          <SBlockOption>
            {!item.email ? t(`footer.${item.key}`) : item.url}
          </SBlockOption>
        </SExternalLink>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.email ? `mailto: ${item.url}` : item.url}
        passHref
      >
        <SBlockOption target='_blank'>
          {!item.email ? t(`footer.${item.key}`) : item.url}
        </SBlockOption>
      </Link>
    );
  };

  return (
    <SWrapper>
      <Container>
        <Row>
          <Col>
            <SContent>
              <SIconHolder onClick={handleLogoClick}>
                <InlineSvg
                  clickable
                  svg={mobileLogo}
                  fill='#1D6AFF'
                  width='48px'
                  height='48px'
                />
              </SIconHolder>
              <STopContent>
                <SBlock>
                  <SBlockTitle weight={700}>{t('footer.topTitle')}</SBlockTitle>
                  {topItems.map(renderItem)}
                </SBlock>
                {isMobile && <SSeparator />}
                <SBlock>
                  <SBlockTitle weight={700}>
                    {t('footer.centerTitle')}
                  </SBlockTitle>
                  {centerItems.map(renderItem)}
                </SBlock>
                {/* {isMobile && <SSeparator />} */}
                {/* <SBlock>
                  <SBlockTitle weight={700}>
                    {t('footer.bottomTitle')}
                  </SBlockTitle>
                  <SBlockRow>
                    <Link href="https://www.instagram.com" passHref>
                      <SSvgHolder target="_blank">
                        <InlineSvg
                          svg={instagramIcon}
                          fill={theme.colorsThemed.text.secondary}
                          width="20px"
                          height="20px"
                          hoverFill={theme.colorsThemed.text.primary}
                        />
                      </SSvgHolder>
                    </Link>
                    <Link href="https://twitter.com" passHref>
                      <SSvgHolder target="_blank">
                        <InlineSvg
                          svg={twitterIcon}
                          fill={theme.colorsThemed.text.secondary}
                          width="20px"
                          height="20px"
                          hoverFill={theme.colorsThemed.text.primary}
                        />
                      </SSvgHolder>
                    </Link>
                    <Link href="https://twitter.com" passHref>
                      <SSvgHolder target="_blank">
                        <InlineSvg
                          svg={tiktokIcon}
                          fill={theme.colorsThemed.text.secondary}
                          width="20px"
                          height="20px"
                          hoverFill={theme.colorsThemed.text.primary}
                        />
                      </SSvgHolder>
                    </Link>
                  </SBlockRow>
                </SBlock> */}
                {!isMobile && <SChangeLanguage />}
              </STopContent>
              <SSeparator />
              <SBlockBottomRow>
                <SLeftBlock>
                  <SBottomBlockOptionInc>
                    {t('footer.inc')}
                  </SBottomBlockOptionInc>
                  <SBottomBlockOption
                    href='https://terms.newnew.co'
                    target='_blank'
                  >
                    {t('footer.terms')}
                  </SBottomBlockOption>
                  <SBottomBlockOption
                    href='https://privacy.newnew.co'
                    target='_blank'
                  >
                    {t('footer.privacy')}
                  </SBottomBlockOption>
                </SLeftBlock>
                <SRightBlock>
                  <SRightBlockItemHolder>
                    <SettingsColorModeSwitch
                      theme={theme}
                      currentlySelectedMode={colorMode}
                      variant='horizontal'
                      isMobile
                      buttonsCaptions={{
                        light: tCommon('colorModeSwitch.options.light'),
                        dark: tCommon('colorModeSwitch.options.dark'),
                        auto: tCommon('colorModeSwitch.options.auto'),
                      }}
                      handleSetColorMode={handleSetColorMode}
                      backgroundColor={
                        theme.name === 'light'
                          ? theme.colorsThemed.button.background.changeLanguage
                          : ''
                      }
                    />
                  </SRightBlockItemHolder>
                  {isMobile && <ChangeLanguage />}
                </SRightBlock>
              </SBlockBottomRow>
            </SContent>
          </Col>
        </Row>
      </Container>
    </SWrapper>
  );
});

export default Footer;

const SWrapper = styled.footer`
  padding-bottom: 36px;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.secondary
      : props.theme.colorsThemed.background.primary};
`;

const SContent = styled.div`
  padding: 32px 0;
  position: relative;
`;

const STopContent = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  ${(props) => props.theme.media.tablet} {
    flex-direction: row;
  }
`;

const SBlock = styled.div`
  display: flex;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    min-width: 128px;
    margin-right: 16px;
  }

  ${(props) => props.theme.media.laptop} {
    min-width: 224px;
    margin-right: 32px;
  }
`;

const SSeparator = styled.div`
  margin-top: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};

  ${(props) => props.theme.media.tablet} {
    margin-top: 36px;
  }
`;

const SBlockTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  margin-bottom: 24px;
`;

const SBlockOption = styled.a`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  transition: color ease 0.5s;
  font-weight: 600;
  line-height: 24px;
  margin-bottom: 12px;

  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const SChangeLanguage = styled(ChangeLanguage)`
  position: absolute;
  right: 0;
  bottom: 0;
`;

// const SBlockRow = styled.div`
//   display: flex;
//   margin-bottom: 12px;
//   flex-direction: row;
// `;

const SBlockBottomRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
  }
`;

const SBottomBlockOption = styled.a`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  transition: color ease 0.5s;
  font-weight: 600;
  line-height: 24px;
  margin-right: 24px;

  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const SBottomBlockOptionInc = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  margin-right: 24px;
`;

const SExternalLink = styled.a`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 9px;

  &:hover {
    a {
      color: ${(props) => props.theme.colorsThemed.text.primary};
    }

    div {
      svg {
        fill: ${(props) => props.theme.colorsThemed.text.primary};
      }
    }
  }
`;

const SSvgHolder = styled.a``;

const SIconHolder = styled.div`
  top: 32px;
  right: 0;
  position: absolute;
  z-index: 1;

  cursor: pointer;
`;

const SLeftBlock = styled.div`
  order: 2;

  ${(props) => props.theme.media.tablet} {
    order: 1;
  }
`;

const SRightBlock = styled.div`
  order: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  ${(props) => props.theme.media.tablet} {
    order: 2;
    margin-bottom: 0;
    justify-content: flex-end;
  }
`;

const SRightBlockItemHolder = styled.div`
  margin-right: 16px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 16px;
    margin-right: 0;
  }
`;
