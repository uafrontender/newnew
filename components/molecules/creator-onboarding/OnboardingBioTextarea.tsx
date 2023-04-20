import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';
import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../../atoms/AnimatedPresence';

type TOnboardingBioTextarea = React.ComponentPropsWithoutRef<'textarea'> & {
  maxChars: number;
  isValid: boolean;
  errorCaption: string;
};

const OnboardingBioTextarea: React.FunctionComponent<
  TOnboardingBioTextarea
> = ({ maxChars, value, isValid, errorCaption, onChange, ...rest }) => {
  const { t } = useTranslation('page-CreatorOnboarding');
  const [charCounter, setCharCounter] = useState((value as string).length);

  const [errorBordersShown, setErrorBordersShown] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    if (isValid) setErrorBordersShown(false);
  }, [focused, isValid]);

  useEffect(() => {
    setCharCounter((value as string).length);
  }, [value, setCharCounter]);

  return (
    <SWrapper>
      <SLabelDiv>
        <div>{t('aboutSection.bio.title')}</div>
        <SCharCounter>
          {charCounter}/{maxChars}
        </SCharCounter>
      </SLabelDiv>
      <SOnboardingBioTextareaDiv>
        <textarea
          id='bio-input'
          value={value}
          maxLength={maxChars}
          onChange={(e) => {
            if (onChange && e.target.value.length <= maxChars) {
              onChange(e);
            }
          }}
          onPaste={(e) => {
            const data = e.clipboardData.getData('Text');

            if (!data || data.length > maxChars) {
              e.preventDefault();
            }
          }}
          onBlur={() => {
            setFocused(false);
            if (!isValid) {
              setErrorBordersShown(true);
            } else {
              setErrorBordersShown(false);
            }
          }}
          onFocus={() => {
            setFocused(true);
            setErrorBordersShown(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (value as string)?.length > 0) {
              const localValue = value as string;
              if (localValue.charCodeAt(localValue.length - 1) === 10) {
                onChange?.({
                  target: {
                    value: localValue.slice(0, -1),
                  },
                } as any);
              }
            }
          }}
          {...rest}
        />
      </SOnboardingBioTextareaDiv>
      {errorBordersShown ? (
        <AnimatedPresence animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={AlertIcon} width='16px' height='16px' />
            {errorCaption}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </SWrapper>
  );
};

export default OnboardingBioTextarea;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const SLabelDiv = styled.div`
  display: flex;
  justify-content: space-between;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

const SCharCounter = styled.div``;

interface ISOnboardingBioTextareaDiv {
  errorBordersShown?: boolean;
}

const SOnboardingBioTextareaDiv = styled.div<ISOnboardingBioTextareaDiv>`
  position: relative;

  display: flex;

  textarea {
    display: block;

    width: 100%;
    height: 104px;

    padding: 12px 20px 12px 20px;
    padding-bottom: 36px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        return 'transparent';
      }
      return theme.colorsThemed.accent.error;
    }};

    color: ${({ theme }) => theme.colorsThemed.text.primary};
    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

    resize: none;

    &::placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
    &:-ms-input-placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
    &::-ms-input-placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }

    &:hover:enabled,
    &:focus:enabled,
    &:active:enabled {
      outline: none;

      border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
    }

    &:disabled {
      opacity: 0.5;
    }

    ${({ theme }) => theme.media.tablet} {
      height: 120px;
    }
  }
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  margin-top: 6px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;
