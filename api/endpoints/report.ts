import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/reporting`;

const reportContent = (
  payload: newnewapi.ReportContentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.ReportContentRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.ReportContentRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_CHAT}/report_content`,
    payload,
    ...(signal ? { signal } : {}),
  });

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
        auOptionId: optionId as number,
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
        mcOptionId: optionId as number,
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
        chatMessageId: messageId as number,
      },
    },
  });

  return reportContent(payload);
};
