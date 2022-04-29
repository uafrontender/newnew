import React, { useCallback } from 'react';
import styled from 'styled-components';

import Text from '../atoms/Text';

interface ICustomToggle {
  options: {}[];
  selected: string | undefined;
  onChange: (id: string) => void;
}

const CustomToggle: React.FC<ICustomToggle> = (props) => {
  const { options, selected, onChange } = props;
  const renderOption = useCallback(
    (item) => {
      const isSelected = selected === item.id;
      const handleClick = () => {
        onChange(item.id);
      };

      return (
        <SOption key={item.id} onClick={handleClick} selected={isSelected}>
          <SOptionTitle weight={500} variant={2} selected={isSelected}>
            {item.title}
          </SOptionTitle>
        </SOption>
      );
    },
    [onChange, selected]
  );

  return (
    <SCustomToggleWrapper>{options.map(renderOption)}</SCustomToggleWrapper>
  );
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
