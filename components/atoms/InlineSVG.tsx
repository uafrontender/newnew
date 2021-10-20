import React from 'react';
import styled from 'styled-components';

interface InlineSvgInterface {
  svg: string,
  fill: string,
  width: string,
  height: string,
}

export const InlineSvg = (props: InlineSvgInterface): JSX.Element => {
  const {
    svg,
    fill,
    width,
    height
  } = props;

  return <SvgHolder
    fill={fill}
    width={width}
    height={height}
    dangerouslySetInnerHTML={{ __html: svg }}
  />;
};

InlineSvg.defaultProps = {
  fill: 'white',
  width: '100%',
  height: '100%'
};

interface SvgHolderInterface {
  fill: string,
  width: string,
  height: string,
  dangerouslySetInnerHTML: {
    __html: string
  }
}

const SvgHolder = styled.div<SvgHolderInterface>`
  width: ${props => props.width};
  height: ${props => props.height};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: auto;
    ${props => !!props.fill && `fill: ${props.fill};`}
  }
`;

export default InlineSvg;
