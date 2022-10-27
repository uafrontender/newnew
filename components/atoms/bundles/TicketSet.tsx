/* eslint-disable react/no-array-index-key */
import React from 'react';
import styled, { useTheme } from 'styled-components';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';

interface ITicketSet {
  className?: string;
  numberOFTickets: number;
  size: number;
  shift: number;
}

const TicketSet: React.FC<ITicketSet> = ({
  className,
  numberOFTickets,
  size,
  shift,
}) => {
  const theme = useTheme();
  return (
    <SContainer
      className={className}
      numberOFTickets={numberOFTickets}
      size={size}
      shift={shift}
    >
      {Array.from('x'.repeat(numberOFTickets)).map((v, index) => (
        <SIcon
          key={index}
          src={theme.name === 'light' ? VoteIconLight.src : VoteIconDark.src}
          size={size}
          shift={shift}
          index={index}
        />
      ))}
    </SContainer>
  );
};

export default TicketSet;

const SContainer = styled.div<{
  numberOFTickets: number;
  size: number;
  shift: number;
}>`
  height: ${({ size }) => `${size}px`};
  width: ${({ numberOFTickets, size, shift }) =>
    `${size + shift * (numberOFTickets - 1)}px`};
  position: relative;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const SIcon = styled.img<{ index: number; size: number; shift: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  position: absolute;
  left: ${({ index, shift }) => `${shift * index}px`};
`;