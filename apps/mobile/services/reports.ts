import { API_ROUTES } from "@/constants/api-routes";
import { IPagination, Report, ReportForm, UserBlock } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const createReportMutation = (params: ReportForm) =>
  APIs.post<{ reported: boolean; report: Report }>(API_ROUTES.REPORTS, {
    data: params,
  });

export const getMyReportsQuery = (params?: { page?: number; limit?: number }) =>
  APIs.get<IPagination<Report>>(API_ROUTES.MY_REPORTS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const getMyBlocksQuery = (params?: { page?: number; limit?: number }) =>
  APIs.get<IPagination<UserBlock>>(API_ROUTES.MY_BLOCKS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const blockUserMutation = (accountId: string) =>
  APIs.post<{ blocked: true; block: UserBlock }>(
    API_ROUTES.BLOCK_USER(accountId),
  );

export const unblockUserMutation = (accountId: string) =>
  APIs.delete<{ blocked: false; blockedAccountId: string }>(
    API_ROUTES.BLOCK_USER(accountId),
  );
