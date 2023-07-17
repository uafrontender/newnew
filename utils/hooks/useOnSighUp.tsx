import { useState, useEffect, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { markPost } from '../../api/endpoints/post';

interface BaseActionOnSignUp {
  action: string;
}

export interface MarkPostAsFavoriteOnSignUp extends BaseActionOnSignUp {
  action: 'favorite-post';
  postUuid?: string;
}

type ActionOnSignUp = MarkPostAsFavoriteOnSignUp;

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
    const afterSignUp = parseOnSignUpJson(onSignUpJsonString);

    if (!afterSignUp) {
      return;
    }

    switch (afterSignUp.action) {
      case 'favorite-post': {
        if (afterSignUp.postUuid) {
          markPostAsFavorite(afterSignUp.postUuid);
        }
        break;
      }

      default:
        console.warn(`Unknown action type ${afterSignUp.action}`);
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
