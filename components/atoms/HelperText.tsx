import styled from 'styled-components';

const SInputHint = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-top: 6px;
`;

export default SInputHint;
