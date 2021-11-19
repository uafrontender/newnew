import React from 'react';
import { useInView } from 'react-intersection-observer';
import styled, { css } from 'styled-components';

interface IHeadline {
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
  animation?: 't01' | undefined;
  children: React.ReactNode;
}

const Headline: React.FC<IHeadline> = (props) => {
  const {
    variant,
    children,
    ...rest
  } = props;
  const { ref, inView } = useInView();

  const components = {
    1: SH1,
    2: SH2,
    3: SH3,
    4: SH4,
    5: SH5,
    6: SH6,
  };
  const Component = components[variant ?? 1];

  return <Component {...rest} inView={inView} ref={ref}>{children}</Component>;
};

Headline.defaultProps = {
  variant: 1,
  animation: undefined,
};

export default Headline;

interface ISH {
  inView: boolean;
  animation?: 't01' | undefined;
}

const SH1 = styled.h1<ISH>`
  font-weight: bold;

  font-size: 32px;
  line-height: 40px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 56px;
    line-height: 64px;
  }

  ${(props) => {
    if (props.animation === 't01') {
      return css`
        opacity: 0;
        transition: opacity ease 1s;

        ${props.inView ? css`
          opacity: 1;
        ` : ''}
      `;
    }
    return '';
  }}
`;

const SH2 = styled.h2<ISH>`
  font-weight: bold;

  font-size: 28px;
  line-height: 36px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 36px;
    line-height: 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 48px;
    line-height: 56px;
  }

  ${(props) => {
    if (props.animation === 't01') {
      return css`
        opacity: 0;
        transition: opacity ease 1s;

        ${props.inView ? css`
          opacity: 1;
        ` : ''}
      `;
    }
    return '';
  }}
`;

const SH3 = styled.h3<ISH>`
  font-weight: bold;

  font-size: 24px;
  line-height: 32px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 40px;
    line-height: 48px;
  }

  ${(props) => {
    if (props.animation === 't01') {
      return css`
        opacity: 0;
        transition: opacity ease 1s;

        ${props.inView ? css`
          opacity: 1;
        ` : ''}
      `;
    }
    return '';
  }}
`;

const SH4 = styled.h4<ISH>`
  font-weight: bold;

  font-size: 22px;
  line-height: 30px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 32px;
    line-height: 40px;
  }

  ${(props) => {
    if (props.animation === 't01') {
      return css`
        opacity: 0;
        transition: opacity ease 1s;

        ${props.inView ? css`
          opacity: 1;
        ` : ''}
      `;
    }
    return '';
  }}
`;

const SH5 = styled.h5<ISH>`
  font-weight: bold;

  font-size: 20px;
  line-height: 28px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 24px;
    line-height: 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
  }

  ${(props) => {
    if (props.animation === 't01') {
      return css`
        opacity: 0;
        transition: opacity ease 1s;

        ${props.inView ? css`
          opacity: 1;
        ` : ''}
      `;
    }
    return '';
  }}
`;

const SH6 = styled.h6<ISH>`
  font-weight: bold;

  font-size: 18px;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 28px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }

  ${(props) => {
    if (props.animation === 't01') {
      return css`
        opacity: 0;
        transition: opacity ease 1s;

        ${props.inView ? css`
          opacity: 1;
        ` : ''}
      `;
    }
    return '';
  }}
`;
