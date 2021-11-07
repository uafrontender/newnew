import styled from 'styled-components';

export const SCol = styled.div`
  width: 100%;
  margin: 0 8px;
  transition: all ease 0.5s;

  ${(props) => props.theme.media.laptop} {
    margin: 0 16px;
  }
`;

export default SCol;
