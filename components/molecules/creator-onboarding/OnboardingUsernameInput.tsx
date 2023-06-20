import React, {
  ReactElement,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import InlineSvg from '../../atoms/InlineSVG';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../../atoms/AnimatedPresence';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';

interface TOnboardingSectionUsernameInput
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> {
  isValid?: boolean;
  popupCaption: ReactElement;
  frequencyCaption: string;
  errorCaption: string;
  onChange: (value: string) => void;
}

const OnboardingSectionUsernameInput: React.FunctionComponent<
  TOnboardingSectionUsernameInput
> = ({
  value,
  popupCaption,
  frequencyCaption,
  errorCaption,
  isValid,
  disabled,
  onChange,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      e.target.value[0] === '@' ? e.target.value.slice(1) : e.target.value;

    onChange(newValue);
  };

  useEffect(() => {
    if (focused) {
      return;
    }

    if (isValid) {
      setErrorBordersShown(false);
    } else if (!isValid && !focused) {
      setErrorBordersShown(true);
    }
  }, [focused, isValid]);

  const inputContainerRef = useRef(null);

  const closePopup = useCallback(() => {
    setIsPopupVisible(false);
  }, []);

  useOnClickOutside(inputContainerRef, closePopup);

  return (
    <SWrapper>
      <SInputWrapper ref={inputContainerRef}>
        <SOnboardingSectionUsernameInput
          value={(value as string).length > 0 ? `@${value}` : value}
          id='username_input'
          disabled={disabled}
          errorBordersShown={errorBordersShown}
          onChange={handleOnChange}
          onBlur={(e) => {
            setIsPopupVisible(false);
            setFocused(false);
            if (!isValid && errorCaption) {
              setErrorBordersShown(true);
            } else {
              setErrorBordersShown(false);
            }
            onBlur?.(e);
          }}
          onFocus={(e) => {
            onFocus?.(e);
            setFocused(true);
            setIsPopupVisible(true);
            setErrorBordersShown(false);
          }}
          {...rest}
        />
        <SStyledButton
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setIsPopupVisible((curr) => !curr)}
        >
          <InlineSvg svg={AlertIcon} width='24px' height='24px' />
        </SStyledButton>
        <AnimatePresence>
          {isPopupVisible ? (
            <SPopup
              initial={{
                y: 30,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  opacity: {
                    duration: 0.1,
                  },
                  y: {
                    type: 'spring',
                    velocity: -300,
                    stiffness: 100,
                    delay: 0.1,
                  },
                },
              }}
              exit={{
                y: 30,
                opacity: 0,
                transition: {
                  duration: 0.1,
                },
              }}
            >
              {popupCaption}
            </SPopup>
          ) : null}
        </AnimatePresence>
      </SInputWrapper>
      {!errorBordersShown && window ? (
        <SPreviewDiv>{`${window.location.origin}/${value}`}</SPreviewDiv>
      ) : null}
      {errorBordersShown ? (
        <AnimatedPresence animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={AlertIcon} width='16px' height='16px' />
            {errorCaption}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </SWrapper>
  );
};

OnboardingSectionUsernameInput.defaultProps = {
  isValid: undefined,
};

export default OnboardingSectionUsernameInput;

const SWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.laptop} {
    width: 50%;
  }
`;

const SInputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const SStyledButton = styled.button`
  position: absolute;
  top: 12px;
  right: 22px;

  display: flex;

  border: transparent;
  width: fit-content;
  height: fit-content;

  background: transparent;
  box-shadow: none;

  cursor: pointer;

  svg {
    path:first-child {
      fill: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
  }

  &:focus,
  &:hover {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

interface ISOnboardingSectionUsernameInput {
  errorBordersShown?: boolean;
}

const SOnboardingSectionUsernameInput = styled.input<ISOnboardingSectionUsernameInput>`
  display: block;

  height: 48px;

  font-size: 16px;
  line-height: 24px;
  font-weight: 500;

  padding: 12px 48px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      return 'transparent';
    }
    return theme.colorsThemed.accent.error;
  }};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  &::placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }
  &::-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }

  &:hover:enabled,
  &:focus:enabled,
  &:active:enabled {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        // NB! Temp
        return theme.colorsThemed.background.outlines2;
      }
      return theme.colorsThemed.accent.error;
    }};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const SPopup = styled(motion.div)`
  position: absolute;
  right: 0;
  bottom: 100%;

  padding: 16px;
  background-color: ${({ theme }) => theme.colorsThemed.text.quaternary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  transition: 0.2s linear;
  z-index: 6;

  &:after {
    position: absolute;
    bottom: -15.5px;
    right: 20px;

    width: 24px;
    height: 16px;

    content: '';
    display: inline-block;

    background-color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    clip-path: path(
      'M0 0H20L12.8284 7.17157C11.2663 8.73367 8.73367 8.73367 7.17157 7.17157L0 0Z'
    );
  }
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  position: absolute;
  bottom: -22px;

  margin-top: 6px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;

const SPreviewDiv = styled.div`
  display: block;
  width: 100%;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  margin-top: 16px;

  text-align: start;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  position: absolute;
  bottom: -22px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  & > div {
    margin-right: 4px;
  }
`;
