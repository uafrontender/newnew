import styled from 'styled-components';

export const SCol = styled.div`
  width: 100%;
  padding: 0 8px;

  ${(props) => props.theme.media.laptop} {
    padding: 0 16px;
  }
`;

export default SCol;
