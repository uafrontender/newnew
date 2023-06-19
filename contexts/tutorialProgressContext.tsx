import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from 'react';
import { isEqual } from 'lodash';
import {
  getTutorialsStatus,
  markTutorialStepAsCompleted,
} from '../api/endpoints/user';
import { useAppState } from './appStateContext';
import { loadStateLS, saveStateLS } from '../utils/localStorage';
import { isTutorialNotSynced, isTutorialValid } from '../utils/tutorialUtils';

export const TutorialProgressContext = createContext<{
  // TODO: Deconstruct into smaller objects to avoid excessive updates?
  userTutorialsProgress: newnewapi.IGetTutorialsStatusResponse | undefined;
  userTutorialsProgressSynced: boolean;
  setUserTutorialsProgress: (
    payload: Partial<newnewapi.IGetTutorialsStatusResponse>
  ) => void;
}>({
  userTutorialsProgress: undefined,
  userTutorialsProgressSynced: false,
  setUserTutorialsProgress: () => {},
});

interface ITutorialProgressContextProvider {
  children: React.ReactNode;
}

const USER_TUTORIAL_PROGRESS_LS_KEY = 'userTutorialsProgress';

const defaultState = {
  // AC
  remainingAcSteps: [
    newnewapi.AcTutorialStep.AC_HERO,
    newnewapi.AcTutorialStep.AC_TIMER,
    newnewapi.AcTutorialStep.AC_ALL_BIDS,
    newnewapi.AcTutorialStep.AC_BOOST_BID,
    newnewapi.AcTutorialStep.AC_TEXT_FIELD,
  ],
  // MC
  remainingMcSteps: [
    newnewapi.McTutorialStep.MC_HERO,
    newnewapi.McTutorialStep.MC_TIMER,
    newnewapi.McTutorialStep.MC_ALL_OPTIONS,
    newnewapi.McTutorialStep.MC_VOTE,
    newnewapi.McTutorialStep.MC_TEXT_FIELD,
  ],
  // CF
  remainingCfSteps: [
    newnewapi.CfTutorialStep.CF_HERO,
    newnewapi.CfTutorialStep.CF_TIMER,
    newnewapi.CfTutorialStep.CF_GOAL_PROGRESS,
    newnewapi.CfTutorialStep.CF_BACK_GOAL,
  ],
  remainingAcCrCurrentStep: [newnewapi.AcCreationTutorialStep.AC_CR_HERO],
  remainingCfCrCurrentStep: [newnewapi.CfCreationTutorialStep.CF_CR_HERO],
  remainingMcCrCurrentStep: [newnewapi.McCreationTutorialStep.MC_CR_HERO],
  remainingAcResponseCurrentStep: [
    newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE,
  ],
  remainingMcResponseCurrentStep: [
    newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE,
  ],
};

export const TutorialProgressContextProvider: React.FC<
  ITutorialProgressContextProvider
> = ({ children }) => {
  const { userLoggedIn, logoutAndRedirect } = useAppState();

  const [userTutorialsProgress, setUserTutorialsProgress] =
    useState<newnewapi.IGetTutorialsStatusResponse>();
  // Do we need it? Or is userTutorialsProgress === undefined is enough?
  const [userTutorialsProgressSynced, setUserTutorialsProgressSynced] =
    useState(false);
  const userWasLoggedIn = useRef(false);

  // What if it is called before the initial sync?
  const setUserTutorialsProgressState = useCallback(
    (payload: Partial<newnewapi.IGetTutorialsStatusResponse>) => {
      setUserTutorialsProgress((curr) => ({
        ...curr,
        ...payload,
      }));

      const localUserTutorialsProgress = loadStateLS(
        USER_TUTORIAL_PROGRESS_LS_KEY
      ) as JSON;

      saveStateLS(USER_TUTORIAL_PROGRESS_LS_KEY, {
        ...localUserTutorialsProgress,
        ...payload,
      });
    },
    []
  );

  useEffect(() => {
    if (
      userWasLoggedIn.current &&
      !userLoggedIn &&
      // Don't clean local storage in tests
      process.env.NEXT_PUBLIC_ENVIRONMENT !== 'test'
    ) {
      setUserTutorialsProgress(defaultState);
      userWasLoggedIn.current = false;
      // TODO: should we clear tutorial progress on logout?
      // removeStateLS(USER_TUTORIAL_PROGRESS_LS_KEY);
    }

    if (userLoggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [userLoggedIn]);

  useEffect(() => {
    async function syncUserTutorialsProgress(
      localUserTutorialsProgress: newnewapi.IGetTutorialsStatusResponse
    ) {
      if (!isEqual(userTutorialsProgress, localUserTutorialsProgress)) {
        setUserTutorialsProgress(
          localUserTutorialsProgress as newnewapi.IGetTutorialsStatusResponse
        );
      }

      try {
        const payload = new newnewapi.EmptyRequest({});
        const { data } = await getTutorialsStatus(payload);
        if (data) {
          if (
            !isEqual(data, localUserTutorialsProgress) &&
            localUserTutorialsProgress
          ) {
            // TODO: Use markTutorialStepAsCompleted once
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
            setUserTutorialsProgress(syncedObj);
            saveStateLS(USER_TUTORIAL_PROGRESS_LS_KEY, syncedObj);
          } else {
            setUserTutorialsProgress(data);
          }
        }
        setUserTutorialsProgressSynced(true);
      } catch (err) {
        console.error(err);
        if ((err as Error).message === 'No token') {
          logoutAndRedirect();
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          logoutAndRedirect('/sign-up?reason=session_expired');
        }
      }
    }

    const localUserTutorialsProgress = loadStateLS(
      USER_TUTORIAL_PROGRESS_LS_KEY
    ) as newnewapi.IGetTutorialsStatusResponse;
    if (userLoggedIn) {
      syncUserTutorialsProgress(localUserTutorialsProgress);
    } else {
      if (!localUserTutorialsProgress) {
        saveStateLS(USER_TUTORIAL_PROGRESS_LS_KEY, defaultState);
        setUserTutorialsProgress(defaultState);
      } else {
        setUserTutorialsProgress(
          localUserTutorialsProgress as newnewapi.IGetTutorialsStatusResponse
        );
      }
      setUserTutorialsProgressSynced(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn]);

  const contextValue = useMemo(
    () => ({
      userTutorialsProgress,
      userTutorialsProgressSynced,
      setUserTutorialsProgress: setUserTutorialsProgressState,
    }),
    [
      userTutorialsProgress,
      userTutorialsProgressSynced,
      setUserTutorialsProgressState,
    ]
  );

  return (
    <TutorialProgressContext.Provider value={contextValue}>
      {children}
    </TutorialProgressContext.Provider>
  );
};

export function useTutorialProgress() {
  const context = useContext(TutorialProgressContext);
  if (!context) {
    throw new Error(
      'useTutorial must be used inside a `TutorialProgressContextProvider`'
    );
  }

  return context;
}
