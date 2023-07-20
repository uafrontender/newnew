import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAppState } from '../../../contexts/appStateContext';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import Modal from '../../organisms/Modal';
import TermsOfServiceHtml from './TermsOfServiceHtml';

interface ITermsOfServiceModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
}

const TermsOfServiceModal: React.FunctionComponent<ITermsOfServiceModal> = ({
  isOpen,
  zIndex,
  onClose,
}) => {
  const { t } = useTranslation('page-CreatorOnboarding');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [shadowTop, setShadowTop] = useState(false);
  const [shadowBottom, setShadowBottom] = useState(!isMobile);

  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) {
        return;
      }

      const isScrolledToTop = (containerRef.current.scrollTop ?? 0) < 10;
      const isScrolledToBottom =
        (containerRef.current.scrollTop ?? 0) +
          (containerRef.current.clientHeight ?? 0) >=
        (containerRef.current.scrollHeight ?? 0);

      if (!isScrolledToTop) {
        setShadowTop(true);
      } else {
        setShadowTop(false);
      }

      if (!isScrolledToBottom) {
        setShadowBottom(true);
      } else {
        setShadowBottom(false);
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);

    return () =>
      containerRef.current?.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  return (
    <Modal show={isOpen} additionalz={zIndex}>
      <Container>
        <Content>
          <SHeading variant={5}>{t('tosSection.heading')}</SHeading>
          <SSubheading variant={1} weight={600}>
            {t('tosSection.subheading')}
          </SSubheading>
          <SContainer>
            {!isMobile && (
              <SShadowTop
                style={{
                  opacity: shadowTop ? 1 : 0,
                }}
              />
            )}
            {!isMobile && (
              <SShadowBottom
                style={{
                  opacity: shadowBottom ? 1 : 0,
                }}
              />
            )}
            <STosText
              ref={(el) => {
                containerRef.current = el!!;
              }}
              dangerouslySetInnerHTML={{
                __html: TermsOfServiceHtml,
              }}
            />
          </SContainer>
          <SButton onClick={() => onClose()}>{t('tosSection.close')}</SButton>
        </Content>
      </Container>
    </Modal>
  );
};
export default TermsOfServiceModal;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  width: 688px;
  height: 733px;
  max-width: 100%;
  max-height: 95%;
  padding: 40px 0px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  margin: 16px;
  flex-direction: column;
  background-color: ${({ theme }) =>
    theme.colorsThemed.background.backgroundCookie};
`;

const SContainer = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
`;

const SHeading = styled(Headline)`
  padding: 0 40px;
`;

const SSubheading = styled(Caption)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  font-size: 14px;

  padding: 0 40px;
  margin-top: 4px;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 8px;
    margin-bottom: 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 8px;
    margin-bottom: 40px;
  }
`;

const SShadowTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 0px;

  z-index: 1;
  box-shadow: 0px 0px 32px 40px
    ${({ theme }) =>
      theme.name === 'dark' ? 'rgba(27, 28, 39, 1)' : '#ffffff'};
  clip-path: inset(0px 0px -100px 0px);

  transition: linear 0.2s;
`;

const SShadowBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 0px;

  z-index: 1;
  box-shadow: 0px 0px 32px 40px
    ${({ theme }) =>
      theme.name === 'dark' ? 'rgba(27, 28, 39, 1)' : '#ffffff'};
  clip-path: inset(-100px 0px 0px 0px);

  transition: linear 0.2s;
`;

const STosText = styled.div`
  h1,
  ul,
  blockquote,
  li,
  p {
    margin-bottom: 16px;
  }

  ol[type='a'] {
    padding-left: 20px;
  }
  ol {
    ol {
      padding-left: 30px;
    }
  }
  ul.list {
    padding-left: 16px;
  }
  a {
    text-decoration: underline;
  }

  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  padding: 0 40px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.tablet} {
    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }

    scrollbar-width: none;
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
      margin-bottom: 16px;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }

    &:hover {
      scrollbar-width: thin;
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
`;

const SButton = styled(Button)`
  width: 83px;
  height: 48px;
  margin: auto;
  margin-top: 22px;
  flex-shrink: 0;
`;
