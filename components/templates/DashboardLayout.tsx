import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useGetChats } from '../../contexts/chatContext';
import { useAppSelector } from '../../redux-store/store';
import General from './General';

interface IChatLayout {
  id?: string;
  className?: string;
  withChat?: boolean;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}
const DashboardLayout: React.FunctionComponent<IChatLayout> = React.memo(
  ({ id, className, containerRef, children, withChat }) => {
    const { resizeMode } = useAppSelector((state) => state.ui);
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
      <SGeneral withChat>{children}</SGeneral>
    );
  }
);

export default DashboardLayout;

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
