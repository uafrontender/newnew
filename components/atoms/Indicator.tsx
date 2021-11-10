import React from 'react';
import styled from 'styled-components';
import CountUp from 'react-countup';

export interface IIndicator {
  counter: number,
  minified: boolean,
}

export const Indicator: React.FC<IIndicator> = (props) => {
  const {
    counter,
    minified,
  } = props;

  const bigCounter = counter >= 100;

  if (minified) {
    return <SMinifiedIndicator />;
  }

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

Indicator.defaultProps = {
  minified: false,
};

interface ISIndicator {
  bigCounter: boolean;
}

const SIndicator = styled.div<ISIndicator>`
  color: ${(props) => props.theme.colors.white};
  border: 3px solid ${(props) => props.theme.colorsThemed.grayscale.background1};
  padding: ${(props) => (props.bigCounter ? '3px 4px' : '3px 6px')};
  font-size: 10px;
  font-weight: bold;
  border-radius: 16px;
  letter-spacing: 0.02em;
  background-color: ${(props) => props.theme.colorsThemed.accent.pink};
`;

const SMinifiedIndicator = styled.div`
  width: 6px;
  border: 3px solid ${(props) => props.theme.colorsThemed.grayscale.background1};
  height: 6px;
  padding: 3px;
  overflow: hidden;
  border-radius: 50px;
  background-color: ${(props) => props.theme.colorsThemed.accent.pink};
`;
