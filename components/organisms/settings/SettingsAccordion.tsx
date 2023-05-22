/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion, Variants } from 'framer-motion';

import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';

import ChevronDown from '../../../public/images/svg/icons/outlined/ChevronDown.svg';

export type AccordionSectionItem = React.FunctionComponent & {
  isDimmed?: boolean;
  handleSetActive?: () => void;
};

export interface AccordionSection {
  id: string;
  title: string;
  content: ReactElement;
}

interface ISettingsAccordion {
  sections: AccordionSection[];
}

const SettingsAccordion: React.FunctionComponent<ISettingsAccordion> = ({
  sections,
}) => {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState(-1);
  const [sectionsState, setSectionsState] = useState(
    Array(sections.length).fill(false)
  );
  const sectionsRefs = useRef<HTMLDivElement[]>(Array(sections.length));

  const handleToggleSection = (idx: number) => {
    setSectionsState((sectionS) => {
      const temp = [...sectionS];
      temp[idx] = !temp[idx];
      return temp;
    });
    setActiveSection(-1);
  };

  useEffect(() => {
    if (sectionsState.findIndex((st) => st === true) === -1) {
      setActiveSection(-1);
    }
  }, [sectionsState, setActiveSection]);

  return (
    <SSettingsAccrodionContainer>
      {sections &&
        sections.map((section, i) => (
          <SSettingsAccordionItem
            active={i === activeSection}
            isDimmed={activeSection !== -1 && activeSection !== i}
            key={section.title}
            ref={(el) => {
              sectionsRefs.current[i] = el!!;
            }}
          >
            <SSettingsAccordionItemHeading
              id={section.id}
              isOpen={sectionsState[i]}
              onClick={() => handleToggleSection(i)}
            >
              <SHeadline variant={6}>{section.title}</SHeadline>
              <SInlineSvg
                svg={ChevronDown}
                isOpen={sectionsState[i]}
                fill={theme.colorsThemed.text.secondary}
                width='24px'
                height='24px'
              />
            </SSettingsAccordionItemHeading>
            <SSettingsAccordionItemContent
              variants={variantsAccordionItemContent}
              initial={sectionsState[i] ? 'open' : 'collapsed'}
              animate={sectionsState[i] ? 'open' : 'collapsed'}
            >
              {React.cloneElement(section.content, {
                handleSetActive: () => setActiveSection(i),
              })}
            </SSettingsAccordionItemContent>
          </SSettingsAccordionItem>
        ))}
    </SSettingsAccrodionContainer>
  );
};

export default SettingsAccordion;

const SSettingsAccrodionContainer = styled.div`
  overflow: hidden;
`;

const SSettingsAccordionItem = styled.div<{
  isDimmed: boolean;
  active: boolean;
}>`
  width: 100%;

  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};

  opacity: ${({ isDimmed }) => (isDimmed ? 0.5 : 1)};

  transition: opacity 0.2s linear;

  &:first-child > button {
    padding-top: 4px;
  }

  ${({ theme }) => theme.media.laptop} {
    &:first-child > button {
      padding-top: 0;
    }
  }
`;

const SSettingsAccordionItemHeading = styled.button<{
  isOpen: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  padding: 22px 0px;

  outline: none;
  border: none;
  background: transparent;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ isOpen }) => (isOpen ? '34px 0px' : '28px 0px')};
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 34px 0px;
  }
`;

const SHeadline = styled(Headline)({
  fontWeight: 600,
});

const SInlineSvg = styled(InlineSvg)<{
  isOpen: boolean;
}>`
  svg {
    transform: ${({ isOpen }) => (isOpen ? 'rotate(-180deg)' : 'unset')};
    transition: 0.2s linear;
  }
`;

const variantsAccordionItemContent: Variants = {
  open: {
    height: 'auto',
    visibility: 'visible',
    opacity: 1,
  },
  collapsed: {
    height: 0,
    visibility: 'hidden',
    opacity: 0,
    transition: {
      opacity: {
        duration: 0,
      },
    },
  },
};

const SSettingsAccordionItemContent = styled(motion.div)``;
