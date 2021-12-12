import React, { useCallback } from 'react';
import styled from 'styled-components';
import TextAreaAutoSize from 'react-textarea-autosize';

interface ITextArea {
  id: string;
  value: string;
  onChange: (key: string, value: string | boolean) => void;
  placeholder: string;
}

export const TextArea: React.FC<ITextArea> = (props) => {
  const {
    id,
    value,
    onChange,
    placeholder,
  } = props;

  const handleChange = useCallback((e) => {
    onChange(id, e.target.value);
  }, [id, onChange]);

  return (
    <SWrapper>
      <STextArea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </SWrapper>
  );
};

export default TextArea;

const SWrapper = styled.div`
  padding: 12px 20px 8px 20px;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
`;

const STextArea = styled(TextAreaAutoSize)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  resize: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  font-weight: 500;
  line-height: 20px;
  
  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
`;
