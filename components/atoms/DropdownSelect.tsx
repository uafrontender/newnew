import React, {
  useState,
  useRef,
  ReactElement,
  useEffect,
  useCallback,
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
};

const DROPDOWN_DIRECTIONS = ['top', 'bottom'] as const;
type DropdownDirection = typeof DROPDOWN_DIRECTIONS[number];

interface IDropdownSelect<T> {
  id?: string;
  label: string;
  selected?: T;
  // As an object needs to be wrapped into useMemo for stable scrolling
  options: TDropdownSelectItem<T>[];
  maxItems?: number;
  width?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  direction?: DropdownDirection;
  onSelect: (val: T) => void;
  className?: string;
}

const DropdownSelect = <T,>({
  id,
  label,
  selected,
  options,
  maxItems,
  width,
  disabled,
  closeOnSelect,
  direction = 'bottom',
  onSelect,
  className,
}: IDropdownSelect<T>): ReactElement => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>();
  const optionsContainerRef = useRef<HTMLDivElement>();
  const optionsRefs = useRef<HTMLButtonElement[]>([]);

  const selectedRef = useRef<T | undefined>(selected);

  const handleToggle = () => setIsOpen((curr) => !curr);
  const handleClose = useCallback(() => setIsOpen(false), []);

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const getOptionId = useCallback((value: T): string | undefined => {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (isOpen && selected && selected !== selectedRef.current) {
      selectedRef.current = selected;

      const selectedItemIndex = options.findIndex((o) => o.value === selected);

      // Do not scroll to the first item in the list
      if (selectedItemIndex < 1) {
        return;
      }

      const itemTopPos = optionsRefs.current[selectedItemIndex].offsetTop;

      if (optionsContainerRef.current) {
        // Leave a small gap above the selected item
        const TOP_PADDING = 8;
        optionsContainerRef.current.scrollTop = itemTopPos - TOP_PADDING;
      }
    }
  }, [selected, options, isOpen]);

  return (
    <SWrapper
      ref={(el) => {
        containerRef.current = el!!;
      }}
      className={className}
    >
      <SLabelButton
        id={id}
        disabled={disabled ?? false}
        onClick={() => handleToggle()}
        style={{
          ...(width ? { width } : {}),
        }}
      >
        <span>{label}</span>
        <SInlineSVG
          svg={ArrowDown}
          fill={theme.colorsThemed.text.quaternary}
          width='24px'
          height='24px'
          focused={isOpen}
        />
      </SLabelButton>
      <AnimatePresence>
        {isOpen ? (
          <SOptionsContainer
            id={`${id}-options`}
            ref={(el) => {
              optionsContainerRef.current = el!!;
            }}
            width={
              containerRef.current?.getBoundingClientRect().width
                ? `${containerRef.current?.getBoundingClientRect().width}px`
                : 'inherit'
            }
            height={maxItems ? `${maxItems * 44 + 16}px` : undefined}
            direction={direction}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              // For some reason needs one more pixel to avoid jumping
              height: maxItems ? maxItems * 44 + 16 + 1 : 'auto',
            }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              {options &&
                options.map((o, i) => (
                  <SOption
                    id={getOptionId(o.value) || i.toString()}
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
        ) : null}
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
  className: '',
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

  transition: 0.2s linear;

  &:focus {
    outline: none;
  }

  &:hover:enabled,
  &:focus:active {
    cursor: pointer;

    background-color: ${({ theme }) =>
      theme.colorsThemed.background.quaternary};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const SOptionsContainer = styled(motion.div)<{
  width: string;
  height?: string;
  direction: DropdownDirection;
}>`
  position: absolute;
  top: ${({ direction }) => (direction === 'bottom' ? '54px' : undefined)};
  bottom: ${({ direction }) => (direction === 'top' ? '54px' : undefined)};

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

  ${({ theme }) => theme.media.laptop} {
    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

const SOption = styled.button<{
  selected: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  background-color: ${({ selected, theme }) =>
    selected ? theme.colorsThemed.background.quinary : 'transparent'};

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

  &:focus,
  &:hover {
    outline: none;

    ${({ selected }) =>
      !selected
        ? css`
            background-color: ${({ theme }) =>
              theme.colorsThemed.background.quaternary};
          `
        : null};
  }
`;

const SInlineSVG = styled(InlineSvg)<{
  focused: boolean;
}>`
  transform: ${({ focused }) => (focused ? 'rotate(180deg)' : 'unset')};
`;
