import React, { useCallback, useMemo } from 'react';
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

  const collection = useMemo(() => [
    {
      key: 'ac',
    },
    {
      key: 'mc',
    },
    {
      key: 'cf',
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
      <SBackLine onClick={handleGoBack}>
        <SInlineSVG
          svg={isMobile ? chevronIcon : arrowLeftIcon}
          fill={theme.colorsThemed.text.secondary}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
        <SText variant={3} weight={600}>
          {t('back')}
        </SText>
      </SBackLine>
      <STitle variant={4}>
        {t('first-step-title')}
      </STitle>
      <SSubTitle variant={2} weight={600}>
        {t('first-step-sub-title')}
      </SSubTitle>
      <List
        collection={collection}
      />
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

const SWrapper = styled.div``;

const SBackLine = styled.div`
  cursor: pointer;
  display: flex;
  padding: 18px 0;
  align-items: center;
`;

const SInlineSVG = styled(InlineSVG)`
  margin-right: 8px;

  ${(props) => props.theme.media.tablet} {
    margin-right: 4px;
  }
`;

const SText = styled(Text)`
  ${(props) => props.theme.media.tablet} {
    color: ${(props) => props.theme.colorsThemed.text.secondary};
    font-weight: bold;
  }
`;

const STitle = styled(Headline)`
  padding: 0 35px;
  margin-top: 20px;
  text-align: center;
`;

const SSubTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 8px;
  text-align: center;
`;
