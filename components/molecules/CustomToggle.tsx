import React, { useCallback } from 'react';
import styled from 'styled-components';

import Text from '../atoms/Text';

interface ICustomToggle {
  options: {}[];
  selected: string | undefined;
  onChange: (id: string) => void;
}

const CustomToggle: React.FC<ICustomToggle> = (props) => {
  const {
    options,
    selected,
    onChange,
  } = props;

  const renderOption = useCallback((item) => {
    const handleClick = () => {
      onChange(item.id);
    };

    return (
      <SOption
        key={item.key}
        onClick={handleClick}
        selected={selected === item.id}
      >
        <SOptionTitle variant={2} weight={500}>
          {item.title}
        </SOptionTitle>
      </SOption>
    );
  }, [onChange, selected]);

  return (
    <SCustomToggleWrapper>
      {options.map(renderOption)}
    </SCustomToggleWrapper>
  );
};

export default CustomToggle;

const SCustomToggleWrapper = styled.div`
  padding: 6px;
  display: flex;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 12px;
  flex-direction: row;
`;

interface ISOption {
  selected: boolean;
}

const SOption = styled.div<ISOption>`
  padding: 6px 10px;
  overflow: hidden;
  background: ${(props) => (props.selected ? props.theme.colorsThemed.accent.blue : 'transparent')};
  transition: background-color ease 0.5s;
  border-radius: 12px;
`;

const SOptionTitle = styled(Text)`
`;
