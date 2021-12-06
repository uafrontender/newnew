import React, { useState, useRef, ReactElement } from 'react';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

// Utils
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import useOnClickEsc from '../../utils/hooks/useOnClickEsc';

// Icons
import ArrowDown from '../../public/images/svg/icons/filled/ArrowDown.svg';
import InlineSvg from './InlineSVG';

export type TDropdownSelectItem<T> = {
  name: string;
  value: T;
}

interface IDropdownSelect<T> {
  label: string;
  selected?: T;
  options: TDropdownSelectItem<T>[];
  onSelect: (val: T) => void;
}

const DropdownSelect = <T, >({
  label,
  selected,
  options,
  onSelect,
}: IDropdownSelect<T>): ReactElement => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>();

  const handleToggle = () => setIsOpen((curr) => !curr);
  const handleClose = () => setIsOpen(false);

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, () => {
    handleClose();
  });

  return (
    <SWrapper
      ref={(el) => {
        containerRef.current = el!!;
      }}
    >
      <SLabelButton
        onClick={() => handleToggle()}
      >
        <span>
          {label}
        </span>
        <SInlineSVG
          svg={ArrowDown}
          fill={theme.colorsThemed.text.quaternary}
          width="24px"
          height="24px"
          focused={isOpen}
        />
      </SLabelButton>
      <AnimatePresence>
        {isOpen ? (
          <SOptionsContainer>
            {options && options.map((o) => (
              <SOption
                key={o.name}
                selected={o.value === selected}
                onClick={() => onSelect(o.value)}
              >
                {o.name}
              </SOption>
            ))}
          </SOptionsContainer>
        ) : null }
      </AnimatePresence>
    </SWrapper>
  );
};

DropdownSelect.defaultProps = {
  selected: undefined,
};

export default DropdownSelect;

const SWrapper = styled.div`

`;

const SLabelButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;


  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  padding: 12px 12px 12px 20px;

  span {
    margin-right: 8px;
  }

  &:focus {
    outline: none;
  }
`;

const SOptionsContainer = styled(motion.div)`
  position: absolute;


  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;

const SOption = styled.button<{
  selected: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: transparent;
  border: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  width: 100%;
  padding: 12px 12px 12px 20px;

  span {
    margin-right: 8px;
  }

  &:focus {
    outline: none;
  }
`;

const SInlineSVG = styled(InlineSvg)<{
  focused: boolean;
}>`

  transform: ${({ focused }) => (focused ? 'rotate(180deg)' : 'unset')};

`;
