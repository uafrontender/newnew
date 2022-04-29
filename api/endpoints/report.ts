import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_CHAT = `${BASE_URL}/reporting`;

const reportContent = (payload: newnewapi.ReportContentRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.ReportContentRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.ReportContentRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/report_content`,
    'post',
    payload
  );

export const reportUser = (
  userId: string,
  reason: newnewapi.ReportingReason,
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reason,
    message,
    content: {
      userProfile: {
        userUuid: userId,
      },
    },
  });

  return reportContent(payload);
};

export const reportPost = (
  postId: string,
  reason: newnewapi.ReportingReason,
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reason,
    message,
    content: {
      postAnnounce: {
        postUuid: postId,
      },
    },
  });

  return reportContent(payload);
};

export const reportEventOption = (
  optionId: number | Long,
  reason: newnewapi.ReportingReason,
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reason,
    message,
    content: {
      auOption: {
        auOptionId: optionId,
      },
    },
  });

  return reportContent(payload);
};

export const reportSuperpollOption = (
  optionId: number | Long,
  reason: newnewapi.ReportingReason,
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reason,
    message,
    content: {
      mcOption: {
        mcOptionId: optionId,
      },
    },
  });

  return reportContent(payload);
};

export const reportMessage = (
  messageId: number | Long,
  reason: newnewapi.ReportingReason,
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reason,
    message,
    content: {
      chatMessage: {
        chatMessageId: messageId,
      },
    },
  });

  return reportContent(payload);
};
