import React, {
  useState, useRef, ReactElement, useEffect,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
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
  maxItems?: number,
  width?: string;
  disabled?: boolean;
  closeOnSelect?: boolean,
  onSelect: (val: T) => void;
}

const DropdownSelect = <T, >({
  label,
  selected,
  options,
  maxItems,
  width,
  disabled,
  closeOnSelect,
  onSelect,
}: IDropdownSelect<T>): ReactElement => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>();
  const optionsContainerRef = useRef<HTMLDivElement>();
  const optionsRefs = useRef<HTMLButtonElement[]>([]);

  const handleToggle = () => setIsOpen((curr) => !curr);
  const handleClose = () => setIsOpen(false);

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, () => {
    handleClose();
  });

  useEffect(() => {
    if (isOpen && selected) {
      const itemTopPos = optionsRefs
        .current[options.findIndex((o) => o.value === selected)].offsetTop;

      if (optionsContainerRef.current) {
        optionsContainerRef.current.scrollTop = itemTopPos;
      }
    }
  }, [selected, options, isOpen]);

  return (
    <SWrapper
      ref={(el) => {
        containerRef.current = el!!;
      }}
    >
      <SLabelButton
        disabled={disabled ?? false}
        onClick={() => handleToggle()}
        style={{
          ...(width ? { width } : {}),
        }}
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
          <SOptionsContainer
            ref={(el) => {
              optionsContainerRef.current = el!!;
            }}
            width={containerRef.current?.getBoundingClientRect().width
              ? `${containerRef.current?.getBoundingClientRect().width}px`
              : 'inherit'}
            height={maxItems ? `${(maxItems * 44) + 16}px` : undefined}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              {options && options.map((o, i) => (
                <SOption
                  key={o.name}
                  ref={(el) => {
                    optionsRefs.current[i] = el!!;
                  }}
                  selected={o.value === selected}
                  onClick={() => {
                    onSelect(o.value);
                    if (closeOnSelect) handleClose();
                  }}
                >
                  {o.name}
                </SOption>
              ))}
            </div>
          </SOptionsContainer>
        ) : null }
      </AnimatePresence>
    </SWrapper>
  );
};

DropdownSelect.defaultProps = {
  width: undefined,
  selected: undefined,
  maxItems: undefined,
  disabled: false,
  closeOnSelect: false,
};

export default DropdownSelect;

const SWrapper = styled.div`
  position: relative;
`;

const SLabelButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;


  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }

  padding: 12px 20px 12px 20px;

  span {
    margin-right: 8px;
  }

  transition: .2s linear;

  &:focus {
    outline: none;
  }

  &:hover:enabled, &:focus:active {
    cursor: pointer;

    background-color: ${({ theme }) => theme.colorsThemed.background.quaternary};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const SOptionsContainer = styled(motion.div)<{
  width: string;
  height?: string;
}>`
  position: absolute;
  top: 54px;

  max-height: ${({ height }) => height ?? '300px'};
  width: ${({ width }) => width};

  overflow-y: auto;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;

    padding: 10px;
  }

  z-index: 4;
`;

const SOption = styled.button<{
  selected: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  background-color: ${({ selected, theme }) => (selected ? theme.colorsThemed.background.quinary : 'transparent')};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  /* width: 100%; */
  padding: 8px 10px;


  cursor: ${({ selected }) => (selected ? 'default' : 'pointer')};

  span {
    margin-right: 8px;
  }

  &:focus, &:hover {
    outline: none;

    ${({ selected }) => (!selected ? css`
      background-color: ${({ theme }) => theme.colorsThemed.background.quaternary};
    ` : null)};
  }
`;

const SInlineSVG = styled(InlineSvg)<{
  focused: boolean;
}>`

  transform: ${({ focused }) => (focused ? 'rotate(180deg)' : 'unset')};

`;
