import styled from 'styled-components';

export const SRow = styled.div<{
  noPaddingMobile?: boolean;
}>`
  width: 100%;
  display: flex;
  padding: ${({ noPaddingMobile }) => (noPaddingMobile ? 0 : '0 8px')};
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.laptop} {
    padding: 0;
  }
`;

export default SRow;
