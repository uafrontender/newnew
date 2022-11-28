import styled from 'styled-components';

export const SCol = styled.div<{
  noPaddingMobile?: boolean;
}>`
  width: 100%;
  padding: ${({ noPaddingMobile }) => (noPaddingMobile ? 0 : '0 8px')};

  ${(props) => props.theme.media.laptop} {
    padding: 0 16px;
  }
`;

export default SCol;
