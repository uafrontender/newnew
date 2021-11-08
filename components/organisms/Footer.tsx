import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import InlineSvg from '../atoms/InlineSVG';
import ChangeLanguage from '../atoms/ChangeLanguage';
import ChangeCurrency from '../atoms/ChangeCurrency';

import { useAppSelector } from '../../redux-store/store';

import mobileLogo from '../../public/images/svg/mobile-logo.svg';
import tiktokIcon from '../../public/images/svg/icons/filled/TikTok.svg';
import twitterIcon from '../../public/images/svg/icons/filled/Twitter.svg';
import instagramIcon from '../../public/images/svg/icons/filled/Insragram.svg';

interface IFooter {
}

type TItem = {
  key: string,
  url: string
};

export const Footer: React.FC<IFooter> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const renderItem = (item: TItem) => (
    <Link key={item.key} href={item.url} passHref>
      <SBlockOption>
        {t(`footer-${item.key}`)}
      </SBlockOption>
    </Link>
  );

  return (
    <SContainer>
      <SContent>
        <SIconHolder>
          <Link href="/">
            <a>
              <InlineSvg
                svg={mobileLogo}
                fill={theme.colorsThemed.appIcon}
                width="48px"
                height="48px"
              />
            </a>
          </Link>
        </SIconHolder>
        <STopContent>
          <SBlock>
            <SBlockTitle>
              {t('footer-top-title')}
            </SBlockTitle>
            {topItems.map(renderItem)}
          </SBlock>
          {isMobile && <SSeparator />}
          <SBlock>
            <SBlockTitle>
              {t('footer-center-title')}
            </SBlockTitle>
            {centerItems.map(renderItem)}
          </SBlock>
          {isMobile && <SSeparator />}
          <SBlock>
            <SBlockTitle>
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
                  />
                </SSvgHolder>
              </Link>
            </SBlockRow>
          </SBlock>
        </STopContent>
        <SSeparator />
        <SBlockBottomRow>
          <SLeftBlock>
            <SBottomBlockOption>
              {t('footer-inc')}
            </SBottomBlockOption>
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
            <SRightBlockItemHolder>
              <ChangeCurrency />
            </SRightBlockItemHolder>
          </SRightBlock>
        </SBlockBottomRow>
      </SContent>
    </SContainer>
  );
};

export default Footer;

const SContainer = styled.footer`
  background-color: ${(props) => props.theme.colorsThemed.footerBackground};
`;

const SContent = styled.div`
  margin: 0 auto;
  padding: 32px 16px;
  position: relative;
  max-width: ${(props) => props.theme.width.maxContentWidth};

  ${(props) => props.theme.media.tablet} {
    padding: 32px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 32px 96px;
  }
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
  }

  ${(props) => props.theme.media.laptop} {
    min-width: 224px;
  }
`;

const SSeparator = styled.div`
  margin-top: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${(props) => props.theme.colorsThemed.grayscale.outlines1};

  ${(props) => props.theme.media.tablet} {
    margin-top: 36px;
  }
`;

const SBlockTitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 16px;
  line-height: 19px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const SBlockOption = styled.a`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  font-weight: bold;
  line-height: 24px;
  margin-bottom: 12px;
  text-decoration: none;
`;

const SBlockRow = styled.div`
  display: flex;
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
  font-weight: bold;
  line-height: 24px;
  margin-right: 24px;
  text-decoration: none;
`;

const SSvgHolder = styled.a`
  margin-right: 15px;
`;

const SIconHolder = styled.div`
  top: 32px;
  right: 16px;
  position: absolute;

  ${(props) => props.theme.media.tablet} {
    right: 32px;
  }

  ${(props) => props.theme.media.laptop} {
    right: 96px;
  }
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
