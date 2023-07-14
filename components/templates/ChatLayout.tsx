import React from 'react';
import styled from 'styled-components';
import { useAppState } from '../../contexts/appStateContext';
import General from './General';

interface IChatLayout {
  id?: string;
  className?: string;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}
const ChatLayout: React.FunctionComponent<IChatLayout> = React.memo(
  ({ id, className, containerRef, children }) => {
    const { resizeMode } = useAppState();
    const isMobileOrTablet = [
      'mobile',
      'mobileS',
      'mobileM',
      'mobileL',
      'tablet',
    ].includes(resizeMode);

    return isMobileOrTablet ? (
      <SWrapper
        id={id}
        className={className}
        ref={(element) => {
          if (containerRef) {
            // eslint-disable-next-line no-param-reassign
            containerRef.current = element;
          }
        }}
      >
        {children}
      </SWrapper>
    ) : (
      <SGeneral>{children}</SGeneral>
    );
  }
);

export default ChatLayout;

const SWrapper = styled.div`
  position: relative;
  height: 100%;

  width: 100vw;
  overflow: hidden;
`;

const SGeneral = styled(General)`
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.secondary
      : props.theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.laptop} {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.background.primary};
  }
`;
