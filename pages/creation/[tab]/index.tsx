import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import SecondStepContent from '../../../components/organisms/creation/second';

import useLeavePageConfirm from '../../../utils/hooks/useLeavePageConfirm';

import { NextPageWithLayout } from '../../_app';
import { useAppDispatch } from '../../../redux-store/store';
import { clearCreation } from '../../../redux-store/slices/creationStateSlice';
import assets from '../../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import { I18nNamespaces } from '../../../@types/i18next';

interface ICreationSecondStep {}

export const CreationSecondStep: React.FC<ICreationSecondStep> = (props) => {
  const router = useRouter();
  const { t } = useTranslation('page-Creation');
  const dispatch = useAppDispatch();

  useLeavePageConfirm(
    true,
    t('secondStep.modal.leave.message'),
    [
      '/creation',
      '/creation/auction',
      '/creation/multiple-choice',
      '/creation/crowdfunding',
      '/creation/auction/preview',
      '/creation/multiple-choice/preview',
      '/creation/crowdfunding/preview',
      '/creation/auction/published',
      '/creation/multiple-choice/published',
      '/creation/crowdfunding/published',
    ],
    () => {
      dispatch(clearCreation(undefined));
    }
  );

  return (
    <SWrapper>
      <Head>
        <title>
          {t(
            `secondStep.meta.${
              `title-${router?.query?.tab}` as keyof I18nNamespaces['page-Creation']['secondStep']['meta']
            }`
          )}
        </title>
        <meta
          name='description'
          content={t(
            `secondStep.meta.${
              `description-${router?.query?.tab}` as keyof I18nNamespaces['page-Creation']['secondStep']['meta']
            }`
          )}
        />
        <meta
          property='og:title'
          content={t(
            `secondStep.meta.${
              `title-${router?.query?.tab}` as keyof I18nNamespaces['page-Creation']['secondStep']['meta']
            }`
          )}
        />
        <meta
          property='og:description'
          content={t(
            `secondStep.meta.${
              `description-${router?.query?.tab}` as keyof I18nNamespaces['page-Creation']['secondStep']['meta']
            }`
          )}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <SecondStepContent {...props} />
    </SWrapper>
  );
};

(CreationSecondStep as NextPageWithLayout).getLayout = (
  page: React.ReactElement
) => <CreationLayout>{page}</CreationLayout>;

export default CreationSecondStep;

export async function getServerSideProps(
  context: NextPageContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'page-Creation'],
    null,
    SUPPORTED_LANGUAGES
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

  // TODO: remove when goals returned
  if (context.req.url?.includes('crowdfunding')) {
    return {
      redirect: {
        permanent: true,
        destination: '/creation',
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
  display: flex;
  padding-bottom: 104px;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    margin: 0 auto;
    max-width: 464px;
    padding-bottom: 0;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 736px;
  }
`;
