import styled from 'styled-components';
import Button from '../Button';
import Text from '../Text';
import Indicator from '../Indicator';

export const SBottomAction = styled.div`
  display: flex;
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.tertiary};
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
  margin-bottom: 24px;
  align-items: center;
  ${(props) => props.theme.media.tablet} {
    margin-bottom: 0;
  }
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
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
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
  ${(props) => props.theme.media.tablet} {
    width: auto;
  }
`;

export const SChatItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 12px;
  &.active,
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
`;

export const SChatItemText = styled(Text)`
  margin-bottom: 4px;
  max-width: 228px;
  overflow: hidden;
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
  margin-left: -12px;
`;

export const SChatItemTime = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  white-space: nowrap;
  margin-bottom: 4px;
`;

export const SChatItemIndicator = styled(Indicator)``;

export const SChatSeparator = styled.div`
  border-top: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
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
