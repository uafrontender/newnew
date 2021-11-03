import React from 'react';
import styled from 'styled-components';
import CountUp from 'react-countup';

export interface IIndicator {
  counter: number,
}

export const Indicator: React.FC<IIndicator> = (props) => {
  const { counter } = props;

  const bigCounter = counter >= 100;

  return (
    <SIndicator bigCounter={bigCounter}>
      <CountUp
        useEasing
        end={bigCounter ? 99 : counter}
        duration={5}
      />
      {bigCounter ? '+' : ''}
    </SIndicator>
  );
};

export default Indicator;

interface ISIndicator {
  bigCounter: boolean;
}

const SIndicator = styled.div<ISIndicator>`
  color: ${(props) => props.theme.colors.baseLight0};
  border: 3px solid ${(props) => props.theme.colorsThemed.appBgColor};
  padding: ${(props) => (props.bigCounter ? '3px 4px' : '3px 6px')};
  font-size: 10px;
  font-weight: bold;
  border-radius: 16px;
  letter-spacing: 0.02em;
  background-color: ${(props) => props.theme.colors.brand3500};
`;
