import React from 'react';
import styled from 'styled-components';

interface IInlineSvg {
  id?: string,
  svg: string,
  fill?: string,
  width?: string,
  height?: string,
  onClick?: () => any,
  clickable?: boolean,
}

export const InlineSvg: React.FC<IInlineSvg> = (props) => {
  const {
    id,
    svg,
    fill,
    width,
    height,
    onClick,
    clickable,
  } = props;

  return (
    <SSvgHolder
      id={id}
      fill={fill}
      width={width}
      height={height}
      onClick={onClick}
      clickable={clickable}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

InlineSvg.defaultProps = {
  id: '',
  fill: 'white',
  width: '100%',
  height: '100%',
  onClick: () => {
  },
  clickable: false,
};

export default InlineSvg;

interface ISSvgHolder {
  fill?: string,
  width?: string,
  height?: string,
  clickable?: boolean,
  dangerouslySetInnerHTML: {
    __html: string
  }
}

const SSvgHolder = styled.div<ISSvgHolder>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) => !!props.clickable && 'cursor: pointer;'}
  svg {
    width: 100%;
    height: auto;
    ${(props) => !!props.fill && `fill: ${props.fill};`}
  }
`;
