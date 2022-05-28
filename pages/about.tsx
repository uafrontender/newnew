/* eslint-disable no-shadow */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme, css } from 'styled-components';
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
import { useAppSelector } from '../redux-store/store';
import { TColorMode } from '../redux-store/slices/uiStateSlice';
import { sizes } from '../styles/media';

// assets
import ArrowRightIcon from '../public/images/svg/icons/outlined/ArrowRight.svg';
import AcIconDark from '../public/images/decision/ac-icon-dark.png';
import AcIconLight from '../public/images/decision/ac-icon-light.png';
import GradientMobile from '../public/images/svg/about/gradient-mobile.svg';
import GradientTablet from '../public/images/svg/about/gradient-tablet.svg';
import GradientDesktop from '../public/images/svg/about/gradient-desktop.svg';
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
import Bubble1Icon from '../public/images/png/1-bubble-icon.png';
import Bubble2Icon from '../public/images/png/2-bubble-icon.png';
import Bubble3Icon from '../public/images/png/3-bubble-icon.png';
import LogoFlatIcon from '../public/images/svg/logo-flat-icon.svg';
import LogoDarkAnimated from '../public/images/png/logo-dark.webp';
import LogoLightAnimated from '../public/images/png/logo-light.webp';
import FFLogo from '../public/images/png/ff-logo.png';
import LSVPLogo from '../public/images/png/lsvp-logo.png';
import A16ZLogo from '../public/images/png/a16z-logo.png';
import SHRUGLogo from '../public/images/png/shrug-logo.png';

import BBCLogo from '../public/images/png/bbc-logo.png';
import BloombergLogo from '../public/images/png/bloomberg-logo.png';
import ForbesLogo from '../public/images/png/forbes-logo.png';
import BNNLogo from '../public/images/png/bnn-logo.png';
import BILogo from '../public/images/png/business-insider-logo.png';
import FCLogo from '../public/images/png/fast-company-logo.png';
import CNBCLogo from '../public/images/png/cnbc-logo.png';
import ForbesCLogo from '../public/images/png/forbes-culture-logo.png';
import NytLogo from '../public/images/png/the-nyt-logo.png';

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
    previewSrc: {
      dark: assets.about.darkMedia1,
      light: assets.about.lightMedia1,
    },
  },
  {
    id: 2,
    pressName: 'nyt',
    link: 'https://www.nytimes.com/2021/03/10/style/creators-selling-selves.html',
    previewSrc: {
      dark: assets.about.darkMedia2,
      light: assets.about.lightMedia2,
    },
  },
  {
    id: 3,
    pressName: 'cnbc',
    link: 'https://www.cnbc.com/video/2021/04/01/monetizing-the-creator-economy-with-the-control-my-life-app.html?__source=sharebar%7Ctwitter&par=sharebar',
    previewSrc: {
      dark: assets.about.darkMedia3,
      light: assets.about.lightMedia3,
    },
  },
  {
    id: 4,
    pressName: 'bi',
    link: 'https://www.businessinsider.com/top-creator-economy-startups-to-watch-in-2021-vc-investors-2021-8?IR=T',
    previewSrc: {
      dark: assets.about.darkMedia4,
      light: assets.about.lightMedia4,
    },
  },
  {
    id: 5,
    pressName: 'forbes',
    link: 'https://www.forbes.com/sites/geristengel/2021/12/30/smart-vcs-recognize-that-black-female-founders-may-be-the-next-unicorns/?sh=4f00b6bc55ac',
    previewSrc: {
      dark: assets.about.darkMedia5,
      light: assets.about.lightMedia5,
    },
  },
  {
    id: 6,
    pressName: 'bloomberg',
    link: 'https://www.bloomberg.com/news/videos/2021-03-26/quicktake-take-the-lead-03-25-2021-video',
    previewSrc: {
      dark: assets.about.darkMedia6,
      light: assets.about.lightMedia6,
    },
  },
  {
    id: 7,
    pressName: 'fc',
    link: 'https://www.fastcompany.com/90586403/how-polling-app-newnew-represents-the-new-class-of-social-media',
    previewSrc: {
      dark: assets.about.darkMedia7,
      light: assets.about.lightMedia7,
    },
  },
  {
    id: 8,
    pressName: 'bnn',
    link: 'https://www.bnnbloomberg.ca/this-tech-outsider-ceo-from-toronto-went-from-managing-drake-to-taking-on-silicon-valley-1.1557924',
    previewSrc: {
      dark: assets.about.darkMedia8,
      light: assets.about.lightMedia8,
    },
  },
  {
    id: 9,
    pressName: 'forbes-c',
    link: 'https://www.forbes.com/sites/forbestheculture/2020/12/03/former-drake-executive-discusses-her-transition-to-tech-and-entrepreneurship/?sh=700c35046cb8',
    previewSrc: {
      dark: assets.about.darkMedia9,
      light: assets.about.lightMedia9,
    },
  },
];

const BACKERS = [
  {
    id: 1,
    title: 'Lightspeed Ventures',
    logo: LSVPLogo,
    name: 'lsvp',
  },
  {
    id: 2,
    title: 'Andreessen Horowitz',
    logo: A16ZLogo,
    name: 'a16z',
  },
  {
    id: 3,
    title: 'Founders Fund',
    logo: FFLogo,
    name: 'ff',
  },
  {
    id: 4,
    title: 'Shrug Capital',
    logo: SHRUGLogo,
    name: 'shrug',
  },
];

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <SScrollArrow active position='right' handleClick={onClick!!} />
);

NextArrow.defaultProps = {
  onClick: () => {},
};

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <SScrollArrow active position='left' handleClick={onClick!!} />
);

PrevArrow.defaultProps = {
  onClick: () => {},
};

export const HowItWorks = () => {
  const { t } = useTranslation('about');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);

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
    responsive: [
      {
        breakpoint: sizes.tablet,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: true,
          nextArrow: undefined,
          prevArrow: undefined,
          arrows: false,
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
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
            {/* <SMediaList> */}
            <Slider {...settings}>
              {MEDIAS.map((media, i) => (
                <SMedia key={media.id}>
                  <a
                    href={media.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    key={media.id}
                  >
                    <SMediaPreview>
                      <SMediaPreviewPic
                        src={media.previewSrc[theme.name as 'dark' | 'light']}
                      />
                      <SMediaLogo
                        src={MEDIA_ICONS[media.pressName as MediaNames].src}
                        name={media.pressName}
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
            {/* </SMediaList> */}
          </SMediaSection>

          {/* BACKERS SECTION */}
          <SSection>
            <SSectionTitleBackers variant={4}>
              {t('backers.title')}
            </SSectionTitleBackers>

            <SBackersList>
              {BACKERS.map((backer) => (
                <SBacker key={backer.id}>
                  <SBackerLogo src={backer.logo.src} name={backer.name} />
                  <SBackerTitle variant={4}>{backer.title}</SBackerTitle>
                </SBacker>
              ))}
            </SBackersList>
            <SHighlightBg>
              {isMobile && <InlineSVG svg={GradientMobile} />}
              {isTablet && <InlineSVG svg={GradientTablet} />}
              {!isMobile && !isTablet && <InlineSVG svg={GradientDesktop} />}
            </SHighlightBg>
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
                <SInvestor>
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

(HowItWorks as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <AboutLayout>
    <HomeLayout>{page}</HomeLayout>
  </AboutLayout>
);

export default HowItWorks;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'about',
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
    padding-top: 22px;
  }

  ${(props) => props.theme.media.laptopL} {
    max-width: 1248px;
    align-self: center;
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
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: 64px;
    width: 85px;

    margin-bottom: 24px;
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
`;

const SSectionTitle = styled(Headline)`
  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }
`;

const SVotesIcon = styled.img`
  position: absolute;
  right: 0;
  top: 100%;
  transform: translate(3px, 16px);
  width: 45px;
  height: 40px;

  ${({ theme }) => theme.media.tablet} {
    width: 64px;
    height: 58px;
    right: 12%;
    transform: translate(0, -15px);
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 94px;
    height: 85px;

    transform: translate(-70%, 50px);
  }
`;

const SCfIcon = styled.img`
  position: absolute;
  left: -16px;
  bottom: 0;
  transform: translate(-50%, -50px);
  width: 71px;
  height: 82px;

  ${({ theme }) => theme.media.tablet} {
    width: 103px;
    height: 110px;

    left: -32px;
    transform: translate(-10%, 0);
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 150px;
    height: 196px;

    left: -80px;

    transform: translate(-40%, 60%);
  }
`;

const SAcIcon = styled.img`
  visibility: hidden;
  position: absolute;
  width: 151px;
  height: 154px;
  top: 0;
  right: -16px;
  transform: translate(50%, -30%);

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 218px;
    height: 221px;
    right: -96px;
    transform: translate(30%, -20%);
  }
`;

const SHourGlassesIcon = styled.img`
  position: absolute;
  right: 18%;
  top: 0;
  transform: translate(0, -40%);
  width: 30px;
  height: 35px;

  ${({ theme }) => theme.media.tablet} {
    width: 42px;
    height: 47px;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 61px;
    height: 70px;
  }
`;

const SMcSubIcon = styled.img`
  position: absolute;
  right: -16px;
  top: 0;
  transform: translate(38%, -20px);
  width: ${({ theme }) => (theme.name === 'light' ? '43px' : '96px')};
  height: ${({ theme }) => (theme.name === 'light' ? '60px' : '96px')};

  ${({ theme }) => theme.media.tablet} {
    width: ${({ theme }) => (theme.name === 'light' ? '60px' : '121px')};
    height: ${({ theme }) => (theme.name === 'light' ? '81px' : '121px')};
    top: 100%;
    right: -32px;

    transform: translate(45%, 15%);
  }

  ${({ theme }) => theme.media.laptopL} {
    width: ${({ theme }) => (theme.name === 'light' ? '88px' : '180px')};
    height: ${({ theme }) => (theme.name === 'light' ? '120px' : '180px')};
    left: 100%;
    transform: translate(-10px, -10px);
  }
`;

const SBubble1Icon = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(40px, 16px);
  width: 18px;
  height: 18px;

  filter: ${({ theme }) =>
    theme.name === 'dark' ? `brightness(0.6)` : `none`};

  ${({ theme }) => theme.media.tablet} {
    width: 25px;
    height: 25px;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 39px;
    height: 39px;
  }
`;

const SBubble2Icon = styled.img`
  position: absolute;
  right: -16px;
  bottom: 0;
  transform: translate(-10px, -96px);
  width: 12px;
  height: 13px;

  filter: ${({ theme }) =>
    theme.name === 'dark' ? `brightness(0.6)` : `none`};

  ${({ theme }) => theme.media.tablet} {
    width: 18px;
    height: 18px;
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 27px;
    height: 27px;

    transform: translate(0, -45px);
    right: 10%;
  }
`;

// MEDIA
const SMediaSection = styled(SSection)`
  /* margin-left: -16px; */
  /* margin-right: -16px; */
  z-index: 1;
  max-width: 100%;
  opacity: hidden;

  & .slick-slide {
    margin-right: -16px;

    & > div {
      margin-right: 16px;
    }
  }

  /* & h4 {
    margin-left: 16px;
  } */

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

const SScrollArrow = styled(ScrollArrowPermanent)`
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
`;

const SMedia = styled.div`
  max-width: 252px;
  margin-right: 16px;

  /* 
  &:first-child {
    margin-left: 16px;
  } */

  ${({ theme }) => theme.media.tablet} {
    max-width: unset;
  }
`;

const SMediaPreview = styled.div`
  position: relative;
  padding: 8px;
  border: 1.6px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptopM} {
    margin-bottom: 24px;
  }
`;

const SMediaInfo = styled.div`
  display: flex;
`;

interface ISMediaLogo {
  name: string;
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
}

const SMediaPreviewPic = styled.div<ISMediaPreviewPic>`
  & {
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
    /* filter: ${({ theme }) =>
      theme.name === 'dark' ? `brightness(0.7)` : `none`}; */
  }

  &:after {
    content: '';
    background-image: url('../public/images/png/Mask.png');
    opacity: 0.3;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
  }

  ${({ theme }) => theme.media.tablet} {
    max-height: 171px;
    min-height: 171px;
  }

  ${({ theme }) => theme.media.laptopL} {
    max-height: 284px;
    min-height: 284px;
  }
`;

const SMediaPreviewIcon = styled(InlineSVG)`
  transform: rotate(-45deg);
`;

const SMediaTitle = styled(Text)`
  margin-right: 10px;

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
`;

const SBacker = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc((100% - 15px) / 2);
  height: calc(((100vw - 32px) - 15px) / 2);
  max-height: 288px;
  border: 0.9px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-right: 15px;
  margin-bottom: 16px;
  z-index: 1;
  transition: 0.1s background linear, 0.1s border-color linear;

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
        theme.name === 'light' ? '#F1F3F9' : '#14151f'}
      & > img {
      filter: brightness(1) grayscale(0%);
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

    &:nth-child(2n) {
      margin-right: 32px;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

const SBackerDescription = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

interface ISBackerLogo {
  readonly name: string;
}

const SBackerLogo = styled.img<ISBackerLogo>`
  transform: translateY(-10px);
  opacity: ${({ theme }) => (theme.name === 'light' ? '30%' : '100%')};
  filter: brightness(0.5) grayscale(100%);
  transition: 0.1s filter linear, 0.1s -webkit-filter linear;

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
  bottom: 16px;

  ${({ theme }) => theme.media.laptop} {
    bottom: 40px;

    font-size: 16px;
    line-height: 20px;
  }
`;

const SHighlightBg = styled.div`
  position: absolute;
  top: -42%;
  height: 750px;
  width: 985px;
  left: -16px;
  overflow-y: hidden;

  visibility: ${({ theme }) => (theme.name === 'light' ? 'hidden' : 'initial')};

  & > div {
    position: absolute;
  }

  & > div > svg {
    height: 750px;
  }
`;

// INVESTORS
const SSectionInvestors = styled(SSection)`
  ${({ theme }) => theme.media.tablet} {
    display: flex;
    padding-top: 40px;
  }
`;

const SInvestorsList = styled.ul`
  list-style: none;
  width: 100%;
  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    max-width: 55%;
    margin-left: auto;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 60%;
  }
`;

const SInvestor = styled.li`
  padding: 15px 0;
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.name === 'light'
        ? theme.colorsThemed.background.outlines1
        : theme.colorsThemed.background.outlines2};

  ${({ theme }) => theme.media.laptop} {
    &:hover > h5 {
      /* transform: scale3d(1.2, 1, 1); */
    }
  }

  ${({ theme }) => theme.media.laptopL} {
    &:hover > h5 {
      transform: scale(1.3);
    }
  }
`;

const SInvestorTitle = styled(Headline)`
  margin-bottom: 6px;
  transition: 0.15s transform ease-in-out;
  transform-origin: top left;
`;

const SMcIcon = styled.img`
  position: absolute;
  left: -16px;
  top: -20px;
  transform: translate(-20px, -70%);
  width: 62px;
  height: 75px;
  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    width: 103px;
    height: 125px;

    transform: translate(-45%, -40%);
  }

  ${({ theme }) => theme.media.laptopM} {
    width: 155px;
    height: 188px;
    left: -96px;
    top: -70%;
    transform: translate(-35%, 0);
  }
`;

const SLogoFlatIcon = styled(InlineSVG)`
  position: absolute;
  left: -16px;
  top: 0;
  transform: translate(-15%, -35%);
  width: 222px;
  height: 148px;

  ${({ theme }) => theme.media.tablet} {
    width: 343px;
    height: 230px;
    transform: translate(-25%, -10%);
  }

  ${({ theme }) => theme.media.laptopM} {
    width: 574px;
    height: 384px;
    transform: translate(-35%, -15%);
  }
`;

const SBubble3Icon = styled.img`
  position: absolute;
  right: -16px;
  bottom: -12px;
  transform: translate(0, 100%);
  width: 29px;
  height: 58px;

  ${({ theme }) => theme.media.tablet} {
    right: -32px;
    width: 50px;
    height: 100px;

    transform: translate(20%, 100%);
  }
`;
