/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import styled from 'styled-components';
import Text from '../../atoms/Text';
import CheckMark from '../CheckMark';

interface ICheckboxWithALink {
  id?: string;
  label: string;
  linkText: string;
  value: boolean;
  onToggled: () => void;
  onLinkClicked: () => void;
}

const CheckboxWithALink: React.FC<ICheckboxWithALink> = ({
  id,
  label,
  linkText,
  value,
  onToggled,
  onLinkClicked,
}) => (
  <AgreedToTosSection>
    <CheckMark id={id} selected={value} handleChange={() => onToggled()} />
    <Text variant={3} weight={600}>
      <span onClick={onToggled}>{label}</span>
      <TextTrigger onClick={() => onLinkClicked()}> {linkText}</TextTrigger>
    </Text>
  </AgreedToTosSection>
);

const AgreedToTosSection = styled('div')`
  display: flex;
  align-items: center;
  margin-right: 24px;
`;

const TextTrigger = styled('span')`
  cursor: pointer;

  color: ${({ theme }) => theme.colorsThemed.accent.blue};
`;

CheckboxWithALink.defaultProps = {
  id: undefined,
};

export default CheckboxWithALink;
