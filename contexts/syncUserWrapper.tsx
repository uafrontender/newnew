import _ from 'lodash';
import { newnewapi } from 'newnew-api';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  getMe,
  getMyOnboardingState,
  getTutorialsStatus,
  markTutorialStepAsCompleted,
} from '../api/endpoints/user';
import {
  logoutUserClearCookiesAndRedirect,
  setUserData,
  setCreatorData,
  setUserTutorialsProgress,
  setUserTutorialsProgressSynced,
  TUserData,
} from '../redux-store/slices/userStateSlice';

import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';
import { loadStateLS, removeStateLS, saveStateLS } from '../utils/localStorage';

interface ISyncUserWrapper {
  children: React.ReactNode;
}

const SyncUserWrapper: React.FunctionComponent<ISyncUserWrapper> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const socketConnection = useContext(SocketContext);
  const [creatorDataSteps, setCreatorDataSteps] = useState(0);
  const userWasLoggedIn = useRef(false);

  const updateCreatorDataSteps = useCallback(
    () => setCreatorDataSteps((curr) => curr + 1),
    []
  );

  // When user logs out, clear the state
  // Don't clean localhost in tests
  useEffect(() => {
    if (
      userWasLoggedIn.current &&
      !user.loggedIn &&
      process.env.NEXT_PUBLIC_ENVIRONMENT !== 'test'
    ) {
      setCreatorDataSteps(0);
      removeStateLS('userTutorialsProgress');
      userWasLoggedIn.current = false;
    }

    if (user.loggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [user.loggedIn]);

  useEffect(() => {
    if (creatorDataSteps === 1) {
      dispatch(
        setCreatorData({
          isLoaded: true,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorDataSteps]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (
      !user.creatorData?.options.isCreatorConnectedToStripe &&
      user.creatorData?.options.stripeConnectStatus ===
        newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus.PROCESSING &&
      socketConnection
    ) {
      const handlerStripeAccountChanged = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.StripeAccountChanged.decode(arr);
        if (!decoded) return;
        if (decoded.isActive) {
          const payload = new newnewapi.EmptyRequest({});
          const res = await getMyOnboardingState(payload);

          if (res.data) {
            dispatch(
              setCreatorData({
                options: {
                  ...user.creatorData?.options,
                  ...res.data,
                },
              })
            );
          }
        }
      };

      if (socketConnection) {
        socketConnection.on(
          'StripeAccountChanged',
          handlerStripeAccountChanged
        );
      }

      return () => {
        if (socketConnection && socketConnection.connected) {
          socketConnection.off(
            'StripeAccountChanged',
            handlerStripeAccountChanged
          );
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user.creatorData?.options?.isCreatorConnectedToStripe,
    user.creatorData?.options?.stripeConnectStatus,
    user.creatorData?.options,
    socketConnection,
  ]);

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
              genderPronouns: data.me.genderPronouns,
              phoneNumber: data.me.phoneNumber,

              options: {
                isActivityPrivate: data.me?.options?.isActivityPrivate,
                isCreator: data.me?.options?.isCreator,
                isVerified: data.me?.options?.isVerified,
                creatorStatus: data.me?.options?.creatorStatus,
                birthDateUpdatesLeft: data.me?.options?.birthDateUpdatesLeft,
                isOfferingBundles: data.me.options?.isOfferingBundles,
                isPhoneNumberConfirmed: data.me.options?.isPhoneNumberConfirmed,
                isWhiteListed: data.me.options?.isWhiteListed,
              },
            } as TUserData)
          );
        }
        if (data?.me?.options?.isCreator) {
          try {
            const getMyOnboardingStatePayload = new newnewapi.EmptyRequest({});
            const res = await getMyOnboardingState(getMyOnboardingStatePayload);

            if (res.data) {
              dispatch(
                setCreatorData({
                  options: {
                    ...user.creatorData?.options,
                    ...res.data,
                  },
                })
              );
            }
            updateCreatorDataSteps();
          } catch (err) {
            console.error(err);
            updateCreatorDataSteps();
          }
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
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
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
              syncedObj.remainingAcSteps &&
              syncedObj.remainingAcSteps.length >
                localUserTutorialsProgress.remainingAcSteps.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingAcSteps.length > 0 &&
                localUserTutorialsProgress.remainingAcSteps[
                  localUserTutorialsProgress.remainingAcSteps.length - 1
                ] !== newnewapi.AcTutorialStep.AC_TEXT_FIELD;

              if (!wrongLocalData) {
                syncedObj.remainingAcSteps =
                  localUserTutorialsProgress.remainingAcSteps;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    acCurrentStep: localUserTutorialsProgress
                      .remainingAcSteps[0]
                      ? localUserTutorialsProgress.remainingAcSteps[0]
                      : newnewapi.AcTutorialStep.AC_TEXT_FIELD,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            if (
              localUserTutorialsProgress.remainingMcSteps &&
              syncedObj.remainingMcSteps &&
              syncedObj.remainingMcSteps.length >
                localUserTutorialsProgress.remainingMcSteps.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingMcSteps.length > 0 &&
                localUserTutorialsProgress.remainingMcSteps[
                  localUserTutorialsProgress.remainingMcSteps.length - 1
                ] !== newnewapi.McTutorialStep.MC_TEXT_FIELD;

              if (!wrongLocalData) {
                syncedObj.remainingMcSteps =
                  localUserTutorialsProgress.remainingMcSteps;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    mcCurrentStep: localUserTutorialsProgress
                      .remainingMcSteps[0]
                      ? localUserTutorialsProgress.remainingMcSteps[0]
                      : newnewapi.McTutorialStep.MC_TEXT_FIELD,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            if (
              localUserTutorialsProgress.remainingCfSteps &&
              syncedObj.remainingCfSteps &&
              syncedObj.remainingCfSteps.length >
                localUserTutorialsProgress.remainingCfSteps.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingCfSteps.length > 0 &&
                localUserTutorialsProgress.remainingCfSteps[
                  localUserTutorialsProgress.remainingCfSteps.length - 1
                ] !== newnewapi.CfTutorialStep.CF_BACK_GOAL;

              if (!wrongLocalData) {
                syncedObj.remainingCfSteps =
                  localUserTutorialsProgress.remainingCfSteps;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    cfCurrentStep: localUserTutorialsProgress
                      .remainingCfSteps[0]
                      ? localUserTutorialsProgress.remainingCfSteps[0]
                      : newnewapi.CfTutorialStep.CF_BACK_GOAL,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            if (
              localUserTutorialsProgress.remainingAcCrCurrentStep &&
              syncedObj.remainingAcCrCurrentStep &&
              syncedObj.remainingAcCrCurrentStep.length >
                localUserTutorialsProgress.remainingAcCrCurrentStep.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingAcCrCurrentStep.length >
                  0 &&
                localUserTutorialsProgress.remainingAcCrCurrentStep[
                  localUserTutorialsProgress.remainingAcCrCurrentStep.length - 1
                ] !== newnewapi.AcCreationTutorialStep.AC_CR_HERO;

              if (!wrongLocalData) {
                syncedObj.remainingAcCrCurrentStep =
                  localUserTutorialsProgress.remainingAcCrCurrentStep;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    acCrCurrentStep: localUserTutorialsProgress
                      .remainingAcCrCurrentStep[0]
                      ? localUserTutorialsProgress.remainingAcCrCurrentStep[0]
                      : newnewapi.AcCreationTutorialStep.AC_CR_HERO,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            if (
              localUserTutorialsProgress.remainingCfCrCurrentStep &&
              syncedObj.remainingCfCrCurrentStep &&
              syncedObj.remainingCfCrCurrentStep.length >
                localUserTutorialsProgress.remainingCfCrCurrentStep.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingCfCrCurrentStep.length >
                  0 &&
                localUserTutorialsProgress.remainingCfCrCurrentStep[
                  localUserTutorialsProgress.remainingCfCrCurrentStep.length - 1
                ] !== newnewapi.CfCreationTutorialStep.CF_CR_HERO;

              if (!wrongLocalData) {
                syncedObj.remainingCfCrCurrentStep =
                  localUserTutorialsProgress.remainingCfCrCurrentStep;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    cfCrCurrentStep: localUserTutorialsProgress
                      .remainingCfCrCurrentStep[0]
                      ? localUserTutorialsProgress.remainingCfCrCurrentStep[0]
                      : newnewapi.CfCreationTutorialStep.CF_CR_HERO,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            if (
              localUserTutorialsProgress.remainingMcCrCurrentStep &&
              syncedObj.remainingMcCrCurrentStep &&
              syncedObj.remainingMcCrCurrentStep.length >
                localUserTutorialsProgress.remainingMcCrCurrentStep.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingMcCrCurrentStep.length >
                  0 &&
                localUserTutorialsProgress.remainingMcCrCurrentStep[
                  localUserTutorialsProgress.remainingMcCrCurrentStep.length - 1
                ] !== newnewapi.McCreationTutorialStep.MC_CR_HERO;

              if (!wrongLocalData) {
                syncedObj.remainingMcCrCurrentStep =
                  localUserTutorialsProgress.remainingMcCrCurrentStep;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    mcCrCurrentStep: localUserTutorialsProgress
                      .remainingMcCrCurrentStep[0]
                      ? localUserTutorialsProgress.remainingMcCrCurrentStep[0]
                      : newnewapi.McCreationTutorialStep.MC_CR_HERO,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
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
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    }

    const localUserTutorialsProgress = loadStateLS(
      'userTutorialsProgress'
    ) as newnewapi.IGetTutorialsStatusResponse;
    if (user.loggedIn) {
      syncUserTutorialsProgress(localUserTutorialsProgress);
      syncUserData();
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
      dispatch(setUserTutorialsProgressSynced(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  useEffect(() => {
    const handlerSocketMeUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MeUpdated.decode(arr);

      if (!decoded) {
        return;
      }

      dispatch(setUserData(decoded.me));
    };

    if (socketConnection) {
      socketConnection?.on('MeUpdated', handlerSocketMeUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('MeUpdated', handlerSocketMeUpdated);
      }
    };
  }, [socketConnection]);

  return <>{children}</>;
};

export default SyncUserWrapper;
