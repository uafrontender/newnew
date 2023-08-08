import { newnewapi } from 'newnew-api';

function getNotificationTargetUrl(
  target: newnewapi.IRoutingTarget | null | undefined
): string | undefined {
  if (!target) {
    return undefined;
  }

  if (
    target.creatorDashboard &&
    target?.creatorDashboard.section ===
      newnewapi.RoutingTarget.CreatorDashboardTarget.Section.CHATS
  ) {
    return '/direct-messages';
  }

  if (
    target.creatorDashboard &&
    target?.creatorDashboard.section ===
      newnewapi.RoutingTarget.CreatorDashboardTarget.Section.SUBSCRIBERS
  ) {
    return '/creator/subscribers';
  }

  if (target.userProfile && target?.userProfile.userUsername) {
    return `/direct-messages/${target.userProfile.userUsername}`;
  }

  if (
    target.postResponse &&
    (target?.postResponse.postShortId || target?.postResponse.postUuid)
  ) {
    return `/p/${
      target?.postResponse.postShortId || target?.postResponse.postUuid
    }`;
  }

  if (
    target.postAnnounce &&
    (target?.postAnnounce.postShortId || target?.postAnnounce.postUuid)
  ) {
    return `/p/${
      target?.postAnnounce.postShortId || target?.postAnnounce.postUuid
    }`;
  }

  return undefined;
}

export default getNotificationTargetUrl;
