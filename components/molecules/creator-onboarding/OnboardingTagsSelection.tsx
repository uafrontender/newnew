import React from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';

import DeleteIcon from '../../../public/images/svg/icons/filled/Delete.svg';

interface IOnboardingTagsSelection {
  selectedTags: newnewapi.ICreatorTag[];
  availableTags: newnewapi.ICreatorTag[];
  handleAddTag: (tag: newnewapi.ICreatorTag) => void;
  handleRemoveTag: (tag: newnewapi.ICreatorTag) => void;
}

const OnboardingTagsSelection: React.FunctionComponent<IOnboardingTagsSelection> =
  ({ selectedTags, availableTags, handleAddTag, handleRemoveTag }) => {
    const { t } = useTranslation('creator-onboarding');

    return (
      <SContainer>
        <SLabel>{t('AboutSection.tags.title')}</SLabel>
        <STagsContainer>
          {availableTags &&
            availableTags.map((tag) => (
              <STag
                key={tag.id?.toString()}
                selected={
                  selectedTags.findIndex(
                    (i) => i.id?.toString() === tag.id?.toString()
                  ) !== -1
                }
                onClick={() => {
                  if (
                    selectedTags.findIndex(
                      (i) => i.id?.toString() === tag.id?.toString()
                    ) !== -1
                  ) {
                    handleRemoveTag(tag);
                  } else {
                    handleAddTag(tag);
                  }
                }}
              >
                <div>{tag.title}</div>
                {selectedTags.findIndex(
                  (i) => i.id?.toString() === tag.id?.toString()
                ) !== -1 && (
                  <InlineSvg
                    svg={DeleteIcon}
                    width='16px'
                    height='16px'
                    fill='#fff'
                  />
                )}
              </STag>
            ))}
        </STagsContainer>
      </SContainer>
    );
  };

export default OnboardingTagsSelection;

const SContainer = styled.div``;

const SLabel = styled.label`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

const STagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const STag = styled.button<{
  selected: boolean;
}>`
  display: flex;
  gap: 4px;

  padding: 8px 16px;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme, selected }) =>
    selected
      ? theme.colorsThemed.accent.blue
      : theme.colorsThemed.background.secondary};

  color: ${({ theme, selected }) =>
    selected ? '#fff' : theme.colorsThemed.text.primary};

  cursor: pointer;
  transition: 0.2s linear;

  svg {
    opacity: 0.5;
  }
`;
