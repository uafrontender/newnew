import styled, { css } from 'styled-components';

import Button from '../Button';
import InlineSvg from '../InlineSVG';
import Text from '../Text';
import { UserAvatar } from '../../molecules/UserAvatar';

export const SBottomAction = styled.div`
  display: flex;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  flex-wrap: wrap;

  & + & {
    margin-top: 20px;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }

  ${({ theme }) => theme.media.laptopL} {
    flex-wrap: nowrap;
  }
`;

export const SBottomActionLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const SBottomActionIcon = styled.span`
  margin-right: 12px;

  font-size: 48px;
  line-height: 1;

  ${({ theme }) => theme.media.tablet} {
    margin-right: 24px;
  }
`;

export const SBottomActionText = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
`;

export const SBottomActionTitle = styled.strong`
  display: inline;
  flex-direction: row;
  white-space: pre-wrap;
  font-size: 16px;
  margin-bottom: 4px;
  font-weight: 600;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
`;

export const SBottomActionMessage = styled.div`
  display: inline;
  flex-direction: row;
  white-space: pre-wrap;
  font-size: 14px;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

export const SBottomActionButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  flex-shrink: 0;
  width: 100%;
  margin-top: 24px;

  ${(props) => props.theme.media.tablet} {
    width: auto;
    margin-top: 0;
    margin-left: auto;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-left: 72px;
    margin-top: 5px;
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-left: auto;
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

  @media (hover: hover) {
    &:hover {
      background: ${(props) => props.theme.colorsThemed.background.secondary};
      border-radius: ${(props) => props.theme.borderRadius.medium};
    }
  }
`;

export const SChatItemM = styled.div`
  cursor: pointer;
  display: flex;
  padding: 12px;

  &.active {
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }

  @media (hover: hover) {
    &:hover {
      background: ${(props) => props.theme.colorsThemed.background.tertiary};
      border-radius: ${(props) => props.theme.borderRadius.medium};
    }
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
  display: inline-flex;
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
  max-width: 186px;
  overflow: hidden;
  text-overflow: ellipsis;

  color: ${(props) => props.theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.mobileM} {
    max-width: 228px;
  }
`;

export const SUnreadCountWrapper = styled.div`
  display: flex;
  padding: 2px 0 0;
  margin-bottom: -2px;
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

export const SUserAvatar = styled(UserAvatar)`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
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
