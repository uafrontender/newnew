import _ from 'lodash';
import { newnewapi } from 'newnew-api';
import React, { useEffect } from 'react';
import {
  getMe,
  getTutorialsStatus,
  markTutorialStepAsCompleted,
} from '../api/endpoints/user';
import {
  logoutUserClearCookiesAndRedirect,
  setUserData,
  setUserTutorialsProgress,
  setUserTutorialsProgressSynced,
  TUserData,
} from '../redux-store/slices/userStateSlice';

import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { loadStateLS, saveStateLS } from '../utils/localStorage';

const SyncUserWrapper: React.FunctionComponent = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    async function syncUserData() {
      try {
        const payload = new newnewapi.EmptyRequest({});

        const { data } = await getMe(payload);

        if (data?.me) {
          dispatch(
            setUserData({
              username: data.me?.username,
              nickname: data.me?.nickname,
              email: data.me?.email,
              avatarUrl: data.me?.avatarUrl,
              coverUrl: data.me?.coverUrl,
              userUuid: data.me?.userUuid,
              bio: data.me?.bio,
              dateOfBirth: {
                day: data.me?.dateOfBirth?.day,
                month: data.me?.dateOfBirth?.month,
                year: data.me?.dateOfBirth?.year,
              },
              countryCode: data.me?.countryCode,
              usernameChangedAt: data.me.usernameChangedAt,

              options: {
                isActivityPrivate: data.me?.options?.isActivityPrivate,
                isCreator: data.me?.options?.isCreator,
                isVerified: data.me?.options?.isVerified,
                creatorStatus: data.me?.options?.creatorStatus,
                birthDateUpdatesLeft: data.me?.options?.birthDateUpdatesLeft,
                canChangeUsername: data.me?.options?.canChangeUsername,
                isOfferingSubscription: data.me.options?.isOfferingSubscription,
              },
            } as TUserData)
          );
        }
      } catch (err) {
        console.error(err);
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(
            logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired')
          );
        }
      }
    }

    async function syncUserTutorialsProgress(
      localUserTutorialsProgress: newnewapi.IGetTutorialsStatusResponse
    ) {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const { data } = await getTutorialsStatus(payload);
        if (data) {
          if (
            !_.isEqual(data, localUserTutorialsProgress) &&
            localUserTutorialsProgress
          ) {
            const syncedObj: newnewapi.IGetTutorialsStatusResponse = {
              ...data,
            };

            if (
              localUserTutorialsProgress.remainingAcSteps &&
              syncedObj.remainingAcSteps!!.length >
                localUserTutorialsProgress.remainingAcSteps.length
            ) {
              syncedObj.remainingAcSteps =
                localUserTutorialsProgress.remainingAcSteps;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  acCurrentStep:
                    localUserTutorialsProgress.remainingAcSteps!![0],
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              localUserTutorialsProgress.remainingMcSteps &&
              syncedObj.remainingMcSteps!!.length >
                localUserTutorialsProgress.remainingMcSteps.length
            ) {
              syncedObj.remainingMcSteps =
                localUserTutorialsProgress.remainingMcSteps;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  mcCurrentStep:
                    localUserTutorialsProgress.remainingMcSteps!![0],
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              localUserTutorialsProgress.remainingCfSteps &&
              syncedObj.remainingCfSteps!!.length >
                localUserTutorialsProgress.remainingCfSteps.length
            ) {
              syncedObj.remainingCfSteps =
                localUserTutorialsProgress.remainingCfSteps;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  cfCurrentStep:
                    localUserTutorialsProgress.remainingCfSteps!![0],
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              localUserTutorialsProgress.remainingAcCrCurrentStep &&
              syncedObj.remainingAcCrCurrentStep!!.length >
                localUserTutorialsProgress.remainingAcCrCurrentStep.length
            ) {
              syncedObj.remainingAcCrCurrentStep =
                localUserTutorialsProgress.remainingAcCrCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  acCrCurrentStep:
                    localUserTutorialsProgress.remainingAcCrCurrentStep!![0],
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              localUserTutorialsProgress.remainingCfCrCurrentStep &&
              syncedObj.remainingCfCrCurrentStep!!.length >
                localUserTutorialsProgress.remainingCfCrCurrentStep.length
            ) {
              syncedObj.remainingCfCrCurrentStep =
                localUserTutorialsProgress.remainingCfCrCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  cfCrCurrentStep:
                    localUserTutorialsProgress.remainingCfCrCurrentStep!![0],
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              localUserTutorialsProgress.remainingMcCrCurrentStep &&
              syncedObj.remainingMcCrCurrentStep!!.length >
                localUserTutorialsProgress.remainingMcCrCurrentStep.length
            ) {
              syncedObj.remainingMcCrCurrentStep =
                localUserTutorialsProgress.remainingMcCrCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  mcCrCurrentStep:
                    localUserTutorialsProgress.remainingMcCrCurrentStep!![0],
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }
            dispatch(setUserTutorialsProgress(syncedObj));
            saveStateLS('userTutorialsProgress', syncedObj);
          } else {
            dispatch(setUserTutorialsProgress(data));
          }
        }
        dispatch(setUserTutorialsProgressSynced(true));
      } catch (err) {
        console.error(err);
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(
            logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired')
          );
        }
      }
    }

    const localUserTutorialsProgress = loadStateLS(
      'userTutorialsProgress'
    ) as newnewapi.IGetTutorialsStatusResponse;
    if (user.loggedIn) {
      syncUserData();
      syncUserTutorialsProgress(localUserTutorialsProgress);
    } else {
      if (!localUserTutorialsProgress) {
        saveStateLS('userTutorialsProgress', user.userTutorialsProgress);
      }
      if (!_.isEqual(user.userTutorialsProgress, localUserTutorialsProgress)) {
        dispatch(
          setUserTutorialsProgress(
            localUserTutorialsProgress as newnewapi.IGetTutorialsStatusResponse
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  return <>{children}</>;
};

export default SyncUserWrapper;
