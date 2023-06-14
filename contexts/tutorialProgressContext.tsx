import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { isEqual } from 'lodash';
import {
  getTutorialsStatus,
  markTutorialStepAsCompleted,
} from '../api/endpoints/user';
import { useAppState } from './appStateContext';
import { loadStateLS, saveStateLS } from '../utils/localStorage';

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

export const TutorialProgressContextProvider: React.FC<
  ITutorialProgressContextProvider
> = ({ children }) => {
  const { userLoggedIn, logoutAndRedirect } = useAppState();

  const [userTutorialsProgress, setUserTutorialsProgress] =
    useState<newnewapi.IGetTutorialsStatusResponse>();
  // Do we need it? Or is userTutorialsProgress === undefined is enough?
  const [userTutorialsProgressSynced, setUserTutorialsProgressSynced] =
    useState(false);

  // What if it is called before the initial sync?
  const setUserTutorialsProgressState = useCallback(
    (payload: Partial<newnewapi.IGetTutorialsStatusResponse>) => {
      setUserTutorialsProgress((curr) => ({
        ...curr,
        ...payload,
      }));

      const localUserTutorialsProgress = loadStateLS(
        'userTutorialsProgress'
      ) as JSON;
      saveStateLS('userTutorialsProgress', {
        ...localUserTutorialsProgress,
        ...payload,
      });
    },
    []
  );

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

            if (
              localUserTutorialsProgress.remainingAcResponseCurrentStep &&
              syncedObj.remainingAcResponseCurrentStep &&
              syncedObj.remainingAcResponseCurrentStep.length >
                localUserTutorialsProgress.remainingAcResponseCurrentStep.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingAcResponseCurrentStep
                  .length > 0 &&
                localUserTutorialsProgress.remainingAcResponseCurrentStep[
                  localUserTutorialsProgress.remainingAcResponseCurrentStep
                    .length - 1
                ] !== newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE;

              if (!wrongLocalData) {
                syncedObj.remainingAcResponseCurrentStep =
                  localUserTutorialsProgress.remainingAcResponseCurrentStep;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    acResponseCurrentStep: localUserTutorialsProgress
                      .remainingAcResponseCurrentStep[0]
                      ? localUserTutorialsProgress
                          .remainingAcResponseCurrentStep[0]
                      : newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            if (
              localUserTutorialsProgress.remainingMcResponseCurrentStep &&
              syncedObj.remainingMcResponseCurrentStep &&
              syncedObj.remainingMcResponseCurrentStep.length >
                localUserTutorialsProgress.remainingMcResponseCurrentStep.length
            ) {
              const wrongLocalData =
                localUserTutorialsProgress.remainingMcResponseCurrentStep
                  .length > 0 &&
                localUserTutorialsProgress.remainingMcResponseCurrentStep[
                  localUserTutorialsProgress.remainingMcResponseCurrentStep
                    .length - 1
                ] !== newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE;

              if (!wrongLocalData) {
                syncedObj.remainingMcResponseCurrentStep =
                  localUserTutorialsProgress.remainingMcResponseCurrentStep;
                const payloadSetData =
                  new newnewapi.MarkTutorialStepAsCompletedRequest({
                    mcResponseCurrentStep: localUserTutorialsProgress
                      .remainingMcResponseCurrentStep[0]
                      ? localUserTutorialsProgress
                          .remainingMcResponseCurrentStep[0]
                      : newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE,
                  });
                await markTutorialStepAsCompleted(payloadSetData);
              }
            }

            setUserTutorialsProgress(syncedObj);
            saveStateLS('userTutorialsProgress', syncedObj);
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
      'userTutorialsProgress'
    ) as newnewapi.IGetTutorialsStatusResponse;
    if (userLoggedIn) {
      syncUserTutorialsProgress(localUserTutorialsProgress);
    } else {
      if (!localUserTutorialsProgress) {
        saveStateLS('userTutorialsProgress', userTutorialsProgress);
      } else if (!isEqual(userTutorialsProgress, localUserTutorialsProgress)) {
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
