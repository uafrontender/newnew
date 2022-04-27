/* eslint-disable react/no-array-index-key */
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Headline from '../../atoms/Headline';

import InlineSvg from '../../atoms/InlineSVG';

// Icons
import ArrowDown from '../../../public/images/svg/icons/outlined/ChevronDown.svg';

const FaqSection: React.FunctionComponent = () => {
  const { t } = useTranslation('subscribe-to-user');

  return (
    <SContainer>
      <SHeadline
        variant={5}
      >
        { t('FAQ.heading') }
      </SHeadline>
      {new Array(5).fill('').map((_, i) => (
        <FaqSectionOption
          key={i}
          question={t(`FAQ.items.${i}.q`)}
          answer={t(`FAQ.items.${i}.a`)}
        />
      ))}
      <SBottomFooter>
        {t('FAQ.helpCenterFooter.text')}
        { ' ' }
        <Link href="/how-it-works">
          <a href="/how-it-works" target="_blank">{t('FAQ.helpCenterFooter.link')}</a>
        </Link>
      </SBottomFooter>
    </SContainer>
  );
};

export default FaqSection;

const SContainer = styled.div`
  margin-bottom: 42px;

  padding-left: 16px !important;
  padding-right: 16px !important;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 60px;

    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 736px;
    margin-left: auto !important;
    margin-right: auto !important;

    padding: 0px 0px !important;
    margin-bottom: 120px;
  }
`;

const SHeadline = styled(Headline)`
  text-align: center;
  margin-bottom: 24px;
`;

const SBottomFooter = styled.div`
  margin-top: 16px;
  padding-bottom: 16px;

  text-align: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;


  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  a {
    font-weight: 600;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover, &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: .2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;

interface IFaqSectionOption {
  question: string;
  answer: string;
}

const FaqSectionOption: React.FunctionComponent<IFaqSectionOption> = ({
  question,
  answer,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SFaqSectionOption>
      <SQuestionDiv
        onClick={() => setIsOpen(!isOpen)}
      >
        <Text
          variant={2}
        >
          {question}
        </Text>
        <SInlineSVG
          svg={ArrowDown}
          fill={!isOpen ? theme.colorsThemed.text.secondary : theme.colorsThemed.text.tertiary}
          width="24px"
          height="24px"
          focused={isOpen}
        />
      </SQuestionDiv>
      <SAnswerDiv
        isOpen={isOpen}
      >
        <Text
          variant={2}
        >
          {answer}
        </Text>
      </SAnswerDiv>
    </SFaqSectionOption>
  );
};

const SFaqSectionOption = styled.div`
  overflow: hidden;

  width: 100%;

  padding: 18px 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 12px;
`;

const SQuestionDiv = styled.div`
  display: flex;

  justify-content: space-between;

  margin-bottom: 8px;

  cursor: pointer;
`;

const SInlineSVG = styled(InlineSvg)<{
  focused: boolean;
}>`

  transform: ${({ focused }) => (focused ? 'rotate(180deg)' : 'unset')};

`;

const SAnswerDiv = styled.div<{
  isOpen: boolean;
}>`
  div {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};

    line-height: 18px;
  }

  max-height: ${({ isOpen }) => (isOpen ? '100%' : 0)};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transition: .2s linear;
`;
