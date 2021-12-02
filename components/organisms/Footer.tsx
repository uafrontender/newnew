import React from 'react';
import Link from 'next/link';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Caption from '../atoms/Caption';
import Container from '../atoms/Grid/Container';
import InlineSvg from '../atoms/InlineSVG';
import ChangeLanguage from '../atoms/ChangeLanguage';

import { useAppSelector } from '../../redux-store/store';

import mobileLogo from '../../public/images/svg/mobile-logo.svg';
import tiktokIcon from '../../public/images/svg/icons/filled/TikTok.svg';
import twitterIcon from '../../public/images/svg/icons/filled/Twitter.svg';
import instagramIcon from '../../public/images/svg/icons/filled/Insragram.svg';

import { SCROLL_TO_TOP } from '../../constants/timings';

interface IFooter {
}

type TItem = {
  key: string,
  url: string
};

export const Footer: React.FC<IFooter> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const topItems: TItem[] = [
    {
      key: 'about',
      url: '/about',
    },
    {
      key: 'press',
      url: '/press',
    },
    {
      key: 'jobs',
      url: '/jobs',
    },
    {
      key: 'help',
      url: '/help',
    },
  ];
  const centerItems: TItem[] = [
    {
      key: 'faq',
      url: '/faq',
    },
    {
      key: 'how-it-works',
      url: '/how-it-works',
    },
    {
      key: 'guidelines',
      url: '/guidelines',
    },
    {
      key: 'accessibility',
      url: '/accessibility',
    },
    {
      key: 'suggest-a-feature',
      url: '/suggest-a-feature',
    },
  ];
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleLogoClick = () => {
    if (router.pathname === '/') {
      scroller.scrollTo('top-reload', {
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
        containerId: 'generalScrollContainer',
      });
    } else {
      router.push('/', '/');
    }
  };
  const renderItem = (item: TItem) => (
    <Link key={item.key} href={item.url} passHref>
      <SBlockOption>
        {t(`footer-${item.key}`)}
      </SBlockOption>
    </Link>
  );

  return (
    <SWrapper>
      <Container>
        <Row>
          <Col>
            <SContent>
              <SIconHolder>
                <InlineSvg
                  clickable
                  svg={mobileLogo}
                  fill={theme.colorsThemed.text.primary}
                  width="48px"
                  height="48px"
                  onClick={handleLogoClick}
                />
              </SIconHolder>
              <STopContent>
                <SBlock>
                  <SBlockTitle weight={700}>
                    {t('footer-top-title')}
                  </SBlockTitle>
                  {topItems.map(renderItem)}
                </SBlock>
                {isMobile && <SSeparator />}
                <SBlock>
                  <SBlockTitle weight={700}>
                    {t('footer-center-title')}
                  </SBlockTitle>
                  {centerItems.map(renderItem)}
                </SBlock>
                {isMobile && <SSeparator />}
                <SBlock>
                  <SBlockTitle weight={700}>
                    {t('footer-bottom-title')}
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
                </SBlock>
              </STopContent>
              <SSeparator />
              <SBlockBottomRow>
                <SLeftBlock>
                  <SBottomBlockOptionInc>
                    {t('footer-inc')}
                  </SBottomBlockOptionInc>
                  <Link href="/terms" passHref>
                    <SBottomBlockOption>
                      {t('footer-terms')}
                    </SBottomBlockOption>
                  </Link>
                  <Link href="/privacy" passHref>
                    <SBottomBlockOption>
                      {t('footer-privacy')}
                    </SBottomBlockOption>
                  </Link>
                </SLeftBlock>
                <SRightBlock>
                  <SRightBlockItemHolder>
                    <ChangeLanguage />
                  </SRightBlockItemHolder>
                </SRightBlock>
              </SBlockBottomRow>
            </SContent>
          </Col>
        </Row>
      </Container>
    </SWrapper>
  );
};

export default Footer;

const SWrapper = styled.footer`
  background-color: ${(props) => props.theme.colorsThemed.background.backgroundFooter};
`;

const SContent = styled.div`
  padding: 32px 0;
  position: relative;
`;

const STopContent = styled.div`
  display: flex;
  flex-direction: column;

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
  border-bottom: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};

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

const SBlockRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  flex-direction: row;
`;

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

const SSvgHolder = styled.a`
  margin-right: 15px;
`;

const SIconHolder = styled.div`
  top: 32px;
  right: 0;
  position: absolute;
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
