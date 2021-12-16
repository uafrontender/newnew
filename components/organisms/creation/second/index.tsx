import React, { useMemo, useCallback } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../../../atoms/Button';
import TextArea from '../../../atoms/creation/TextArea';
import InlineSVG from '../../../atoms/InlineSVG';
import FileUpload from '../../../molecules/creation/FileUpload';
import MobileField from '../../../molecules/creation/MobileField';
import Tabs, { Tab } from '../../../molecules/Tabs';
import MobileFieldBlock from '../../../molecules/creation/MobileFieldBlock';
import DraggableMobileOptions from '../DraggableMobileOptions';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import {
  clearCreation,
  setCreationTitle,
  setCreationMinBid,
  setCreationChoices,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
  setCreationAllowSuggestions,
  setCreationTargetBackerCount,
} from '../../../../redux-store/slices/creationStateSlice';

import closeIcon from '../../../../public/images/svg/icons/outlined/Close.svg';

interface ICreationSecondStepContent {
  video: any;
  setVideo: (video: any) => void;
}

export const CreationSecondStepContent: React.FC<ICreationSecondStepContent> = (props) => {
  const {
    video,
    setVideo,
  } = props;
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    post,
    auction,
    crowdfunding,
    multiplechoice,
  } = useAppSelector((state) => state.creation);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { query: { tab } } = router;
  const tabs: Tab[] = useMemo(() => [
    {
      nameToken: 'auction',
      url: '/creation/auction',
    },
    {
      nameToken: 'multiple-choice',
      url: '/creation/multiple-choice',
    },
    {
      nameToken: 'crowdfunding',
      url: '/creation/crowdfunding',
    },
  ], []);
  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const titleIsValid = post.title.length > 5 && post.title.length < 70;
  const optionsAreValid = tab !== 'multiple-choice' || multiplechoice.choices.findIndex((item) => item.text.length === 0) === -1;
  const disabled = !titleIsValid || !video.name || !optionsAreValid;

  const formatStartsAt = useCallback(() => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);

    return moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());
  }, [post.startsAt]);
  const formatExpiresAt = useCallback(() => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);
    const dateValue = moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());

    if (post.expiresAt === '1-hour') {
      dateValue.add(1, 'h');
    } else if (post.expiresAt === '6-hours') {
      dateValue.add(6, 'h');
    } else if (post.expiresAt === '12-hours') {
      dateValue.add(12, 'h');
    } else if (post.expiresAt === '1-day') {
      dateValue.add(1, 'd');
    } else if (post.expiresAt === '3-days') {
      dateValue.add(3, 'd');
    } else if (post.expiresAt === '5-days') {
      dateValue.add(5, 'd');
    } else if (post.expiresAt === '7-days') {
      dateValue.add(7, 'd');
    }

    return dateValue;
  }, [post.expiresAt, post.startsAt]);
  const handleSubmit = useCallback(async () => {
    router.push(`/creation/${tab}/preview`);
  }, [tab, router]);
  const handleCloseClick = useCallback(() => {
    if (router.query?.referer) {
      router.push(router.query.referer as string);
    } else {
      router.push('/');
    }
    dispatch(clearCreation({}));
  }, [dispatch, router]);
  const handleItemChange = useCallback((key: string, value: any) => {
    if (key === 'title') {
      dispatch(setCreationTitle(value));
    } else if (key === 'minimalBid') {
      dispatch(setCreationMinBid(value));
    } else if (key === 'comments') {
      dispatch(setCreationComments(value));
    } else if (key === 'allowSuggestions') {
      dispatch(setCreationAllowSuggestions(value));
    } else if (key === 'expiresAt') {
      dispatch(setCreationExpireDate(value));
    } else if (key === 'startsAt') {
      dispatch(setCreationStartDate(value));
    } else if (key === 'targetBackerCount') {
      dispatch(setCreationTargetBackerCount(value));
    } else if (key === 'choices') {
      dispatch(setCreationChoices(value));
    } else if (key === 'video') {
      setVideo(value);
    }
  }, [dispatch, setVideo]);
  const expireOptions = useMemo(() => [
    {
      id: '1-hour',
      title: t('secondStep.field.expiresAt.options.1-hour'),
    },
    {
      id: '6-hours',
      title: t('secondStep.field.expiresAt.options.6-hours'),
    },
    {
      id: '12-hours',
      title: t('secondStep.field.expiresAt.options.12-hours'),
    },
    {
      id: '1-day',
      title: t('secondStep.field.expiresAt.options.1-day'),
    },
    {
      id: '3-days',
      title: t('secondStep.field.expiresAt.options.3-days'),
    },
    {
      id: '5-days',
      title: t('secondStep.field.expiresAt.options.5-days'),
    },
    {
      id: '7-days',
      title: t('secondStep.field.expiresAt.options.7-days'),
    },
  ], [t]);

  return (
    <>
      <div>
        <STabsWrapper>
          <Tabs
            t={t}
            tabs={tabs}
            draggable={false}
            activeTabIndex={activeTabIndex}
            withTabIndicator={!isMobile && resizeMode !== 'tablet'}
          />
          {isMobile && (
            <SCloseIconWrapper>
              <InlineSVG
                clickable
                svg={closeIcon}
                fill={theme.colorsThemed.text.secondary}
                width="24px"
                height="24px"
                onClick={handleCloseClick}
              />
            </SCloseIconWrapper>
          )}
        </STabsWrapper>
        <SContent>
          <SLeftPart>
            <SItemWrapper>
              <FileUpload
                id="video"
                value={video}
                onChange={handleItemChange}
              />
            </SItemWrapper>
            {isMobile && (
              <SItemWrapper>
                <TextArea
                  id="title"
                  value={post?.title}
                  onChange={handleItemChange}
                  placeholder={t('secondStep.input.placeholder')}
                />
              </SItemWrapper>
            )}
            {
              tab === 'multiple-choice' && (
                <>
                  <SSeparator margin="16px 0" />
                  <DraggableMobileOptions
                    id="choices"
                    min={2}
                    options={multiplechoice.choices}
                    onChange={handleItemChange}
                  />
                  <SSeparator margin="16px 0" />
                </>
              )
            }
            <SListWrapper>
              {
                tab === 'auction' && (
                  <SFieldWrapper>
                    <MobileFieldBlock
                      id="minimalBid"
                      type="input"
                      value={auction.minimalBid}
                      onChange={handleItemChange}
                      formattedDescription={auction.minimalBid}
                      inputProps={{
                        min: 5,
                        type: 'number',
                        pattern: '[0-9]*',
                      }}
                    />
                  </SFieldWrapper>
                )
              }
              {
                tab === 'crowdfunding' && (
                  <SFieldWrapper>
                    <MobileFieldBlock
                      id="targetBackerCount"
                      type="input"
                      value={crowdfunding.targetBackerCount}
                      onChange={handleItemChange}
                      formattedDescription={crowdfunding.targetBackerCount}
                      inputProps={{
                        min: 1,
                        type: 'number',
                        pattern: '[0-9]*',
                      }}
                    />
                  </SFieldWrapper>
                )
              }
              <SFieldWrapper>
                <MobileFieldBlock
                  id="expiresAt"
                  type="select"
                  value={post.expiresAt}
                  options={expireOptions}
                  onChange={handleItemChange}
                  formattedValue={t(`secondStep.field.expiresAt.options.${post.expiresAt}`)}
                  formattedDescription={formatExpiresAt()
                    .format('DD MMM [at] hh:mm A')}
                />
              </SFieldWrapper>
              <SFieldWrapper>
                <MobileFieldBlock
                  id="startsAt"
                  type="date"
                  value={post.startsAt}
                  onChange={handleItemChange}
                  formattedValue={t(`secondStep.field.startsAt.modal.type.${post.startsAt?.type}`)}
                  formattedDescription={formatStartsAt()
                    .format('DD MMM [at] hh:mm A')}
                />
              </SFieldWrapper>
            </SListWrapper>
            <SSeparator />
            {tab === 'multiple-choice' && (
              <SMobileFieldWrapper>
                <MobileField
                  id="allowSuggestions"
                  type="toggle"
                  value={multiplechoice.options.allowSuggestions}
                  onChange={handleItemChange}
                />
              </SMobileFieldWrapper>
            )}
            <MobileField
              id="comments"
              type="toggle"
              value={post.options.commentsEnabled}
              onChange={handleItemChange}
            />
          </SLeftPart>
        </SContent>
      </div>
      {isMobile && (
        <SButtonWrapper>
          <SButtonContent>
            <SButton
              view="primaryGrad"
              onClick={handleSubmit}
              disabled={disabled}
            >
              {t('secondStep.button.preview')}
            </SButton>
          </SButtonContent>
        </SButtonWrapper>
      )}
    </>
  );
};

export default CreationSecondStepContent;

const SContent = styled.div`
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    flex-direction: column;
  }
`;

const SLeftPart = styled.div`
  flex: 1;

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const STabsWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 16px 0;
  position: relative;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    padding: 18px 0;
  }

  ${({ theme }) => theme.media.laptop} {
    justify-content: flex-start;
  }
`;

const SItemWrapper = styled.div`
  margin-top: 16px;
`;

interface ISSeparator {
  margin?: string;
}

const SSeparator = styled.div<ISSeparator>`
  width: 100%;
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin: ${(props) => props.margin || '8px 0 16px 0'};
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
`;

const SListWrapper = styled.div`
  left: -8px;
  width: calc(100% + 16px);
  display: flex;
  position: relative;
  flex-wrap: wrap;
  margin-top: 8px;
  flex-direction: row;
`;

const SFieldWrapper = styled.div`
  width: calc(50% - 16px);
  margin: 8px;
`;

const SMobileFieldWrapper = styled.div`
  margin-bottom: 16px;
`;

const SButtonWrapper = styled.div`
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 5;
  display: flex;
  padding: 24px 16px;
  position: fixed;
  background: ${(props) => props.theme.gradients.creationSubmit};
`;

const SButtonContent = styled.div`
  width: 100%;
`;

const SCloseIconWrapper = styled.div`
  top: 50%;
  right: 0;
  z-index: 10;
  position: absolute;
  transform: translateY(-50%);
`;
