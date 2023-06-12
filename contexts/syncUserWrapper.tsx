import isEqual from 'lodash/isEqual';
import { newnewapi } from 'newnew-api';
import { useCookies } from 'react-cookie';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';

import {
  getMe,
  getMyOnboardingState,
  getTutorialsStatus,
  markTutorialStepAsCompleted,
  setMyTimeZone,
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
import { loadStateLS, saveStateLS } from '../utils/localStorage';
import useRunOnReturnOnTab from '../utils/hooks/useRunOnReturnOnTab';
import { useAppState } from './appStateContext';
import { isTutorialNotSynced, isTutorialValid } from '../utils/tutorialUtils';

interface ISyncUserWrapper {
  children: React.ReactNode;
}

// TODO: Can be a UserDataContext
const SyncUserWrapper: React.FunctionComponent<ISyncUserWrapper> = ({
  children,
}) => {
  const [, setCookie] = useCookies();
  const dispatch = useAppDispatch();
  const { setUserLoggedIn, setUserIsCreator } = useAppState();
  const user = useAppSelector((state) => state.user);
  const { userLoggedIn } = useAppState();
  const { socketConnection } = useContext(SocketContext);
  const [creatorDataSteps, setCreatorDataSteps] = useState(0);
  const userWasLoggedIn = useRef(false);

  const queryClient = useQueryClient();

  const updateCreatorDataSteps = useCallback(
    () => setCreatorDataSteps((curr) => curr + 1),
    []
  );

  // When user logs out, clear the state
  // Don't clean local storage in tests
  useEffect(() => {
    if (
      userWasLoggedIn.current &&
      !userLoggedIn &&
      process.env.NEXT_PUBLIC_ENVIRONMENT !== 'test'
    ) {
      setCreatorDataSteps(0);
      userWasLoggedIn.current = false;
      queryClient.removeQueries({ queryKey: ['private'] });
    }

    if (userLoggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [userLoggedIn, queryClient]);

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
        if (!decoded) {
          return;
        }
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

  const syncUserData = useCallback(async () => {
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
        setUserIsCreator(true);

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
        setUserLoggedIn(false);
        dispatch(logoutUserClearCookiesAndRedirect());
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        setUserLoggedIn(false);
        dispatch(
          logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
        );
      }
    }
  }, [
    dispatch,
    user.creatorData?.options,
    setUserIsCreator,
    updateCreatorDataSteps,
    setUserLoggedIn,
  ]);

  useEffect(() => {
    const setUserTimeZone = async () => {
      const timezoneInRedux = user.userData?.timeZone;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (timezoneInRedux && timezoneInRedux === timezone) {
        // No need to make the request
        return;
      }

      try {
        const payload = new newnewapi.SetMyTimeZoneRequest({
          name: timezone,
        });

        const response = await setMyTimeZone(payload);

        if (response.error) {
          throw new Error('Cannot set time zone');
        }

        dispatch(
          setUserData({
            timeZone: timezone,
          })
        );
        setCookie('timezone', timezone, {
          // Expire in 10 years
          maxAge: 10 * 365 * 24 * 60 * 60,
          path: '/',
        });
      } catch (err) {
        console.error(err);
        if ((err as Error).message === 'No token') {
          setUserLoggedIn(false);
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          setUserLoggedIn(false);
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    };

    const setUserTimezoneCookieOnly = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      setCookie('timezone', timezone, {
        // Expire in 10 years
        maxAge: 10 * 365 * 24 * 60 * 60,
        path: '/',
      });
    };

    if (userLoggedIn) {
      setUserTimeZone();
    } else {
      setUserTimezoneCookieOnly();
    }
  }, [
    dispatch,
    setCookie,
    setUserLoggedIn,
    user.userData?.timeZone,
    userLoggedIn,
  ]);

  useEffect(() => {
    async function syncUserTutorialsProgress(
      localUserTutorialsProgress: newnewapi.IGetTutorialsStatusResponse
    ) {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const { data } = await getTutorialsStatus(payload);
        if (data) {
          if (
            !isEqual(data, localUserTutorialsProgress) &&
            localUserTutorialsProgress
          ) {
            const syncedObj: newnewapi.IGetTutorialsStatusResponse = {
              ...data,
            };

            if (
              isTutorialNotSynced(
                syncedObj.remainingAcSteps,
                localUserTutorialsProgress.remainingAcSteps
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingAcSteps,
                newnewapi.AcTutorialStep.AC_TEXT_FIELD
              )
            ) {
              syncedObj.remainingAcSteps =
                localUserTutorialsProgress.remainingAcSteps;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  acCurrentStep:
                    localUserTutorialsProgress.remainingAcSteps?.[0] ||
                    newnewapi.AcTutorialStep.AC_TEXT_FIELD,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingMcSteps,
                localUserTutorialsProgress.remainingMcSteps
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingMcSteps,
                newnewapi.McTutorialStep.MC_TEXT_FIELD
              )
            ) {
              syncedObj.remainingMcSteps =
                localUserTutorialsProgress.remainingMcSteps;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  mcCurrentStep:
                    localUserTutorialsProgress.remainingMcSteps?.[0] ||
                    newnewapi.McTutorialStep.MC_TEXT_FIELD,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingCfSteps,
                localUserTutorialsProgress.remainingCfSteps
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingCfSteps,
                newnewapi.CfTutorialStep.CF_BACK_GOAL
              )
            ) {
              syncedObj.remainingCfSteps =
                localUserTutorialsProgress.remainingCfSteps;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  cfCurrentStep:
                    localUserTutorialsProgress.remainingCfSteps?.[0] ||
                    newnewapi.CfTutorialStep.CF_BACK_GOAL,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingAcCrCurrentStep,
                localUserTutorialsProgress.remainingAcCrCurrentStep
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingAcCrCurrentStep,
                newnewapi.AcCreationTutorialStep.AC_CR_HERO
              )
            ) {
              syncedObj.remainingAcCrCurrentStep =
                localUserTutorialsProgress.remainingAcCrCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  acCrCurrentStep:
                    localUserTutorialsProgress.remainingAcCrCurrentStep?.[0] ||
                    newnewapi.AcCreationTutorialStep.AC_CR_HERO,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingCfCrCurrentStep,
                localUserTutorialsProgress.remainingCfCrCurrentStep
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingCfCrCurrentStep,
                newnewapi.CfCreationTutorialStep.CF_CR_HERO
              )
            ) {
              syncedObj.remainingCfCrCurrentStep =
                localUserTutorialsProgress.remainingCfCrCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  cfCrCurrentStep:
                    localUserTutorialsProgress.remainingCfCrCurrentStep?.[0] ||
                    newnewapi.CfCreationTutorialStep.CF_CR_HERO,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingMcCrCurrentStep,
                localUserTutorialsProgress.remainingMcCrCurrentStep
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingMcCrCurrentStep,
                newnewapi.McCreationTutorialStep.MC_CR_HERO
              )
            ) {
              syncedObj.remainingMcCrCurrentStep =
                localUserTutorialsProgress.remainingMcCrCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  mcCrCurrentStep:
                    localUserTutorialsProgress.remainingMcCrCurrentStep?.[0] ||
                    newnewapi.McCreationTutorialStep.MC_CR_HERO,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingAcResponseCurrentStep,
                localUserTutorialsProgress.remainingAcResponseCurrentStep
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingAcResponseCurrentStep,
                newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE
              )
            ) {
              syncedObj.remainingAcResponseCurrentStep =
                localUserTutorialsProgress.remainingAcResponseCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  acResponseCurrentStep:
                    localUserTutorialsProgress
                      .remainingAcResponseCurrentStep?.[0] ||
                    newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE,
                });
              await markTutorialStepAsCompleted(payloadSetData);
            }

            if (
              isTutorialNotSynced(
                syncedObj.remainingMcResponseCurrentStep,
                localUserTutorialsProgress.remainingMcResponseCurrentStep
              ) &&
              isTutorialValid(
                localUserTutorialsProgress.remainingMcResponseCurrentStep,
                newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE
              )
            ) {
              syncedObj.remainingMcResponseCurrentStep =
                localUserTutorialsProgress.remainingMcResponseCurrentStep;
              const payloadSetData =
                new newnewapi.MarkTutorialStepAsCompletedRequest({
                  mcResponseCurrentStep:
                    localUserTutorialsProgress
                      .remainingMcResponseCurrentStep?.[0] ||
                    newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE,
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
          setUserLoggedIn(false);
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          setUserLoggedIn(false);
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    }

    const localUserTutorialsProgress = loadStateLS(
      'userTutorialsProgress'
    ) as newnewapi.IGetTutorialsStatusResponse;
    if (userLoggedIn) {
      syncUserTutorialsProgress(localUserTutorialsProgress);

      syncUserData();
    } else {
      if (!localUserTutorialsProgress) {
        saveStateLS('userTutorialsProgress', user.userTutorialsProgress);
      }

      if (!isEqual(user.userTutorialsProgress, localUserTutorialsProgress)) {
        dispatch(
          setUserTutorialsProgress(
            localUserTutorialsProgress as newnewapi.IGetTutorialsStatusResponse
          )
        );
      }
      dispatch(setUserTutorialsProgressSynced(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn]);

  useEffect(() => {
    const handlerSocketMeUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MeUpdated.decode(arr);

      if (!decoded) {
        return;
      }

      // Needed for correct creatorStatus value
      dispatch(
        setUserData({
          ...decoded.me,
          options: {
            ...decoded.me?.options,
          },
        })
      );
    };

    if (socketConnection) {
      socketConnection?.on('MeUpdated', handlerSocketMeUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('MeUpdated', handlerSocketMeUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  const syncUserDataOnReturnOnTab = useCallback(() => {
    if (userLoggedIn) {
      syncUserData();
    }
  }, [userLoggedIn, syncUserData]);

  useRunOnReturnOnTab(syncUserDataOnReturnOnTab);

  return <>{children}</>;
};

export default SyncUserWrapper;
