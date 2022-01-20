import React from 'react';
import styled from 'styled-components';
import CountUp from 'react-countup';

export interface IIndicator {
  counter: number,
  animate?: boolean,
  minified?: boolean,
  onAnimationEnd?: () => void,
}

export const Indicator: React.FC<IIndicator> = (props) => {
  const {
    counter,
    animate,
    minified,
    onAnimationEnd,
  } = props;

  const bigCounter = counter >= 100;
  const valueToDisplay = bigCounter ? 99 : counter;

  if (minified) {
    return <SMinifiedIndicator />;
  }

  return (
    <SIndicator bigCounter={bigCounter}>
      {animate ? (
        <CountUp
          useEasing
          end={valueToDisplay}
          onEnd={onAnimationEnd}
          duration={5}
        />
      ) : valueToDisplay}
      {bigCounter ? '+' : ''}
    </SIndicator>
  );
};

export default Indicator;

Indicator.defaultProps = {
  animate: true,
  minified: false,
  onAnimationEnd: () => {},
};

interface ISIndicator {
  bigCounter: boolean;
}

const SIndicator = styled.div<ISIndicator>`
  color: ${(props) => props.theme.colors.white};
  display: flex;
  padding: ${(props) => (props.bigCounter ? '3px 4px' : '3px 6px')};
  font-size: 10px;
  line-height: 12px;
  font-weight: bold;
  align-items: center;
  border-radius: 16px;
  letter-spacing: 0.02em;
  justify-content: center;
  background-color: ${(props) => props.theme.colorsThemed.accent.pink};
`;

const SMinifiedIndicator = styled.div`
  width: 6px;
  border: 3px solid ${(props) => props.theme.colorsThemed.background.primary};
  height: 6px;
  padding: 3px;
  overflow: hidden;
  position: relative;
  border-radius: 50px;
  background-color: ${(props) => props.theme.colorsThemed.accent.pink};
`;
