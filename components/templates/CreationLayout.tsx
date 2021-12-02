import React from 'react';
import { AnimateSharedLayout } from 'framer-motion';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Container from '../atoms/Grid/Container';

const CreationLayout: React.FC = (props) => {
  const { children } = props;

  return (
    <AnimateSharedLayout>
      <Container>
        <Row>
          <Col>
            {children}
          </Col>
        </Row>
      </Container>
    </AnimateSharedLayout>
  );
};

export default CreationLayout;
