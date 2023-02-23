import React, { useState, useRef, ReactElement, useEffect } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import countries from 'i18n-iso-countries';

// Utils
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';

// Icons
import ArrowDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';
import InlineSvg from '../../atoms/InlineSVG';
import { useAppState } from '../../../contexts/appStateContext';

interface IOnboardingCountrySelect {
  selected: string;
  options: string[];
  locale: string | undefined;
  maxItems?: number;
  width?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onSelect: (countryCode: string) => void;
}

const OnboardingCountrySelect = ({
  selected,
  options,
  maxItems,
  locale,
  width,
  disabled,
  closeOnSelect,
  onSelect,
}: IOnboardingCountrySelect): ReactElement => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>();
  const optionsContainerRef = useRef<HTMLDivElement>();
  const optionsRefs = useRef<HTMLButtonElement[]>([]);

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const handleToggle = () => setIsOpen((curr) => !curr);
  const handleClose = () => setIsOpen(false);

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, () => {
    handleClose();
  });

  useEffect(() => {
    if (isOpen && selected) {
      const itemTopPos =
        optionsRefs.current[options.findIndex((o) => o === selected)].offsetTop;

      if (optionsContainerRef.current) {
        optionsContainerRef.current.scrollTop = itemTopPos;
      }
    }
  }, [selected, options, isOpen]);

  // eslint-disable-next-line no-nested-ternary
  const currentLocale = locale ? (locale === 'en-US' ? 'en' : locale) : 'en';

  return (
    <SFormItemContainer pushedUp={isMobile && isOpen}>
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
          <span> {countries.getName(selected, currentLocale)}</span>
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
              ref={(el) => {
                optionsContainerRef.current = el!!;
              }}
              width={
                containerRef.current?.getBoundingClientRect().width
                  ? `${containerRef.current?.getBoundingClientRect().width}px`
                  : 'inherit'
              }
              height={maxItems ? `${maxItems * 44 + 16}px` : undefined}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div>
                {options &&
                  options.map((o, i) => (
                    <SOption
                      key={o}
                      ref={(el) => {
                        optionsRefs.current[i] = el!!;
                      }}
                      selected={o === selected}
                      onClick={() => {
                        onSelect(o);
                        if (closeOnSelect) handleClose();
                      }}
                    >
                      {countries.getName(o, currentLocale)}
                    </SOption>
                  ))}
              </div>
            </SOptionsContainer>
          ) : null}
        </AnimatePresence>
      </SWrapper>
    </SFormItemContainer>
  );
};

OnboardingCountrySelect.defaultProps = {
  width: undefined,
  selected: undefined,
  maxItems: undefined,
  disabled: false,
  closeOnSelect: false,
};

export default OnboardingCountrySelect;

const SFormItemContainer = styled.div<{
  pushedUp?: boolean;
}>`
  width: 100%;

  transition: 0.3s transform linear;

  ${({ pushedUp }) =>
    pushedUp
      ? css`
          /* z-index: 5;
      height: 80vh; */
          width: calc(100% - 32px);
          height: 30vh;
          position: fixed;
          z-index: 5;
          transform: translateY(-286px);
          background-color: ${({ theme }) =>
            theme.colorsThemed.background.primary};
        `
      : null}

  ${({ theme }) => theme.media.tablet} {
    /* width: 284px; */
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    /* width: 296px; */
  }
`;

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

  span {
    line-break: strict;
  }

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
    line-break: strict;
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
