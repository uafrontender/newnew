import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

interface IPhoneNumberInput {
  value: string;
  onChange: (phoneNumber: string, errorCode?: number) => void;
}

const PhoneNumberInput: React.FC<IPhoneNumberInput> = ({ value, onChange }) => {
  const [input, setInput] = useState<HTMLInputElement | undefined>();
  const iti = useRef<intlTelInput.Plugin>();

  useEffect(() => {
    if (input) {
      const intlTel = intlTelInput(input, {
        utilsScript:
          'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
        preferredCountries: ['us', 'ca'],
      });

      iti.current = intlTel;
    }

    return () => {
      if (iti.current) {
        iti.current.destroy();
        iti.current = undefined;
      }
    };
  }, [input]);

  return (
    <Root>
      <input
        ref={(element) => {
          if (element) {
            setInput(element);
          }
        }}
        value={value}
        onChange={() => {
          if (iti.current) {
            const newPhoneNumber = iti.current.getNumber();

            if (!newPhoneNumber.match(/^\+?[\d]*$/)) {
              return;
            }

            if (!iti.current.isValidNumber()) {
              onChange(newPhoneNumber, iti.current.getValidationError());
            } else {
              onChange(newPhoneNumber);
            }
          }
        }}
      />
    </Root>
  );
};

const Root = styled.div`
  width: 100%;

  .iti {
    width: 100%;
  }

  .iti__flag-container {
  }

  .iti__selected-flag {
    padding-left: 20px;
  }

  .iti__flag {
    height: 9px;
    width: 16px;
  }

  .iti__arrow {
    margin-left: 8px;
  }

  .iti__country-list {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
    border-radius: 16px;
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};

    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .iti__divider {
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  }

  .iti__country {
  }

  .iti__flag-box {
  }

  .iti__country-name {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }

  .iti__dial-code {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }

  input {
    width: 100%;

    background: ${({ theme }) => theme.colorsThemed.background.tertiary};
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    border-radius: 16px;

    height: 48px;
    padding-left: 60px;

    font-size: 16px;
    line-height: 24px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};

    ::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: ${({ theme }) => theme.colorsThemed.text.tertiary};
    }

    :-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: ${({ theme }) => theme.colorsThemed.text.tertiary};
    }

    ::-ms-input-placeholder {
      /* Microsoft Edge */
      color: ${({ theme }) => theme.colorsThemed.text.tertiary};
    }
  }
`;

export default PhoneNumberInput;
