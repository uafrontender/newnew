import styled from 'styled-components';

export const SRow = styled.div`
  width: 100%;
  display: flex;
  padding: 0 8px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.laptop} {
    padding: 0;
  }
`;

export default SRow;
