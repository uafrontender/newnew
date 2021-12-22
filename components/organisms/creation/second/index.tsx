import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import TextArea from '../../../atoms/creation/TextArea';
import InlineSVG from '../../../atoms/InlineSVG';
import FileUpload from '../../../molecules/creation/FileUpload';
import MobileField from '../../../molecules/creation/MobileField';
import Tabs, { Tab } from '../../../molecules/Tabs';
import MobileFieldBlock from '../../../molecules/creation/MobileFieldBlock';
import TabletFieldBlock from '../../../molecules/creation/TabletFieldBlock';
import DraggableMobileOptions from '../DraggableMobileOptions';

import urltoFile from '../../../../utils/urlToFile';
import useDebounce from '../../../../utils/hooks/useDebounce';
import { getVideoUploadUrl } from '../../../../api/endpoints/upload';
import { minLength, maxLength } from '../../../../utils/validation';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import {
  clearCreation,
  setCreationVideo,
  setCreationTitle,
  setCreationMinBid,
  setCreationChoices,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
  setCreationVideoThumbnails,
  setCreationAllowSuggestions,
  setCreationTargetBackerCount,
} from '../../../../redux-store/slices/creationStateSlice';

import {
  CREATION_TITLE_MIN,
  CREATION_TITLE_MAX,
  CREATION_OPTION_MAX,
  CREATION_OPTION_MIN,
} from '../../../../constants/general';

import closeIcon from '../../../../public/images/svg/icons/outlined/Close.svg';

interface ICreationSecondStepContent {
}

export const CreationSecondStepContent: React.FC<ICreationSecondStepContent> = () => {
  const { t: tCommon } = useTranslation();
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
  const [titleError, setTitleError] = useState('');

  const validateText = useCallback((text: string, min: number, max: number) => {
    let error = minLength(tCommon, text, min);

    if (!error) {
      error = maxLength(tCommon, text, max);
    }

    return error;
  }, [tCommon]);

  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;
  const optionsAreValid = tab !== 'multiple-choice' || multiplechoice.choices.findIndex((item) => validateText(item.text, CREATION_OPTION_MIN, CREATION_OPTION_MAX)) === -1;
  const disabled = !!titleError || !post.title || !post.announcementVideoUrl || !optionsAreValid;

  const validateTitleDebounced = useDebounce(post.title, 500);
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
  const handleVideoUpload = useCallback(async (value) => {
    try {
      const payload = new newnewapi.GetVideoUploadUrlRequest({
        filename: value.name,
      });

      const res = await getVideoUploadUrl(payload);

      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'An error occured');
      }

      const file = await urltoFile(value.url, value.name, value.type);

      const uploadResponse = await fetch(
        res.data.uploadUrl,
        {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': value.type,
          },
        },
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      return res.data;
    } catch (error: any) {
      toast.error(error?.message);
      return false;
    }
  }, []);
  const handleItemFocus = useCallback((key: string) => {
    if (key === 'title') {
      setTitleError('');
    }
  }, []);
  const handleItemBlur = useCallback((key: string, value: string) => {
    if (key === 'title') {
      setTitleError(validateText(value, CREATION_TITLE_MIN, CREATION_TITLE_MAX));
    }
  }, [validateText]);
  const handleItemChange = useCallback(async (key: string, value: any) => {
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
      if (value) {
        const res: any = await handleVideoUpload(value);
        if (res?.publicUrl) {
          dispatch(setCreationVideo(res?.publicUrl));
        }
      } else {
        dispatch(setCreationVideo(''));
      }
    } else if (key === 'thumbnailParameters') {
      dispatch(setCreationVideoThumbnails(value));
    }
  }, [dispatch, handleVideoUpload]);
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

  const getDecisionPart = useCallback(() => (
    <>
      <SItemWrapper>
        <TextArea
          id="title"
          value={post?.title}
          error={titleError}
          onBlur={handleItemBlur}
          onFocus={handleItemFocus}
          onChange={handleItemChange}
          placeholder={t('secondStep.input.placeholder')}
        />
      </SItemWrapper>
      {
        tab === 'multiple-choice' && (
          <>
            <SSeparator margin="16px 0" />
            <DraggableMobileOptions
              id="choices"
              min={2}
              options={multiplechoice.choices}
              onChange={handleItemChange}
              validation={validateText}
            />
            {isMobile && (
              <SSeparator margin="16px 0" />
            )}
          </>
        )
      }
      {
        tab === 'auction' && !isMobile && (
          <>
            <SSeparator margin="16px 0" />
            <SItemWrapper>
              <TabletFieldBlock
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
            </SItemWrapper>
          </>
        )
      }
      {
        tab === 'crowdfunding' && !isMobile && (
          <>
            <SSeparator margin="16px 0" />
            <SItemWrapper>
              <TabletFieldBlock
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
            </SItemWrapper>
          </>
        )
      }
    </>
  ), [
    t,
    tab,
    isMobile,
    titleError,
    post?.title,
    auction?.minimalBid,
    crowdfunding?.targetBackerCount,
    validateText,
    handleItemBlur,
    handleItemFocus,
    handleItemChange,
    multiplechoice.choices,
  ]);
  const getAdvancedPart = useCallback(() => (
    <>
      <SListWrapper>
        {
          tab === 'auction' && isMobile && (
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
          tab === 'crowdfunding' && isMobile && (
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
    </>
  ), [
    t,
    tab,
    isMobile,
    post.startsAt,
    post.expiresAt,
    post.options.commentsEnabled,
    auction.minimalBid,
    crowdfunding.targetBackerCount,
    multiplechoice.options.allowSuggestions,
    expireOptions,
    formatStartsAt,
    formatExpiresAt,
    handleItemChange,
  ]);

  useEffect(() => {
    if (validateTitleDebounced) {
      setTitleError(validateText(validateTitleDebounced, CREATION_TITLE_MIN, CREATION_TITLE_MAX));
    }
  }, [validateText, validateTitleDebounced]);

  return (
    <>
      <div>
        <STabsWrapper>
          <Tabs
            t={t}
            tabs={tabs}
            draggable={false}
            activeTabIndex={activeTabIndex}
            withTabIndicator={isDesktop}
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
            <SItemWrapper noMargin={isDesktop}>
              {!isMobile && (
                <STabletBlockTitle variant={1} weight={700}>
                  {t('secondStep.block.title.file')}
                </STabletBlockTitle>
              )}
              <FileUpload
                id="video"
                value={post.announcementVideoUrl}
                onChange={handleItemChange}
                thumbnails={post.thumbnailParameters}
              />
            </SItemWrapper>
            {isMobile ? getDecisionPart() : (
              <SItemWrapper>
                <TabletFieldWrapper>
                  <STabletBlockTitle variant={1} weight={700}>
                    {t('secondStep.block.title.decision')}
                  </STabletBlockTitle>
                  {getDecisionPart()}
                </TabletFieldWrapper>
              </SItemWrapper>
            )}
            {isMobile ? getAdvancedPart() : (
              <SItemWrapper>
                <TabletFieldWrapper>
                  <STabletBlockTitle variant={1} weight={700}>
                    {t('secondStep.block.title.advanced')}
                  </STabletBlockTitle>
                  {getAdvancedPart()}
                </TabletFieldWrapper>
              </SItemWrapper>
            )}
            {isMobile ? (
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
            ) : (
              <SItemWrapper>
                <STabletButtonsWrapper>
                  <div>
                    <SButton
                      view="secondary"
                      onClick={handleCloseClick}
                    >
                      {t('secondStep.button.cancel')}
                    </SButton>
                  </div>
                  <div>
                    <SButton
                      view="primaryGrad"
                      onClick={handleSubmit}
                      disabled={disabled}
                    >
                      {t('secondStep.button.preview')}
                    </SButton>
                  </div>
                </STabletButtonsWrapper>
              </SItemWrapper>
            )}
          </SLeftPart>
        </SContent>
      </div>
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
    margin-top: 0;
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
    padding: 24px 0;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 40px 0;
    justify-content: flex-start;
  }
`;

interface ISItemWrapper {
  noMargin?: boolean;
}

const SItemWrapper = styled.div<ISItemWrapper>`
  margin-top: ${(props) => (props.noMargin ? 0 : 16)}px;

  ${({ theme }) => theme.media.laptop} {
    margin-top: ${(props) => (props.noMargin ? 0 : 24)}px;
  }
`;

const TabletFieldWrapper = styled.div`
  border: 1px solid ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.outlines1 : 'transparent')};
  padding: 23px;
  overflow: hidden;
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
  border-radius: 16px;
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

  ${({ theme }) => theme.media.tablet} {
    padding: 12px 24px;
  }

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

const STabletButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  justify-content: space-between;
`;

const STabletBlockTitle = styled(Caption)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;
