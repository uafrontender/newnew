import React from 'react';
import styled from 'styled-components';

interface ICaption {
  weight?: 600 | 700;
  variant?: 1 | 2 | 3;
  children: React.ReactNode;
}

const Caption: React.FC<ICaption> = (props) => {
  const {
    variant,
    children,
    ...rest
  } = props;

  const components = {
    1: SCaption1,
    2: SCaption2,
    3: SCaption3,
  };
  const Component = components[variant ?? 1];

  return <Component {...rest}>{children}</Component>;
};

Caption.defaultProps = {
  weight: 600,
  variant: 1,
};

export default Caption;

const SCaption = styled.p<ICaption>`
  font-weight: ${(props) => props.weight};
`;

const SCaption1 = styled(SCaption)`
  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const SCaption2 = styled(SCaption)`
  ${({ theme }) => theme.media.tablet} {
    font-size: 12px;
    line-height: 16px;
  }
`;

const SCaption3 = styled(SCaption)`
  ${({ theme }) => theme.media.tablet} {
    font-size: 10px;
    line-height: 12px;
  }
`;
