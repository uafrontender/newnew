import React, { useCallback } from 'react';
import styled from 'styled-components';

import Text from '../atoms/Text';

interface ICustomToggle {
  options: {}[];
  selected: string | undefined;
  disabled?: boolean;
  onChange: (id: string) => void;
}

const CustomToggle: React.FC<ICustomToggle> = (props) => {
  const { options, selected, disabled, onChange } = props;
  const renderOption = useCallback(
    (item: any) => {
      const isSelected = selected === item.id;
      const handleClick = () => {
        if (!disabled) {
          onChange(item.id);
        }
      };

      return (
        <SOption key={item.id} onClick={handleClick} selected={isSelected}>
          <SOptionTitle weight={500} variant={2} selected={isSelected}>
            {item.title}
          </SOptionTitle>
        </SOption>
      );
    },
    [onChange, selected, disabled]
  );

  return (
    <SCustomToggleWrapper>{options.map(renderOption)}</SCustomToggleWrapper>
  );
};

CustomToggle.defaultProps = {
  disabled: false,
};

export default CustomToggle;

const SCustomToggleWrapper = styled.div`
  padding: 6px;
  display: flex;
  position: relative;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 12px;
  flex-direction: row;
`;

interface ISOption {
  selected: boolean;
}

const SOption = styled.div<ISOption>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 6px 10px;
  overflow: hidden;
  position: relative;
  background: ${(props) =>
    props.selected ? props.theme.colorsThemed.accent.blue : 'transparent'};
  transition: background-color ease 0.5s;
  border-radius: 12px;
  pointer-events: ${(props) => (props.selected ? 'none' : 'unset')};
`;

interface ISOptionTitle {
  selected: boolean;
}

const SOptionTitle = styled(Text)<ISOptionTitle>`
  color: ${(props) =>
    props.selected
      ? props.theme.colors.white
      : props.theme.colorsThemed.text.primary};
`;
