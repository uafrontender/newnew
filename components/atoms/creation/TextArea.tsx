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
  background: transparent;
  font-weight: 500;

  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
  
  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
`;
