import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/reporting`;

const reportContent = (
  payload: newnewapi.ReportContentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.ReportContentRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.ReportContentRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/report_content`,
    'post',
    payload,
    signal ?? undefined
  );

export const reportUser = (
  userId: string,
  reasons: newnewapi.ReportingReason[],
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reasons,
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
  postUuid: string,
  reasons: newnewapi.ReportingReason[],
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reasons,
    message,
    content: {
      postAnnounce: {
        postUuid,
      },
    },
  });

  return reportContent(payload);
};

export const reportEventOption = (
  optionId: number | Long,
  reasons: newnewapi.ReportingReason[],
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reasons,
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
  reasons: newnewapi.ReportingReason[],
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reasons,
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
  reasons: newnewapi.ReportingReason[],
  message: string
) => {
  const payload = new newnewapi.ReportContentRequest({
    reasons,
    message,
    content: {
      chatMessage: {
        chatMessageId: messageId,
      },
    },
  });

  return reportContent(payload);
};
