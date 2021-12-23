import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { AnimateSharedLayout } from 'framer-motion';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Text from '../atoms/Text';
import InlineSVG from '../atoms/InlineSVG';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import { useAppSelector } from '../../redux-store/store';

import chevronIcon from '../../public/images/svg/icons/outlined/ChevronLeft.svg';
import arrowLeftIcon from '../../public/images/svg/icons/outlined/ArrowLeft.svg';

interface ICreationLayout {
  noHeader?: boolean;
  noTabletHeader?: boolean;
}

const CreationLayout: React.FC<ICreationLayout> = (props) => {
  const {
    children,
    noHeader,
    noTabletHeader,
  } = props;
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  let withHeader = !noHeader;

  if (noTabletHeader && (isTablet || isDesktop)) {
    withHeader = false;
  }

  const handleGoBack = useCallback(() => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <ErrorBoundary>
      <AnimateSharedLayout>
        <Container>
          <Row>
            <Col>
              {withHeader && (
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
              )}
              {children}
            </Col>
          </Row>
        </Container>
      </AnimateSharedLayout>
    </ErrorBoundary>
  );
};

export default CreationLayout;

CreationLayout.defaultProps = {
  noHeader: false,
  noTabletHeader: false,
};

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
