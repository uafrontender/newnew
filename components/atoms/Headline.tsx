import React from 'react';
import styled from 'styled-components';

interface IHeadline {
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

const Headline: React.FC<IHeadline> = (props) => {
  const {
    variant,
    children,
    ...rest
  } = props;

  const components = {
    1: SH1,
    2: SH2,
    3: SH3,
    4: SH4,
    5: SH5,
    6: SH6,
  };
  const Component = components[variant ?? 1];

  return <Component {...rest}>{children}</Component>;
};

Headline.defaultProps = {
  variant: 1,
};

export default Headline;

const SH1 = styled.h1`
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: 56px;
    line-height: 68px;
  }
`;

const SH2 = styled.h2`
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: 48px;
    line-height: 56px;
  }
`;

const SH3 = styled.h3`
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: 40px;
    line-height: 48px;
  }
`;

const SH4 = styled.h4`
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SH5 = styled.h5`
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SH6 = styled.h6`
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 24px;
  }
`;
