import React from 'react';
import styled from 'styled-components';

interface ITag {
  size?: 'sm';
  view?: 'primary';
  children: React.ReactNode;
}

const Tag: React.FC<ITag> = (props) => {
  const { children, ...rest } = props;

  return <STag {...rest}>{children}</STag>;
};

Tag.defaultProps = {
  size: 'sm',
  view: 'primary',
};

export default Tag;

const STag = styled.div<ITag>`
  /* Fix Safari bug */
  z-index: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 12px;
  line-height: 16px;
  font-weight: bold;

  padding: 8px;

  border-radius: ${(props) => props.theme.borderRadius.medium};

  color: ${(props) =>
    props.theme.colorsThemed.tag.color[props.view ?? 'primary']};
  background: ${(props) =>
    props.theme.colorsThemed.tag.background[props.view ?? 'primary']};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
