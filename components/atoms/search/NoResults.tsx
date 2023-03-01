/* eslint-disable no-nested-ternary */
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { animateScroll } from 'react-scroll';
import styled from 'styled-components';
import { SCROLL_EXPLORE } from '../../../constants/timings';
import { useAppState } from '../../../contexts/appStateContext';
import Button from '../Button';

interface IFunctionProps {
  closeDrop?: () => void;
}

const NoResults: React.FC<IFunctionProps> = ({ closeDrop }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const exploreHandler = () => {
    if (closeDrop) {
      closeDrop();
    }

    if (router.pathname !== '/') {
      router.push('/');
    } else {
      animateScroll.scrollToTop({
        offset: isMobile ? -20 : -100,
        smooth: 'ease',
        duration: SCROLL_EXPLORE,
      });
    }
  };
  return (
    <SNoResults>
      <SEmptyInboxTitle>{t('search.noResults.title')}</SEmptyInboxTitle>
      <SEmptyInboxText>{t('search.noResults.description')}</SEmptyInboxText>
      <Button onClick={exploreHandler}>{t('search.noResults.action')}</Button>
    </SNoResults>
  );
};

export default NoResults;

NoResults.defaultProps = {
  closeDrop: () => {},
};

const SNoResults = styled.div`
  width: 270px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SEmptyInboxTitle = styled.strong`
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 4px;
  font-weight: 700;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
`;

const SEmptyInboxText = styled.div`
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 16px;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;
