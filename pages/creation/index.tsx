import React, { useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled, { useTheme } from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Text from '../../components/atoms/Text';
import List from '../../components/organisms/creation/List';
import Headline from '../../components/atoms/Headline';
import InlineSVG from '../../components/atoms/InlineSVG';
import CreationLayout from '../../components/templates/CreationLayout';

import { useAppSelector } from '../../redux-store/store';
import { NextPageWithLayout } from '../_app';

import chevronIcon from '../../public/images/svg/icons/outlined/ChevronLeft.svg';
import arrowLeftIcon from '../../public/images/svg/icons/outlined/ArrowLeft.svg';

export const CreationFirstStep = () => {
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isDesktop = ['laptop', 'laptopL', 'desktop'].includes(resizeMode);

  const collection = useMemo(() => [
    {
      key: 'auction',
    },
    {
      key: 'multiple-choice',
    },
    {
      key: 'crowdfunding',
    },
  ], []);
  const handleGoBack = useCallback(() => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <SWrapper>
      <Head>
        <title>
          {t('firstStep.meta.title')}
        </title>
      </Head>
      <SBackLine onClick={handleGoBack}>
        <SInlineSVG
          svg={isDesktop ? arrowLeftIcon : chevronIcon}
          fill={theme.colorsThemed.text.secondary}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
        {isDesktop && (
          <SText variant={3} weight={600}>
            {t('back')}
          </SText>
        )}
      </SBackLine>
      <SContent>
        <STitle variant={4}>
          {t('first-step-title')}
        </STitle>
        <SSubTitle variant={2} weight={600}>
          {t('first-step-sub-title')}
        </SSubTitle>
        <List
          collection={collection}
        />
      </SContent>
    </SWrapper>
  );
};

(CreationFirstStep as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout>
    {page}
  </CreationLayout>
);

export default CreationFirstStep;

export async function getStaticProps(context: NextPageContext): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'creation'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}

const SWrapper = styled.div`
  ${(props) => props.theme.media.tablet} {
    height: 100vh;
  }
`;

const SContent = styled.div`
  ${(props) => props.theme.media.tablet} {
    height: calc(100% - 72px);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  ${(props) => props.theme.media.laptop} {
    height: calc(100% - 80px);
  }
`;

const SBackLine = styled.div`
  cursor: pointer;
  display: flex;
  padding: 18px 0;
  align-items: center;

  :hover {
    p {
      color: ${(props) => props.theme.colorsThemed.text.primary};
    }

    svg {
      fill: ${(props) => props.theme.colorsThemed.text.primary};
    }
  }

  ${(props) => props.theme.media.tablet} {
    padding: 24px 0;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  transition: fill ease 0.2s;
  margin-right: 8px;

  ${(props) => props.theme.media.tablet} {
    margin-right: 4px;
  }
`;

const SText = styled(Text)`
  transition: color ease 0.2s;

  ${(props) => props.theme.media.tablet} {
    color: ${(props) => props.theme.colorsThemed.text.secondary};
    font-weight: bold;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 6px 0;
  }
`;

const STitle = styled(Headline)`
  padding: 0 35px;
  margin-top: 20px;
  text-align: center;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;

const SSubTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 8px;
  text-align: center;

  ${(props) => props.theme.media.tablet} {
    margin-top: 12px;
  }
`;
