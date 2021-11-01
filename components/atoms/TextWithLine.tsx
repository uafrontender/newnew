// NB! Extracted to avoid polluting `SignupMenu` component;
// To be truly reusable might require further tweaks.
import React from 'react';
import styled from 'styled-components';

interface ISTextWithLine {
  lineColor: string;
}

const STextWithLine = styled.div<ISTextWithLine>`
  position: relative;

  display: flex;
  justify-content: center;

  margin-top: 8px;
  margin-bottom: 8px;

  z-index: 1;

  span {
    display: block;
  }

  &:before {
    border-bottom: 1px solid;
    border-bottom-color: ${({ theme }) => (theme.name === 'light' ? '#949DB7' : 'rgba(115, 117, 140, 0.7)')};
    content: "";

    margin: 0 auto;
    position: absolute;
    top: 45%; left: 0; right: 0;
    width: 90%;
    z-index: -1;
  }
`;

interface ITextWithLine {
  lineColor: string;
  innerSpan: React.ComponentPropsWithoutRef<'span'>;
}

const TextWithLine: React.FunctionComponent<ITextWithLine> = ({
  lineColor,
  innerSpan,
}) => (
  <STextWithLine
    lineColor={lineColor}
  >
    { innerSpan }
  </STextWithLine>
);

export default TextWithLine;
