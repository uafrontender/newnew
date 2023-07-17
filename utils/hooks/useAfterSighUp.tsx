import { useState, useEffect, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { markPost } from '../../api/endpoints/post';

interface BaseAfterSignUp {
  action: string;
}

export interface MarkPostAsFavoriteAfterSignUp extends BaseAfterSignUp {
  action: 'favorite-post';
  postUuid?: string;
}

type AfterSignUp = MarkPostAsFavoriteAfterSignUp;

function parseOnLoginJson(jsonString?: string): AfterSignUp | undefined {
  if (!jsonString) {
    return undefined;
  }

  try {
    const data = JSON.parse(jsonString);
    return data as AfterSignUp;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

function useAfterSignUp(initialAfterSignUpJsonString?: string) {
  const router = useRouter();

  const [afterSignUpJsonString, setAfterSignUpJsonString] = useState(
    initialAfterSignUpJsonString
  );

  const markPostAsFavorite = useCallback((postUuid: string) => {
    const markAsFavoritePayload = new newnewapi.MarkPostRequest({
      markAs: newnewapi.MarkPostRequest.Kind.FAVORITE,
      postUuid,
    });

    markPost(markAsFavoritePayload);
    // Do we need to show error here?
  }, []);

  useEffect(() => {
    setAfterSignUpJsonString(initialAfterSignUpJsonString);
  }, [initialAfterSignUpJsonString]);

  useEffect(() => {
    const afterSignUp = parseOnLoginJson(afterSignUpJsonString);

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

    setAfterSignUpJsonString('');
    // Clear stripeSecret from query to avoid same request on page reload
    const [path, query] = router.asPath.split('?');
    const clearedQuery = query
      ? query.replace(/onLogin={.*}&/, '').replace(/&?onLogin={.*}/, '')
      : '';
    const url = clearedQuery ? `${path}?${clearedQuery}` : path;
    router.replace(url, undefined, { shallow: true });
  }, [afterSignUpJsonString, router, markPostAsFavorite]);
}

export default useAfterSignUp;
