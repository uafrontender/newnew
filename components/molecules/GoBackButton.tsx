import React, { useMemo } from 'react';
import styled from 'styled-components';
import { debounce } from 'lodash';

// Components
import InlineSvg from '../atoms/InlineSVG';

// Icons
import BackButtonIcon from '../../public/images/svg/auth/icon-back.svg';

type TGoBackButton = {
  children?: React.ReactNode;
  defer?: number;
  onClick: () => void;
} & React.ComponentPropsWithoutRef<'button'>;

const GoBackButton: React.FunctionComponent<TGoBackButton> = ({
  children,
  defer,
  onClick,
  ...rest
}) => {
  const handleClickDebounced = useMemo(() => debounce(onClick!!, defer ?? 0),
    [onClick, defer]);

  return (
    <SGoBackButton
      onClick={!defer ? onClick : handleClickDebounced}
      {...rest}
    >
      <InlineSvg
        svg={BackButtonIcon}
        width="24px"
        height="24px"
      />
      { children }
    </SGoBackButton>
  );
};

GoBackButton.defaultProps = {
  children: undefined,
  defer: undefined,
};

export default GoBackButton;

const SGoBackButton = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-weight: bold;
  font-size: 15px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  background-color: transparent;
  border: transparent;

  cursor: pointer;

  & div {
    margin-right: 8px;
  }
  & path {
    fill: ${({ theme }) => theme.colorsThemed.text.secondary};
  }

  &:hover, &:focus {
    outline: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};

    & path {
      fill: ${({ theme }) => theme.colorsThemed.text.primary};
      transition: .2s ease;
    }

    transition: .2s ease;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
