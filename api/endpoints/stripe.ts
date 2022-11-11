import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_BUNDLE = `${BASE_URL}/stripe`;

export const getExpressDashboardLoginLink = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetExpressDashboardLoginLinkResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetExpressDashboardLoginLinkResponse,
    `${BASE_URL_BUNDLE}/get_express_dashboard_login_link`,
    'post',
    payload,
    signal ?? undefined
  );
