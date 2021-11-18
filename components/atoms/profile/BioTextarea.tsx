import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type TBioTextarea = React.ComponentPropsWithoutRef<'textarea'> & {
  maxChars: number;
}

const BioTextarea: React.FunctionComponent<TBioTextarea> = ({
  maxChars,
  value,
  onChange,
  ...rest
}) => {
  const [charCounter, setCharCounter] = useState((value as string).length);

  useEffect(() => {
    setCharCounter((value as string).length);
  }, [value, setCharCounter]);

  return (
    <SBioTextareaDiv>
      <textarea
        value={value}
        maxLength={maxChars}
        onChange={onChange}
        onPaste={(e) => {
          const data = e.clipboardData.getData('Text');

          if (!data || data.length > maxChars) {
            e.preventDefault();
          }
        }}
        {...rest}
      />
      <SCharCounter>
        { charCounter }
        /
        { maxChars }
      </SCharCounter>
    </SBioTextareaDiv>
  );
};

export default BioTextarea;

const SBioTextareaDiv = styled.div`
  position: relative;

  display: flex;

  textarea {
    display: block;

    width: 100%;
    height: 104px;

    padding: 12px 20px 12px 20px;
    padding-bottom: 36px;
    margin-bottom: 16px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-width: 1.5px;
    border-style: solid;
    border-color: transparent;

    color: ${({ theme }) => theme.colorsThemed.text.primary};
    background-color: ${({ theme }) => theme.colorsThemed.grayscale.background3};

    resize: none;

    &::placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
    &:-ms-input-placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
    &::-ms-input-placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }

    &:hover:enabled, &:focus, &:active {
      outline: none;

      border-color: ${({ theme }) => theme.colorsThemed.grayscale.outlines2}
    }

    ${({ theme }) => theme.media.tablet} {
      height: 120px;
    }

  }

`;

const SCharCounter = styled.div`
  position: absolute;
  right: 24px;
  bottom: 24px;

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
