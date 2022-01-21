import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import InlineSvg from '../atoms/InlineSVG';

import Text from '../atoms/Text';

import CheckmarkIcon from '../../public/images/svg/icons/filled/Checkmark.svg';

interface ICheckMark {
  id?: string;
  label: string;
  selected?: boolean;
  handleChange: (e: any, id?: string) => void;
}

export const CheckMark: React.FC<ICheckMark> = (props) => {
  const {
    id,
    label,
    selected,
    handleChange,
    ...rest
  } = props;

  const onClick = useCallback((e) => {
    handleChange(e, id);
  }, [id, handleChange]);

  return (
    <SWrapper
      onClick={onClick}
      {...rest}
    >
      <SAnimation>
        <SCheckmark
          selected={selected ?? false}
        >
          {selected && (
            <InlineSvg
              svg={CheckmarkIcon}
              width="24px"
              height="24px"
            />
          )}
        </SCheckmark>
      </SAnimation>
      <SLabel variant={3} weight={600}>
        {label}
      </SLabel>
    </SWrapper>
  );
};

export default CheckMark;

CheckMark.defaultProps = {
  id: '',
  selected: false,
};

const SWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SCheckmark = styled.button<{
  selected: boolean;
}>`
  position: relative;
  display: block;

  width: 24px;
  height: 24px;
  padding: 0;

  background: transparent;
  border: none;

  border-style: solid;
  border-width: 2px;
  border-radius: 12.5%;
  border-color: ${({ selected, theme }) => (!selected ? theme.colorsThemed.background.outlines2 : 'transparent')};

  ${({ selected }) => (selected ? css`
    border: none;
  ` : css`
    &:focus {
      border-color: ${({ theme }) => theme.colorsThemed.text.secondary};
    }
    &:hover {
      border-color: ${({ theme }) => theme.colorsThemed.text.secondary};
    }
  `)};

  transition: .2s linear;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  div {
    position: absolute;
    top: -4px;
    left: -4px;
    width: 32px;
    height: 32px;

    animation: emerge 0.2s forwards;
  }

  @keyframes emerge {
    from {
      transform: scale(1.2);
    }
    to {
      transform: scale(1);
    }
  }
`;

const SLabel = styled(Text)``;
