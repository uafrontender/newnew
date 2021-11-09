import styled from 'styled-components';

export const SContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
  max-width: ${(props) => props.theme.width.maxContentWidth}px;
  transition: all ease 0.5s;

  ${(props) => props.theme.media.tablet} {
    padding: 0 16px;
  }
  
  ${(props) => props.theme.media.laptop} {
    padding: 0 80px;
  }
`;

export default SContainer;
