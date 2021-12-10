import React from 'react';
import { AnimateSharedLayout } from 'framer-motion';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

const CreationLayout: React.FC = (props) => {
  const { children } = props;

  return (
    <ErrorBoundary>
      <AnimateSharedLayout>
        <Container>
          <Row>
            <Col>
              {children}
            </Col>
          </Row>
        </Container>
      </AnimateSharedLayout>
    </ErrorBoundary>
  );
};

export default CreationLayout;
