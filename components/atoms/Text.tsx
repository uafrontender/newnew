import React from 'react';
import styled from 'styled-components';

interface IText {
  weight?: 500 | 600;
  variant?: 1 | 2 | 3;
  children: React.ReactNode;
}

const Text: React.FC<IText> = (props) => {
  const {
    variant,
    children,
    ...rest
  } = props;

  const components = {
    1: SText1,
    2: SText2,
    3: SText3,
  };
  const Component = components[variant ?? 1];

  return <Component {...rest}>{children}</Component>;
};

Text.defaultProps = {
  weight: 500,
  variant: 1,
};

export default Text;

const SText = styled.p<IText>`
  font-weight: ${(props) => props.weight};
`;

const SText1 = styled(SText)`
  font-size: 16px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SText2 = styled(SText)`
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
`;

const SText3 = styled(SText)`
  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 18px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }
`;
