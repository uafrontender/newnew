import styled from 'styled-components';

export const NoContentTitle = styled.div`
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin-bottom: 8px;
  width: 100%;
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    font-size: 24px;
    line-height: 32px;
    text-align: start;
  }
`;

export const NoContentDescription = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  margin-bottom: 18px;
  max-width: 255px;
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
    text-align: start;
  }
`;
