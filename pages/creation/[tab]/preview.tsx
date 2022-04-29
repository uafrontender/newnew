import Head from 'next/head';
import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import PreviewContent from '../../../components/organisms/creation/preview';

import { useAppSelector } from '../../../redux-store/store';
import useLeavePageConfirm from '../../../utils/hooks/useLeavePageConfirm';

import { NextPageWithLayout } from '../../_app';

interface ICreationPreview {}

export const CreationPreview: React.FC<ICreationPreview> = (props) => {
  const { t } = useTranslation('creation');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const allowedRoutes = [
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
  ];

  if (isDesktop) {
    allowedRoutes.push('/');
  }

  useLeavePageConfirm(true, t('secondStep.modal.leave.message'), allowedRoutes);

  return (
    <SWrapper>
      <Head>
        <title>{t(`preview.meta.title-${router?.query?.tab}`)}</title>
      </Head>
      <PreviewContent {...props} />
    </SWrapper>
  );
};

(CreationPreview as NextPageWithLayout).getLayout = (
  page: React.ReactElement
) => <CreationLayout>{page}</CreationLayout>;

export default CreationPreview;

export async function getServerSideProps(
  context: NextPageContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'creation']
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
  display: flex;
  min-height: calc(100vh - 60px);
  margin: 30px;
  padding-bottom: 104px;
  flex-direction: column;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: unset;
  }
`;
