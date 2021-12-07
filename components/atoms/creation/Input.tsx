import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

interface IInput {
  id: string;
  value: string;
  onChange: (key: string, value: string | boolean) => void;
  placeholder: string;
}

export const Input: React.FC<IInput> = (props) => {
  const {
    id,
    value,
    onChange,
    placeholder,
  } = props;
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);
  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);
  const handleChange = useCallback((e) => {
    onChange(id, e.target.value);
  }, [id, onChange]);

  return (
    <SWrapper>
      {!focused && !value && (
        <SLabel htmlFor="input">
          {placeholder}
        </SLabel>
      )}
      <SInput
        id="input"
        type="text"
        value={value}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
      />
    </SWrapper>
  );
};

export default Input;

const SWrapper = styled.div`
  padding: 12px 20px;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
`;

const SInput = styled.input`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  font-weight: 500;
  line-height: 20px;
`;

const SLabel = styled.label`
  top: 50%;
  left: 20px;
  color: ${(props) => props.theme.colorsThemed.text.quaternary};
  position: absolute;
  font-size: 14px;
  transform: translateY(-50%);
  font-weight: 500;
  line-height: 20px;
`;
