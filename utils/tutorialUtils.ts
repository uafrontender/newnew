import { newnewapi } from 'newnew-api';

type TutorialType =
  | newnewapi.AcTutorialStep[]
  | newnewapi.McTutorialStep[]
  | newnewapi.CfTutorialStep[]
  | newnewapi.AcCreationTutorialStep[]
  | newnewapi.McCreationTutorialStep[]
  | newnewapi.CfCreationTutorialStep[]
  | newnewapi.AcResponseTutorialStep[]
  | newnewapi.McResponseTutorialStep[];

// eslint-disable-next-line import/prefer-default-export
export const isTutorialInvalid = (
  tutorial: TutorialType | null | undefined,
  lastStep:
    | newnewapi.AcTutorialStep.AC_TEXT_FIELD
    | newnewapi.McTutorialStep.MC_TEXT_FIELD
    | newnewapi.CfTutorialStep.CF_BACK_GOAL
    | newnewapi.AcCreationTutorialStep.AC_CR_HERO
    | newnewapi.McCreationTutorialStep.MC_CR_HERO
    | newnewapi.CfCreationTutorialStep.CF_CR_HERO
    | newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE
    | newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE
) =>
  tutorial && tutorial.length > 0 && tutorial[tutorial.length - 1] !== lastStep;

export const isTutorialNotSynced = (
  tutorial: TutorialType | undefined | null,
  localTutorial: TutorialType | undefined | null
) => localTutorial && tutorial && tutorial.length > localTutorial.length;
