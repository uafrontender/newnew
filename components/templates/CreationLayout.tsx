import React from 'react';
import { LayoutGroup } from 'framer-motion';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Container from '../atoms/Grid/Container';
import BaseLayout from './BaseLayout';

interface ICreationLayout {
  children: React.ReactNode;
}

const CreationLayout: React.FC<ICreationLayout> = (props) => {
  const { children } = props;

  return (
    <BaseLayout>
      <LayoutGroup>
        <Container>
          <Row>
            <Col>{children}</Col>
          </Row>
        </Container>
      </LayoutGroup>
    </BaseLayout>
  );
};

export default CreationLayout;

CreationLayout.defaultProps = {};
