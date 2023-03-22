import styled from 'styled-components';

export const NoContentDescription = styled.div`
  max-width: 300px;
  margin-bottom: 18px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 500;
  text-align: center;
  white-space: pre-line;

  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

export const NoContentSuggestion = styled.div`
  width: 100%;
  max-width: 300px;
  margin-bottom: 18px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 500;
  text-align: center;
  white-space: pre-line;

  opacity: 0.66;

  font-size: 12px;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;
