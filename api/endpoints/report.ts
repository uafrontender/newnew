import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_CHAT = `${BASE_URL}/report`;

export const ReportContent = (payload: newnewapi.ReportContentRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.ReportContentRequest, newnewapi.EmptyResponse>(
    newnewapi.ReportContentRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/report_content`,
    'post',
    payload
  );
