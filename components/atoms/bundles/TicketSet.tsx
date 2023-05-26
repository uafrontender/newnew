import React from 'react';
import styled, { useTheme } from 'styled-components';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';
import VoteIconBig from '../../../public/images/dashboard/votes-small.png';

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
      {[...Array(numberOFTickets)].map((v, index) => (
        <SIcon
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          src={
            // eslint-disable-next-line no-nested-ternary
            size > 36
              ? // TODO: add theme specific assets
                VoteIconBig.src
              : theme.name === 'light'
              ? VoteIconLight.src
              : VoteIconDark.src
          }
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
  z-index: 0;
`;

const SIcon = styled.img<{ index: number; size: number; shift: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  position: absolute;
  left: ${({ index, shift }) => `${shift * index}px`};
  z-index: ${({ index }) => 1000 - index};
`;
