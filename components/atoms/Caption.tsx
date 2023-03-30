import React from 'react';
import styled from 'styled-components';

interface ICaption {
  weight?: 500 | 600 | 700;
  variant?: 1 | 2 | 3;
  onClick?: () => void;
  innerRef?: () => void;
  children: React.ReactNode;
}

const Caption: React.FC<ICaption> = (props) => {
  const { variant, children, innerRef, ...rest } = props;

  const components = {
    1: SCaption1,
    2: SCaption2,
    3: SCaption3,
  };
  const Component = components[variant ?? 1];

  return (
    <Component ref={innerRef} {...rest}>
      {children}
    </Component>
  );
};

Caption.defaultProps = {
  weight: 600,
  variant: 1,
  onClick: () => {},
  innerRef: () => {},
};

export default Caption;

const SCaption = styled.p<ICaption>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: ${(props) => props.weight};
`;

const SCaption1 = styled(SCaption)`
  font-size: 16px;
  line-height: 20px;
`;

const SCaption2 = styled(SCaption)`
  font-size: 12px;
  line-height: 16px;
`;

const SCaption3 = styled(SCaption)`
  font-size: 10px;
  line-height: 12px;
`;
