import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { setUserData } from '../../../../redux-store/slices/userStateSlice';
import {
  getMyCreatorTags,
  getMyOnboardingState,
} from '../../../../api/endpoints/user';

import RadioIcon from '../../../../public/images/svg/icons/filled/Radio.svg';
import InlineSvg from '../../../atoms/InlineSVG';

interface IFunctionProps {
  todosCompleted: (value: boolean) => void;
  todosCompletedLoading: (value: boolean) => void;
}

export const YourTodos: React.FC<IFunctionProps> = ({
  todosCompleted,
  todosCompletedLoading,
}) => {
  const { t } = useTranslation('creator');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [allCompleted, setAllcompleted] = useState<boolean | null>(null);
  const [currentTags, setCurrentTags] = useState<newnewapi.ICreatorTag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);

  const isProfileComplete = useCallback(() => {
    if (
      user.userData?.bio &&
      user.userData?.bio !== null &&
      user.userData?.bio.length > 0 &&
      currentTags.length > 0
    ) {
      return true;
    }
    return false;
  }, [user.userData?.bio, currentTags]);

  const collection = useMemo(
    () => [
      {
        id: 'sign-up',
        title: t('dashboard.todos.sign-up'),
        completed: true,
      },
      {
        id: 'basic-info',
        title: t('dashboard.todos.basic-info'),
        completed: true,
      },
      {
        id: 'complete-profile',
        title: t('dashboard.todos.complete-profile'),
        completed: isProfileComplete(),
      },
      {
        id: 'add-cashout-method',
        title: t('dashboard.todos.add-cashout-method'),
        completed: user.userData?.options?.creatorStatus === 2,
      },
    ],
    [t, user.userData?.options?.creatorStatus, isProfileComplete]
  );

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data?.isCreatorConnectedToStripe) {
          dispatch(
            setUserData({
              options: {
                ...user.userData?.options,
                creatorStatus: 2,
              },
            })
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchCreatorTags() {
      try {
        const myTagsPayload = new newnewapi.EmptyRequest({});
        const tagsRes = await getMyCreatorTags(myTagsPayload);

        if (tagsRes.data) {
          setCurrentTags(tagsRes.data.tags);
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function checkAndLoad() {
      if (!allCompleted && !isLoading) {
        todosCompletedLoading(true);
        setIsLoading(true);
        if (user.userData?.options?.creatorStatus !== 2) {
          await fetchOnboardingState();
        }
        if (currentTags.length < 1) {
          await fetchCreatorTags();
        }
        todosCompletedLoading(false);
        setIsLoading(false);
      }
    }

    checkAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dispatch, currentTags, allCompleted]);

  useEffect(() => {
    if (!allCompleted && isLoading === false) {
      let done = true;
      collection.forEach((item) => {
        if (!item.completed) done = false;
      });
      setAllcompleted(done);
      todosCompleted(done);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, allCompleted, todosCompleted, isLoading]);

  const renderItem = useCallback(
    (item, index) => (
      <SListItem key={item.id} completed={item.completed} isFirst={index === 0}>
        <SItemText>
          <SBullet completed={item.completed}>
            {item.completed ? (
              <InlineSvg svg={RadioIcon} width='8' height='8' fill='#fff' />
            ) : (
              <InlineSvg
                svg={RadioIcon}
                width='8'
                height='8'
                fill={theme.name === 'light' ? '#1B1C27' : '#fff'}
              />
            )}
          </SBullet>
          <SItemTitle>
            {item.title}
            {!item.completed && <SRequired>*</SRequired>}
          </SItemTitle>
        </SItemText>
        {!item.completed && item.id === 'complete-profile' && (
          <SBottomActionButton
            withDim
            withShrink
            view='primaryGrad'
            onClick={() => router.push('/creator-onboarding-about')}
          >
            {t('dashboard.todos.complete-profile-btn')}
          </SBottomActionButton>
        )}
        {!item.completed && item.id === 'add-cashout-method' && (
          <SBottomActionButton
            withDim
            withShrink
            view='primaryGrad'
            onClick={() => router.push('/creator/get-paid')}
          >
            {t('dashboard.todos.add-cashout-method-btn')}
          </SBottomActionButton>
        )}
      </SListItem>
    ),
    [t, router, theme.name]
  );
  return allCompleted === false && !isLoading ? (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.todos.title')}</STitle>
      </SHeaderLine>
      <SDescription variant={3} weight={600}>
        {t('dashboard.todos.subtitle')}
        <SList>{collection.map(renderItem)}</SList>
      </SDescription>
    </SContainer>
  ) : null;
};

export default YourTodos;

const SContainer = styled.div`
  left: -16px;
  width: calc(100% + 32px);
  padding: 16px;
  display: flex;
  position: relative;
  background: ${(props) => props.theme.colors.white};
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: unset;
    width: 100%;
    padding: 20px 24px 24px;
    border-radius: 16px;
    background: ${(props) =>
      props.theme.name === 'light' ? '#14151F' : props.theme.colors.white};
  }
`;

const STitle = styled(Headline)`
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : '#2C2C33'};
  font-weight: 600;
`;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SList = styled.div`
  font-size: 14px;
  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;

interface ISListItem {
  completed: boolean;
  isFirst: boolean;
}
const SListItem = styled.div<ISListItem>`
  padding: 16px;
  display: flex;
  ${(props) => {
    if (!props.isFirst) {
      return css`
          border-top: 1px solid ${() =>
            props.theme.name === 'light' ? '#272835' : '#E5E9F1'};
        }
      `;
    }
    return css``;
  }}

  ${(props) => {
    if (props.completed) {
      return css`
          color: ${() =>
            props.theme.name === 'light' ? '#586070' : '#B3BBCA'};
          text-decoration:line-through;
        }
      `;
    }
    return css`
      color: ${() =>
        props.theme.name === 'light' ? props.theme.colors.white : '#2C2C33'};
    `;
  }}
`;

const SItemText = styled.div`
  padding: 12px 10px 12px 0;
  display: flex;
`;

interface ISBullet {
  completed: boolean;
}
const SBullet = styled.div<ISBullet>`
  border-radius: 50%;
  display: flex;
  width: 18px;
  height: 18px;
  justify-content: center;
  ${(props) => {
    if (props.completed) {
      return css`
          background: #12A573;
        }
      `;
    }
    return css`
      background: ${() =>
        props.theme.name === 'light' ? '#2C2C33' : '#B3BBCA'};
    `;
  }}
`;

const SRequired = styled.span`
  color: ${(props) => props.theme.colorsThemed.accent.error};
  font-size: 24px;
  margin: -20px 0 0 3px;
  display: inline-block;
`;

const SItemTitle = styled.div`
  margin-left: 11px;
  white-space: nowrap;
  ${(props) => props.theme.media.tablet} {
    margin-left: 15px;
  }
`;

const SBottomActionButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  margin-left: auto;
  flex-shrink: 0;
`;
