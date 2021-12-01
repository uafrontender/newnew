import styled, { css } from 'styled-components';

interface ISContainer {
  noMaxContent?: boolean;
}

export const SContainer = styled.div<ISContainer>`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
  max-width: ${(props) => props.theme.width.maxContentWidth}px;

  ${(props) => props.theme.media.tablet} {
    padding: 0 16px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 0 80px;
  }
  
  ${(props) => props.theme.media.laptopL} {
    ${(props) => props.noMaxContent && css`
      max-width: unset;
    `}
  }
`;

export default SContainer;
