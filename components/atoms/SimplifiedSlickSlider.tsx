/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import styled from 'styled-components';

interface ISimplifiedSlickSlider {
  children: React.ReactNode;
}

const SimplifiedSlickSlider = React.forwardRef<
  HTMLDivElement,
  ISimplifiedSlickSlider
>(({ children }, ref: any) => {
  const [translateX, setTranslateX] = useState(0);

  return <SWrapper>{children}</SWrapper>;
});

export default SimplifiedSlickSlider;

const SWrapper = styled.div``;
