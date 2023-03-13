import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAppState } from '../../contexts/appStateContext';
import { useGetChats } from '../../contexts/chatContext';
import General from './General';

interface IDashboardLayout {
  id?: string;
  className?: string;
  withChat?: boolean;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}
const DashboardLayout: React.FunctionComponent<IDashboardLayout> = React.memo(
  ({ id, className, containerRef, children, withChat }) => {
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { mobileChatOpened } = useGetChats();

    useEffect(() => {
      if (isMobile && mobileChatOpened) {
        document.body.style.cssText = `
          overflow: hidden;
          height: 100vh;
        `;
      } else {
        document.body.style.cssText = ``;
      }
    }, [isMobile, mobileChatOpened]);

    useEffect(
      () => () => {
        document.body.style.cssText = '';
      },
      []
    );

    return isMobile && mobileChatOpened ? (
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
      <SGeneral withChat={withChat}>{children}</SGeneral>
    );
  }
);

export default DashboardLayout;

DashboardLayout.defaultProps = {
  withChat: false,
};

const SWrapper = styled.div`
  position: relative;
  height: 100vh;
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
