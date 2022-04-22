import React from 'react';
import styled from 'styled-components';
import CheckMark from '../CheckMark';

interface IOnboardingSectionDetails {
  label: string;
  linkText: string;
  value: boolean;
  onToggled: () => void;
  onLinkClicked: () => void;
}

const CheckboxWithALink: React.FC<IOnboardingSectionDetails> = ({
  label,
  linkText,
  value,
  onToggled,
  onLinkClicked,
}) => (
  <AgreedToTosSection>
    <CheckMark
      label={label}
      selected={value}
      handleChange={() => onToggled()}
    />
    <TextTrigger onClick={() => onLinkClicked()}> {linkText}</TextTrigger>
  </AgreedToTosSection>
);

const AgreedToTosSection = styled('div')`
  display: flex;
  align-items: center;
  margin-right: 24px;
`;

const TextTrigger = styled('p')`
  cursor: pointer;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  white-space: pre-wrap;

  color: ${({ theme }) => theme.colorsThemed.accent.blue};
`;

export default CheckboxWithALink;
