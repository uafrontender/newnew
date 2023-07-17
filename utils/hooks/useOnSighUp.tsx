import { useState, useEffect, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { markPost } from '../../api/endpoints/post';
import {
  reportEventOption,
  reportMessage,
  reportPost,
  reportSuperpollOption,
  reportUser,
} from '../../api/endpoints/report';

interface BaseActionOnSignUp {
  type: string;
}

export interface MarkPostAsFavoriteOnSignUp extends BaseActionOnSignUp {
  type: 'favorite-post';
  postUuid?: string;
}

interface BaseReportActionOnSignUp extends BaseActionOnSignUp {
  reasons?: newnewapi.ReportingReason[];
  message?: string;
}

export interface ReportUserOnSignUp extends BaseReportActionOnSignUp {
  type: 'report-user';
  userId?: string;
}

export interface ReportPostOnSignUp extends BaseReportActionOnSignUp {
  type: 'report-post';
  postUuid?: string;
}

export interface ReportEventOptionOnSignUp extends BaseReportActionOnSignUp {
  type: 'report-event-option';
  optionId?: number | Long;
}

export interface ReportSuperpollOptionOnSignUp
  extends BaseReportActionOnSignUp {
  type: 'report-superpoll-option';
  optionId?: number | Long;
}

export interface ReportMessageOnSignUp extends BaseReportActionOnSignUp {
  type: 'report-message';
  messageId?: number | Long;
}

type ActionOnSignUp =
  | MarkPostAsFavoriteOnSignUp
  | ReportUserOnSignUp
  | ReportPostOnSignUp
  | ReportEventOptionOnSignUp
  | ReportSuperpollOptionOnSignUp
  | ReportMessageOnSignUp;

function parseOnSignUpJson(jsonString?: string): ActionOnSignUp | undefined {
  if (!jsonString) {
    return undefined;
  }

  try {
    const data = JSON.parse(jsonString);
    return data as ActionOnSignUp;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

function useOnSignUp(onSignUp?: string) {
  const router = useRouter();
  const [onSignUpJsonString, setOnSignUpJsonString] = useState(onSignUp);

  const markPostAsFavorite = useCallback((postUuid: string) => {
    const markAsFavoritePayload = new newnewapi.MarkPostRequest({
      markAs: newnewapi.MarkPostRequest.Kind.FAVORITE,
      postUuid,
    });

    markPost(markAsFavoritePayload);
    // Do we need to show error here?
  }, []);

  useEffect(() => {
    setOnSignUpJsonString(onSignUp);
  }, [onSignUp]);

  useEffect(() => {
    const action = parseOnSignUpJson(onSignUpJsonString);

    if (!action) {
      return;
    }

    switch (action.type) {
      case 'favorite-post': {
        if (action.postUuid) {
          markPostAsFavorite(action.postUuid);
        }
        break;
      }

      case 'report-user': {
        if (action.userId && action.reasons && action.message) {
          reportUser(action.userId, action.reasons, action.message);
        }
        break;
      }

      case 'report-post': {
        if (action.postUuid && action.reasons && action.message) {
          reportPost(action.postUuid, action.reasons, action.message);
        }
        break;
      }

      case 'report-event-option': {
        if (action.optionId && action.reasons && action.message) {
          reportEventOption(action.optionId, action.reasons, action.message);
        }
        break;
      }

      case 'report-superpoll-option': {
        if (action.optionId && action.reasons && action.message) {
          reportSuperpollOption(
            action.optionId,
            action.reasons,
            action.message
          );
        }
        break;
      }

      case 'report-message': {
        if (action.messageId && action.reasons && action.message) {
          reportMessage(action.messageId, action.reasons, action.message);
        }
        break;
      }

      default:
        console.warn(`Unknown action type ${(action as any).type}`);
    }

    setOnSignUpJsonString('');
    // Clear stripeSecret from query to avoid same request on page reload
    const [path, query] = router.asPath.split('?');
    const clearedQuery = query
      ? query.replace(/onSignUp={.*}&/, '').replace(/&?onSignUp={.*}/, '')
      : '';
    const url = clearedQuery ? `${path}?${clearedQuery}` : path;
    router.replace(url, undefined, { shallow: true });
  }, [onSignUpJsonString, router, markPostAsFavorite]);
}

export default useOnSignUp;
