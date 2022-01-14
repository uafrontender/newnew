import React, { useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled, { useTheme } from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Text from '../../components/atoms/Text';
import InlineSVG from '../../components/atoms/InlineSVG';
import CreationLayout from '../../components/templates/CreationLayout';
import CreationFirstStepContent from '../../components/organisms/creation/first/index';

import { clearCreation } from '../../redux-store/slices/creationStateSlice';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import { NextPageWithLayout } from '../_app';

import chevronIcon from '../../public/images/svg/icons/outlined/ChevronLeft.svg';
import arrowLeftIcon from '../../public/images/svg/icons/outlined/ArrowLeft.svg';

export const CreationFirstStep = () => {
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const handleGoBack = useCallback(() => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
    dispatch(clearCreation({}));
  }, [dispatch, router]);

  return (
    <>
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
      <SWrapper>
        <Head>
          <title>
            {t('firstStep.meta.title')}
          </title>
        </Head>
        <CreationFirstStepContent />
      </SWrapper>
    </>
  );
};

(CreationFirstStep as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout>
    {page}
  </CreationLayout>
);

export default CreationFirstStep;

export async function getServerSideProps(context: NextPageContext): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'creation'],
  );

  // @ts-ignore
  if (!context?.req?.cookies?.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      ...translationContext,
    },
  };
}

const SWrapper = styled.div`
  ${(props) => props.theme.media.tablet} {
    height: calc(100vh - 148px);
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
