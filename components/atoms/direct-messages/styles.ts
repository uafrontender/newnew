import styled, { css } from 'styled-components';
import Button from '../Button';
import InlineSvg from '../InlineSVG';
import Text from '../Text';

export const SBottomAction = styled.div`
  display: flex;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  flex-wrap: wrap;
  & + & {
    margin-top: 20px;
  }
  ${(props) => props.theme.media.laptop} {
    flex-wrap: nowrap;
  }
`;

export const SBottomActionLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const SBottomActionIcon = styled.span`
  font-size: 48px;
  line-height: 1;
  margin-right: 24px;
`;

export const SBottomActionText = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  margin-right: 12px;
`;

export const SBottomActionTitle = styled.strong`
  font-size: 16px;
  margin-bottom: 4px;
  font-weight: 600;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
`;

export const SBottomActionMessage = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

export const SBottomActionButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  margin-left: auto;
  flex-shrink: 0;
  width: 100%;
  margin-top: 24px;
  ${(props) => props.theme.media.tablet} {
    width: auto;
    margin-top: 0;
  }
`;

interface ISChatItem {
  isActiveChat?: boolean;
}
export const SChatItem = styled.div<ISChatItem>`
  cursor: pointer;
  display: flex;
  padding: 12px;
  ${(props) => {
    if (props.isActiveChat) {
      return css`
        background: ${props.theme.colorsThemed.background.secondary};
        border-radius: ${props.theme.borderRadius.medium};
      `;
    }
    return css``;
  }}
  &:hover {
    background: ${(props) => props.theme.colorsThemed.background.secondary};
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

export const SChatItemM = styled.div`
  cursor: pointer;
  display: flex;
  padding: 12px;
  &.active,
  &:hover {
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

export const SChatItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 2px 12px;
  flex-direction: column;
  max-width: 60%;
  overflow: hidden;
`;

export const SChatItemContent = styled.div`
  width: 100%;
  display: flex;
  padding: 2px 0 2px 12px;
  flex-direction: column;
  overflow: hidden;
`;

export const SChatItemContentWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
`;

export const SChatItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 4px;
  margin-right: 14px;
  max-width: 228px;
`;

export const SChatItemLine = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
`;

export const SChatItemText = styled(Text)`
  display: inline;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SVerificationSVG = styled(InlineSvg)`
  display: flex;
  flex-shrink: 0;
  margin-left: 4px;
`;

export const SChatItemLastMessage = styled(Text)`
  white-space: nowrap;
  max-width: 228px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

export const SChatItemRight = styled.div`
  display: flex;
  padding: 2px 0;
  align-items: flex-end;
  flex-direction: column;
  margin-left: auto;
`;

export const SChatItemTime = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  white-space: nowrap;
  padding-left: 5px;
`;

export const SChatSeparator = styled.div`
  border-top: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  margin-left: 72px;
  border-radius: 2px;
  margin-right: 15px;
`;

export const SChatItemContainer = styled.div``;

export const SUserAlias = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

export const SUserAvatar = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

export const SUnreadCount = styled.span`
  background: ${({ theme }) => theme.colorsThemed.accent.pink};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  padding: 0 6px;
  min-width: 20px;
  text-align: center;
  line-height: 20px;
  font-weight: 700;
  font-size: 10px;
  margin-left: 6px;
`;
