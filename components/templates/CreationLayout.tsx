import React from 'react';
import { LayoutGroup } from 'framer-motion';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

interface ICreationLayout {}

const CreationLayout: React.FC<ICreationLayout> = (props) => {
  const { children } = props;

  return (
    <ErrorBoundary>
      <LayoutGroup>
        <Container>
          <Row>
            <Col>{children}</Col>
          </Row>
        </Container>
      </LayoutGroup>
    </ErrorBoundary>
  );
};

export default CreationLayout;

CreationLayout.defaultProps = {};
