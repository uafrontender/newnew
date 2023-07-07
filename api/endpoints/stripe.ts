import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_BUNDLE = `${BASE_URL}/stripe`;

const getExpressDashboardLoginLink = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetExpressDashboardLoginLinkResponse
  >({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetExpressDashboardLoginLinkResponse,
    url: `${BASE_URL_BUNDLE}/get_express_dashboard_login_link`,
    payload,
    ...(signal ? { signal } : {}),
  });

export default getExpressDashboardLoginLink;
