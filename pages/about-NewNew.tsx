/* eslint-disable no-shadow */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme, css, keyframes } from 'styled-components';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// components
import HomeLayout from '../components/templates/HomeLayout';
import Headline from '../components/atoms/Headline';
import Text from '../components/atoms/Text';
import InlineSVG from '../components/atoms/InlineSVG';
import ScrollArrowPermanent from '../components/atoms/ScrollArrowPermanent';

// utils
import { NextPageWithLayout } from './_app';
import { useAppState } from '../contexts/appStateContext';
import { TColorMode } from '../redux-store/slices/uiStateSlice';

// assets
import ArrowRightIcon from '../public/images/svg/icons/outlined/ArrowRight.svg';
import AcIconDark from '../public/images/decision/ac-icon-dark.png';
import AcIconLight from '../public/images/decision/ac-icon-light.png';
import GradientMobile from '../public/images/about/mobile-gradient.png';
import GradientTablet from '../public/images/about/tablet-gradient.png';
import VotesIconDark from '../public/images/decision/votes-icon-dark.png';
import VotesIconLight from '../public/images/decision/votes-icon-light.png';
import CfIconDark from '../public/images/decision/cf-icon-dark.png';
import CfIconLight from '../public/images/decision/cf-icon-light.png';
import HourglassIconDark from '../public/images/decision/hourglass-icon-dark.png';
import HourglassIconLight from '../public/images/decision/hourglass-icon-light.png';
import McSubIconDark from '../public/images/decision/bulb-icon-dark.png';
import McSubIconLight from '../public/images/decision/bulb-icon-light.png';
import McIconDark from '../public/images/decision/mc-icon-dark.png';
import McIconLight from '../public/images/decision/mc-icon-light.png';
import Bubble1Icon from '../public/images/about/1-bubble-icon.png';
import Bubble2Icon from '../public/images/about/2-bubble-icon.png';
import Bubble3Icon from '../public/images/about/3-bubble-icon.png';
import LogoFlatIcon from '../public/images/svg/logo-flat-icon.svg';
import LogoDarkAnimated from '../public/images/png/logo-dark.webp';
import LogoLightAnimated from '../public/images/png/logo-light.webp';
import FFLogo from '../public/images/about/ff-logo.png';
import LSVPLogo from '../public/images/about/lsvp-logo.png';
import A16ZLogoDark from '../public/images/about/a16z-logo-dark.png';
import A16ZLogoLight from '../public/images/about/a16z-logo-light.png';
import SHRUGLogoDark from '../public/images/about/shrug-logo-dark.png';
import SHRUGLogoLight from '../public/images/about/shrug-logo-light.png';

import BBCLogo from '../public/images/about/bbc-logo.png';
import BloombergLogo from '../public/images/about/bloomberg-logo.png';
import ForbesLogo from '../public/images/about/forbes-logo.png';
import BNNLogo from '../public/images/about/bnn-logo.png';
import BILogo from '../public/images/about/business-insider-logo.png';
import FCLogo from '../public/images/about/fast-company-logo.png';
import CNBCLogo from '../public/images/about/cnbc-logo.png';
import ForbesCLogo from '../public/images/about/forbes-culture-logo.png';
import NytLogo from '../public/images/about/the-nyt-logo.png';

import assets from '../constants/assets';

enum MediaNames {
  bbc = 'bbc',
  bloomberg = 'bloomberg',
  cnbc = 'cnbc',
  nyt = 'nyt',
  bi = 'bi',
  forbes = 'forbes',
  fc = 'fc',
  bnn = 'bnn',
  'forbes-c' = 'forbes-c',
}

const MEDIA_ICONS = {
  bbc: BBCLogo,
  bloomberg: BloombergLogo,
  cnbc: CNBCLogo,
  nyt: NytLogo,
  bi: BILogo,
  forbes: ForbesLogo,
  fc: FCLogo,
  bnn: BNNLogo,
  'forbes-c': ForbesCLogo,
};

type StaticImageData = {
  src: string;
  height: number;
  width: number;
};

const ICONS: Record<TColorMode, { [key: string]: StaticImageData }> = {
  light: {
    votes: VotesIconLight,
    cf: CfIconLight,
    hourglasses: HourglassIconLight,
    mcSub: McSubIconLight,
    mc: McIconLight,
    logo: LogoDarkAnimated,
    ac: AcIconLight,
  },
  dark: {
    votes: VotesIconDark,
    cf: CfIconDark,
    hourglasses: HourglassIconDark,
    mcSub: McSubIconDark,
    mc: McIconDark,
    logo: LogoLightAnimated,
    ac: AcIconDark,
  },
  auto: {},
};

const MEDIAS = [
  {
    id: 1,
    pressName: 'bbc',
    link: 'https://www.bbc.com/news/business-57085557',
    previewSrc: assets.about.media1,
  },
  {
    id: 2,
    pressName: 'nyt',
    link: 'https://www.nytimes.com/2021/03/10/style/creators-selling-selves.html',
    previewSrc: assets.about.media2,
  },
  {
    id: 3,
    pressName: 'cnbc',
    link: 'https://www.cnbc.com/video/2021/04/01/monetizing-the-creator-economy-with-the-control-my-life-app.html?__source=sharebar%7Ctwitter&par=sharebar',
    previewSrc: assets.about.media3,
  },
  {
    id: 4,
    pressName: 'bi',
    link: 'https://www.businessinsider.com/top-creator-economy-startups-to-watch-in-2021-vc-investors-2021-8?IR=T',
    previewSrc: assets.about.media4,
  },
  {
    id: 5,
    pressName: 'forbes',
    link: 'https://www.forbes.com/sites/geristengel/2021/12/30/smart-vcs-recognize-that-black-female-founders-may-be-the-next-unicorns/?sh=4f00b6bc55ac',
    previewSrc: assets.about.media5,
  },
  {
    id: 6,
    pressName: 'bloomberg',
    link: 'https://www.bloomberg.com/news/videos/2021-03-26/quicktake-take-the-lead-03-25-2021-video',
    previewSrc: assets.about.media6,
  },
  {
    id: 7,
    pressName: 'fc',
    link: 'https://www.fastcompany.com/90586403/how-polling-app-newnew-represents-the-new-class-of-social-media',
    previewSrc: assets.about.media7,
  },
  {
    id: 8,
    pressName: 'bnn',
    link: 'https://www.bnnbloomberg.ca/this-tech-outsider-ceo-from-toronto-went-from-managing-drake-to-taking-on-silicon-valley-1.1557924',
    previewSrc: assets.about.media8,
  },
  {
    id: 9,
    pressName: 'forbes-c',
    link: 'https://www.forbes.com/sites/forbestheculture/2020/12/03/former-drake-executive-discusses-her-transition-to-tech-and-entrepreneurship/?sh=700c35046cb8',
    previewSrc: assets.about.media9,
  },
];

const BACKERS = [
  {
    id: 1,
    title: 'Lightspeed Ventures',
    logo: LSVPLogo,
    name: 'lsvp',
    link: 'https://lsvp.com/',
  },
  {
    id: 2,
    title: 'Andreessen Horowitz',
    logo: A16ZLogoDark,
    logoLight: A16ZLogoLight,
    name: 'a16z',
    link: 'https://a16z.com/',
  },
  {
    id: 3,
    title: 'Founders Fund',
    logo: FFLogo,
    name: 'ff',
    link: 'https://foundersfund.com/',
  },
  {
    id: 4,
    title: 'Shrug Capital',
    logo: SHRUGLogoDark,
    logoLight: SHRUGLogoLight,
    name: 'shrug',
    link: 'https://www.shrug.vc/',
  },
];

const NextArrow = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => (
  <SScrollArrow
    active
    position='right'
    handleClick={onClick!!}
    disabled={!!className && className.includes('slick-disabled')}
  />
);

NextArrow.defaultProps = {
  onClick: () => {},
  className: '',
};

const PrevArrow = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => (
  <SScrollArrow
    active
    position='left'
    handleClick={onClick!!}
    disabled={!!className && className.includes('slick-disabled')}
  />
);

PrevArrow.defaultProps = {
  onClick: () => {},
  className: '',
};

export const About = () => {
  const { t } = useTranslation('page-About');
  const theme = useTheme();
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isTablet = ['tablet'].includes(resizeMode);

  const settings = {
    slidesToShow: 3,
    slidesToScroll: 3,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    infinite: false,
    arrows: true,
  };

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>

      <SContainerWrapper>
        <SContainer>
          {/* INTRO SECTION */}
          <SIntro>
            <Logo
              src={
                theme.name === 'light'
                  ? LogoLightAnimated.src
                  : LogoDarkAnimated.src
              }
              alt='video is processed'
            />
            <SHeadline>{t('intro.title')}</SHeadline>
            <SSubtitle>{t('intro.text')}</SSubtitle>
            <SVotesIcon src={ICONS[theme.name as TColorMode].votes.src} />
            <SCfIcon src={ICONS[theme.name as TColorMode].cf.src} />
            <SHourGlassesIcon
              src={ICONS[theme.name as TColorMode].hourglasses.src}
            />
            <SAcIcon src={ICONS[theme.name as TColorMode].ac.src} />
            <SMcSubIcon src={ICONS[theme.name as TColorMode].mcSub.src} />
            <SBubble1Icon src={Bubble1Icon.src} />
            <SBubble2Icon src={Bubble2Icon.src} />
          </SIntro>

          {/* PRESS SECTION */}
          <SMediaSection>
            <SSectionTitle variant={4}>{t('press.title')}</SSectionTitle>
            {isMobile && (
              <SMediaWrapper>
                {MEDIAS.map((media, i) => (
                  <SMedia key={media.id}>
                    <a
                      href={media.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      key={media.id}
                      draggable={false}
                    >
                      <SMediaPreview>
                        <SMediaPreviewPic
                          src={media.previewSrc}
                          name={media.pressName as MediaNames}
                        />
                        <SMediaLogo
                          src={MEDIA_ICONS[media.pressName as MediaNames].src}
                          name={media.pressName as MediaNames}
                        />
                      </SMediaPreview>
                      <SMediaInfo>
                        <SMediaTitle variant={1}>
                          {(
                            t(`press.items`, { returnObjects: true }) as {
                              title: string;
                            }[]
                          )[i]?.title ?? ''}
                        </SMediaTitle>
                        <SMediaPreviewIcon
                          svg={ArrowRightIcon}
                          width='30px'
                          height='30px'
                          fill='currentColor'
                        />
                      </SMediaInfo>
                    </a>
                  </SMedia>
                ))}
              </SMediaWrapper>
            )}
            {!isMobile && (
              <Slider {...settings}>
                {MEDIAS.map((media, i) => (
                  <SMedia key={media.id}>
                    <a
                      href={media.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      key={media.id}
                      draggable={false}
                    >
                      <SMediaPreview>
                        <SMediaPreviewPic
                          src={media.previewSrc}
                          name={media.pressName as MediaNames}
                        />
                        <SMediaLogo
                          src={MEDIA_ICONS[media.pressName as MediaNames].src}
                          name={media.pressName as MediaNames}
                        />
                      </SMediaPreview>
                      <SMediaInfo>
                        <SMediaTitle variant={1}>
                          {(
                            t(`press.items`, { returnObjects: true }) as {
                              title: string;
                            }[]
                          )[i]?.title ?? ''}
                        </SMediaTitle>
                        <SMediaPreviewIcon
                          svg={ArrowRightIcon}
                          width='30px'
                          height='30px'
                          fill='currentColor'
                        />
                      </SMediaInfo>
                    </a>
                  </SMedia>
                ))}
              </Slider>
            )}
          </SMediaSection>

          {/* BACKERS SECTION */}
          <SSection>
            <SSectionTitleBackers variant={4}>
              {t('backers.title')}
            </SSectionTitleBackers>

            <SBackersList>
              {BACKERS.map((backer) => (
                <SBacker key={backer.id}>
                  <SBackerLink
                    href={backer.link}
                    target='_blank'
                    rel='noreferrer'
                    draggable={false}
                  >
                    <SBackerLogo
                      src={
                        theme.name === 'light' && backer.logoLight
                          ? backer.logoLight.src
                          : backer.logo.src
                      }
                      name={backer.name}
                    />
                    <SBackerTitle variant={4}>{backer.title}</SBackerTitle>
                  </SBackerLink>
                </SBacker>
              ))}
            </SBackersList>
            {isMobile && <SGradient url={GradientMobile.src} />}
            {isTablet && <SGradient url={GradientTablet.src} />}
          </SSection>

          {/* INVESTORS SECTION */}
          <SSectionInvestors>
            <SSectionTitle variant={4}>{t('investors.title')}</SSectionTitle>
            <SInvestorsList>
              {(
                t('investors.participants', { returnObjects: true }) as {
                  name: string;
                  description: string;
                }[]
              ).map((investor) => (
                <SInvestor key={investor.name}>
                  <SInvestorTitle variant={5}>{investor.name}</SInvestorTitle>
                  <SBackerDescription variant={2}>
                    {investor.description}
                  </SBackerDescription>
                </SInvestor>
              ))}
            </SInvestorsList>

            <SLogoFlatIcon svg={LogoFlatIcon} />
            <SMcIcon src={ICONS[theme.name as TColorMode].mc.src} />
            <SBubble3Icon src={Bubble3Icon.src} />
          </SSectionInvestors>
        </SContainer>
      </SContainerWrapper>
    </>
  );
};

(About as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <AboutLayout>
    <HomeLayout>{page}</HomeLayout>
  </AboutLayout>
);

export default About;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-About',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};

const AboutLayout = styled.div`
  & > div {
    overflow-x: hidden !important;
    // hide scrollbar
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */

    &::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
  }
`;

const SContainerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SContainer = styled.div`
  width: 100%;
  ${({ theme }) => theme.media.tablet} {
    padding-top: 36px;
  }

  ${(props) => props.theme.media.laptopL} {
    max-width: 1248px;
    align-self: center;
    padding-top: 9px;
    padding-bottom: 86px;
  }
`;

// INTRO
const SIntro = styled.section`
  position: relative;
  padding: 0 8px;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ theme }) => theme.media.laptopL} {
    margin-bottom: 160px;
  }
`;

const Logo = styled.img`
  object-fit: contain;
  height: 48px;
  width: 64px;
  margin-bottom: 14px;
  margin-top: -8px;

  ${({ theme }) => theme.media.tablet} {
    height: 64px;
    width: 85px;

    margin-bottom: 22px;
  }

  ${({ theme }) => theme.media.laptopL} {
    height: 136px;
    width: 182px;

    margin-bottom: 16px;
  }
`;

const SHeadline = styled(Headline)`
  text-align: center;
  margin-bottom: 16px;
  max-width: 580px;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 800px;
  }

  ${({ theme }) => theme.media.laptopL} {
    max-width: 1030px;
  }
`;

const SSubtitle = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  max-width: 393px;
  width: 100%;

  ${({ theme }) => theme.media.laptop} {
    max-width: 600px;
  }

  ${({ theme }) => theme.media.laptopL} {
    max-width: 840px;
  }
`;

const SSection = styled.section`
  position: relative;
  margin-bottom: 80px;

  &:last-child {
    margin-bottom: 40px;
  }
`;

const SSectionTitle = styled(Headline)`
  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-bottom: 40px;
  }
`;

const votesIconAnimation = keyframes`
 0% { transform: translate3d(-4%, 0px, 0px); }
  25% { transform: translate3d(0px, -4%, 0px); }
  50% { transform: translate3d(4%, 0px, 0px); }
  75% { transform: translate3d(0px, 4%, 0px); }
  100% { transform: translate3d(-4%, 0px, 0px); }
`;

const SVotesIcon = styled.img`
  position: absolute;
  right: -3px;
  bottom: -18%;
  width: 45px;
  height: 40px;
  animation-name: ${votesIconAnimation};
  animation-duration: 12s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    width: 64px;
    height: 58px;
    right: 9%;
    bottom: -14%;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 94px;
    height: 85px;
    right: 18%;
    bottom: -34%;
  }
`;

const cfIconAnimation = keyframes`
  0% { transform: translate3d(4%, 0px, 0px); }
  25% { transform: translate3d(0px, 4%, 0px); }
  50% { transform: translate3d(-4%, 0px, 0px); }
  75% { transform: translate3d(0px, -4%, 0px); }
  100% { transform: translate3d(4%, 0px, 0px); }
`;

const SCfIcon = styled.img`
  position: absolute;
  left: -51px;
  bottom: 17%;
  width: 69px;
  height: 78px;
  animation-name: ${cfIconAnimation};
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    width: 103px;
    height: 110px;
    left: -39px;
    bottom: 0%;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 160px;
    height: 166px;
    left: -144px;
    top: 80%;
  }
`;

const acIconAnimation = keyframes`
  0% { transform: translate3d(0px, 0px, 0px); }
  50% { transform: translate3d(0px, 5%, 0px); }
  100% { transform: translate3d(0px, 0px, 0px); }
`;

const SAcIcon = styled.img`
  visibility: hidden;
  position: absolute;
  width: 151px;
  height: 154px;
  top: -19%;
  right: -91px;
  animation-name: ${acIconAnimation};
  animation-duration: 8s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 218px;
    height: 221px;
    right: -159px;
    top: -9%;
  }
`;

const hourGlassesIconAnimation = keyframes`
  0% { transform: translate3d(6%, 0px, 0px); }
  25% { transform: translate3d(0px, 6%, 0px); }
  50% { transform: translate3d(-6%, 0px, 0px); }
  75% { transform: translate3d(0px, -6%, 0px); }
  100% { transform: translate3d(6%, 0px, 0px); }
`;

const SHourGlassesIcon = styled.img`
  position: absolute;
  right: 18%;
  top: -8%;
  width: 30px;
  height: 35px;
  animation-name: ${hourGlassesIconAnimation};
  animation-duration: 8s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    width: 42px;
    height: 47px;
    top: -10%;
    right: 22%;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 61px;
    height: 70px;
    right: 24%;
    top: -11%;
  }
`;

const mcSubIconAnimation = keyframes`
  0% { transform: translate3d(-3%, 0px, 0px); }
  25% { transform: translate3d(0px, -3%, 0px); }
  50% { transform: translate3d(3%, 0px, 0px); }
  75% { transform: translate3d(0px, 3%, 0px); }
  100% { transform: translate3d(-3%, 0px, 0px); }
`;

const SMcSubIcon = styled.img`
  position: absolute;
  right: -51px;
  top: -12%;

  width: ${({ theme }) => (theme.name === 'light' ? '43px' : '96px')};
  height: ${({ theme }) => (theme.name === 'light' ? '60px' : '96px')};
  animation-name: ${mcSubIconAnimation};
  animation-duration: 12s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    width: ${({ theme }) => (theme.name === 'light' ? '60px' : '121px')};
    height: ${({ theme }) => (theme.name === 'light' ? '81px' : '121px')};
    top: 107%;
    right: -80px;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: ${({ theme }) => (theme.name === 'light' ? '88px' : '180px')};
    height: ${({ theme }) => (theme.name === 'light' ? '120px' : '180px')};
    top: 121%;
    right: -150px;
  }
`;

const bubble1IconAnimation = keyframes`
  0% { transform: translate3d(0px, 0px, 0px); }
  50% { transform: translate3d(0px, -60%, 0px); }
  100% { transform: translate3d(0px, 0px, 0px); }
`;

const SBubble1Icon = styled.img`
  position: absolute;
  left: 11%;
  top: 2%;
  width: 18px;
  height: 18px;
  animation-name: ${bubble1IconAnimation};
  animation-duration: 12s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  filter: ${({ theme }) =>
    theme.name === 'dark' ? `brightness(0.6)` : `none`};

  ${({ theme }) => theme.media.tablet} {
    width: 25px;
    height: 25px;
    left: 6%;
    top: -6%;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 39px;
    height: 39px;
    left: 3%;
    top: 7%;
  }
`;

const bubble2IconAnimation = keyframes`
  0% { transform: translate3d(20%, 0px, 0px); }
  25% { transform: translate3d(0px, 20%, 0px); }
  50% { transform: translate3d(-20%, 0px, 0px); }
  75% { transform: translate3d(0px, -20%, 0px); }
  100% { transform: translate3d(20%, 0px, 0px); }
`;

const SBubble2Icon = styled.img`
  position: absolute;
  right: -6px;
  bottom: 30%;
  width: 12px;
  height: 12px;
  animation-name: ${bubble2IconAnimation};
  animation-duration: 12s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  filter: ${({ theme }) =>
    theme.name === 'dark' ? `brightness(0.6)` : `none`};

  ${({ theme }) => theme.media.tablet} {
    width: 18px;
    height: 18px;
    right: 13px;
    bottom: 25%;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 27px;
    height: 27px;
    right: 9%;
    bottom: 7%;
  }
`;

// MEDIA
const SMediaSection = styled(SSection)`
  z-index: 1;
  max-width: 100%;

  & .slick-slider {
    margin-right: -16px;
  }

  & .slick-slide {
    & > div {
      margin-right: 16px;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    margin-left: 0;
    margin-right: 0;

    & .slick-slide {
      margin-right: 0;

      & > div {
        margin-right: 16px;
      }
    }
  }
`;

interface ISScrollArrow {
  disabled: boolean;
}

const SScrollArrow = styled(ScrollArrowPermanent)<ISScrollArrow>`
  & > div > svg {
    width: 25px;
    height: 27px;
  }
  ${(props) =>
    props.position === 'left'
      ? css`
          left: -15px;

          ${props.theme.media.laptop} {
            left: -15px;
          }
          ${props.theme.media.laptopM} {
            left: -30px;
            transform: translateX(-100%);
          }
        `
      : css`
          right: 0;
          justify-content: flex-end;

          ${props.theme.media.laptop} {
            right: 0;
          }
          ${props.theme.media.laptopM} {
            right: -30px;
            transform: translateX(50%);
          }
        `}

  ${(props) =>
    props.disabled
      ? css`
          display: none;
        `
      : ''}
`;

const SMediaWrapper = styled.div`
  display: flex;
  overflow-x: scroll;
  margin: 0 -16px;

  // hide scrollbar
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const SMedia = styled.div`
  max-width: 252px;
  min-width: 252px;
  margin-right: 16px;

  &:first-child {
    margin-left: 16px;
  }

  ${({ theme }) => theme.media.tablet} {
    max-width: unset;
    min-width: unset;
    margin-right: 0;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const SMediaPreview = styled.div`
  position: relative;
  padding: 9px;
  border: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 15px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 13px;
    padding: 6px;
    border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-bottom: 24px;
    padding: 8px;
  }
`;

const SMediaInfo = styled.div`
  display: flex;
`;

interface ISMediaLogo {
  name: MediaNames;
}

const SMediaLogo = styled.img<ISMediaLogo>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  ${(props) => {
    switch (props.name) {
      case 'bbc':
        return css`
          width: 103px;
          height: 30px;
        `;
      case 'nyt':
        return css`
          width: 207px;
          height: 27px;
        `;
      case 'cnbc':
        return css`
          width: 62px;
          height: 49px;
        `;
      case 'bi':
        return css`
          width: 158px;
          height: 50px;
        `;
      case 'forbes':
        return css`
          width: 90px;
          height: 22px;
        `;
      case 'bloomberg':
        return css`
          width: 157px;
          height: 32px;
        `;
      case 'fc':
        return css`
          width: 148px;
          height: 22px;
        `;
      case 'bnn':
        return css`
          width: 150px;
          height: 56px;
        `;
      case 'forbes-c':
        return css`
          width: 176px;
          height: 49px;
        `;
      default:
        return css`
          width: 48px;
          height: 48px;
        `;
    }
  }}
`;

interface ISMediaPreviewPic {
  readonly src: string;
  readonly name: MediaNames;
}

const SMediaPreviewPic = styled.div<ISMediaPreviewPic>`
  display: block;
  position: relative;
  width: 100%;
  max-height: 175px;
  min-height: 175px;
  background: ${(props) => `url(${props.src})`};
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  overflow: hidden;
  opacity: ${({ theme }) => (theme.name === 'light' ? 0.9 : 0.3)};

  &:after {
    content: ${({ theme }) => (theme.name === 'light' ? '""' : 'none')};

    background-color: #000000;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;

    ${(props) => {
      switch (props.name) {
        case 'nyt':
        case 'fc':
          return css`
            opacity: 0.7;
          `;
        default:
          return css`
            opacity: 0.2;
          `;
      }
    }};
  }

  ${({ theme }) => theme.media.tablet} {
    max-height: 160px;
    min-height: 160px;
  }

  ${({ theme }) => theme.media.laptopL} {
    max-height: 284px;
    min-height: 284px;
  }
`;

const SMediaPreviewIcon = styled(InlineSVG)`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-left: auto;
  transform: rotate(-45deg);

  ${({ theme }) => theme.media.tablet} {
    width: 22px;
    height: 23px;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 28px;
    height: 30px;
  }
`;

const SMediaTitle = styled(Text)`
  margin-right: 10px;
  max-height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptopL} {
    font-size: 20px;
    line-height: 28px;
  }
`;

// BACKERS
const SBackersList = styled.ul`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  list-style: none;

  &:after {
    content: '';
    background-image: url('../public/images/svg/about/Ellipse-1.svg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    height: 750px;
    width: 985px;
    position: absolute;
    top: -75%;
  }

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: nowrap;
  }
`;

const SSectionTitleBackers = styled(SSectionTitle)`
  margin-bottom: 24px;

  ${({ theme }) => theme.media.laptopL} {
    margin-bottom: 40px;
  }
`;

const SBacker = styled.li`
  width: calc((100% - 15px) / 2);
  height: calc(((100vw - 32px) - 15px) / 2);
  max-height: 288px;
  border: 0.9px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-right: 15px;
  margin-bottom: 16px;
  z-index: 1;
  transition: 0.12s all linear;

  &:nth-child(2n) {
    margin-right: 0;
  }

  &:nth-last-of-type(-n + 2) {
    margin-bottom: 0;
  }

  &:hover {
    background: ${({ theme }) =>
      theme.name === 'light' ? '#F1F3F9' : '#14151f'};
    border-color: ${({ theme }) =>
      theme.name === 'light' ? '#F1F3F9' : '#14151f'};

    & img {
      filter: brightness(1) grayscale(0%);
      opacity: 1;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    width: calc((100% - 16px * 3) / 4);
    height: calc(((100vw - 32px * 2) - 16px * 3) / 4);
    margin-right: 16px;

    &:nth-child(2n) {
      margin-right: 16px;
    }

    &:last-child {
      margin-right: 0;
    }

    margin-bottom: 0;
  }

  ${({ theme }) => theme.media.laptop} {
    width: calc((100% - (32px * 3)) / 4);
    height: calc(((100vw - (96px * 2)) - (32px * 3)) / 4);
    margin-right: 32px;
    border-width: 1.5px;
    border-radius: ${({ theme }) => theme.borderRadius.smallLg};

    &:nth-child(2n) {
      margin-right: 32px;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

const SBackerLink = styled.a`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const SBackerDescription = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

interface ISBackerLogo {
  readonly name: string;
}

const SBackerLogo = styled.img<ISBackerLogo>`
  transform: translateY(-13px);
  opacity: ${({ theme }) => (theme.name === 'light' ? '30%' : '100%')};
  filter: ${({ theme }) =>
    theme.name === 'light'
      ? 'brightness(0.8) grayscale(100%);'
      : 'brightness(0.7) grayscale(100%);'};

  ${(props) => {
    switch (props.name) {
      case 'lsvp':
        return css`
          width: 48px;
          height: 48px;

          ${({ theme }) => theme.media.laptopL} {
            width: 72px;
            height: 72px;
          }
        `;
      case 'a16z':
        return css`
          width: 100px;
          height: 40px;

          ${({ theme }) => theme.media.laptopL} {
            width: 150px;
            height: 60px;
          }
        `;
      case 'ff':
        return css`
          width: 48px;
          height: 48px;
          filter: brightness(0.7) grayscale(100%);

          ${({ theme }) => theme.media.laptopL} {
            width: 80px;
            height: 80px;
          }
        `;
      case 'shrug':
        return css`
          width: 113px;
          height: 40px;

          ${({ theme }) => theme.media.laptopL} {
            width: 170px;
            height: 60px;
          }
        `;
      default:
        return css`
          width: 48px;
          height: 48px;

          ${({ theme }) => theme.media.laptopL} {
            width: 72px;
            height: 72px;
          }
        `;
    }
  }}

  ${({ theme }) => theme.media.tablet} {
    transform: translateY(-15px);
  }
`;

const SBackerTitle = styled(Text)`
  text-align: center;
  position: absolute;
  bottom: 14px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
  }

  ${({ theme }) => theme.media.laptop} {
    bottom: 40px;
    font-size: 16px;
    line-height: 20px;
  }
`;

interface ISGradient {
  url: string;
}

const SGradient = styled.div<ISGradient>`
  position: absolute;
  height: 1300px;
  width: 2000px;
  right: 0;
  transform: translate(50%, -66%);
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url(${(props) => props.url});
  display: ${({ theme }) => (theme.name === 'light' ? 'none' : 'initial')};

  ${({ theme }) => theme.media.tablet} {
    height: 1700px;
    width: 2100px;
    transform: translate(55%, -50%);
  }
`;

// INVESTORS
const SSectionInvestors = styled(SSection)`
  ${SSectionTitle} {
    margin-bottom: 20px;
  }

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    padding-top: 40px;
  }

  ${({ theme }) => theme.media.laptopL} {
    padding-top: 80px;
  }
`;

const SInvestorsList = styled.ul`
  list-style: none;
  width: 100%;
  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    max-width: 57%;
    margin-left: auto;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 62%;
    height: 460px;
    margin-top: -25px;
  }
`;

const SInvestor = styled.li`
  display: flex;
  flex-direction: column;
  user-select: none;

  padding: 15px 0;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};

  ${({ theme }) => theme.media.tablet} {
    &:first-child {
      padding-top: 0;
    }

    padding: 17px 0;
  }

  ${({ theme }) => theme.media.laptop} {
    &:hover > h5 {
      /* transform: scale(2); */
      font-size: 28px;
      line-height: 32px;
    }

    padding: 24px 0;

    &:first-child {
      justify-content: flex-end;
      height: 113px;
    }
  }
`;

const SInvestorTitle = styled(Headline)`
  margin-bottom: 5px;
  transition: 0.15s all ease-in-out;
  transform-origin: top left;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 0px;
  }
`;

const mcIconAnimation = keyframes`
  0% { transform: translate3d(-5%, 0px, 0px); }
  25% { transform: translate3d(0px, -5%, 0px); }
  50% { transform: translate3d(5%, 0px, 0px); }
  75% { transform: translate3d(0px, 5%, 0px); }
  100% { transform: translate3d(-5%, 0px, 0px); }
`;

const SMcIcon = styled.img`
  position: absolute;
  left: -35px;
  top: -18%;
  width: 62px;
  height: 75px;
  z-index: 1;

  animation-name: ${mcIconAnimation};
  animation-duration: 16s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    width: 103px;
    height: 125px;
    left: -65px;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 155px;
    height: 188px;
    left: -147px;
    top: -56%;
  }
`;

const SLogoFlatIcon = styled(InlineSVG)`
  position: absolute;
  left: -16px;
  top: 0;
  transform: translate(-16%, -30%);
  width: 222px;
  height: 148px;

  ${({ theme }) => theme.media.tablet} {
    width: 343px;
    height: 230px;
    transform: translate(-25%, -3%);
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 574px;
    height: 384px;
    transform: translate(-35%, -5%);
  }
`;

const bubble3IconAnimation = keyframes`
  0% { transform: translate3d(5%, 0px, 0px); }
  25% { transform: translate3d(0px, 5%, 0px); }
  50% { transform: translate3d(-5%, 0px, 0px); }
  75% { transform: translate3d(0px, -5%, 0px); }
  100% { transform: translate3d(5%, 0px, 0px); }
`;

const SBubble3Icon = styled.img`
  position: absolute;
  right: -45px;
  bottom: -12%;
  width: 58px;
  height: 58px;
  animation-name: ${bubble3IconAnimation};
  animation-duration: 14s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ theme }) => theme.media.tablet} {
    width: 103px;
    height: 103px;
    right: -90px;
    bottom: -28%;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 133px;
    height: 133px;
    right: -162px;
    bottom: -3%;
  }
`;
