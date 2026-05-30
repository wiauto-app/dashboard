import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CreateTicketPayload,
  TicketListItem,
  UpdateTicketPayload,
} from "../types/ticket.types";
import type { TicketsParams } from "../schemas/tickets-params.schema";
import { V1_TICKETS } from "./route.constants";

export const ticketsService = {
  findAll: async (
    params?: TicketsParams,
  ): Promise<PaginatedResult<TicketListItem>> => {
    const merged: Record<string, string | number | undefined> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      query: params?.search,
      status: params?.status,
      category_id: params?.category_id,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<TicketListItem>>(
      `${V1_TICKETS}${query_string ? `?${query_string}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<TicketListItem>> => {
    return apiGet<TicketListItem>(`${V1_TICKETS}/${id}`);
  },

  create: async (
    payload: CreateTicketPayload,
  ): Promise<apiResponse<TicketListItem>> => {
    const body = {
      ...payload,
      file_url: payload.file_url?.trim() ? payload.file_url : null,
    };
    return apiPost<TicketListItem>(V1_TICKETS, body);
  },

  update: async (
    id: string,
    payload: UpdateTicketPayload,
  ): Promise<apiResponse<TicketListItem>> => {
    const body = {
      ...payload,
      ...(payload.file_url !== undefined
        ? {
            file_url: payload.file_url?.trim() ? payload.file_url : null,
          }
        : {}),
    };
    return apiPatch<TicketListItem>(`${V1_TICKETS}/${id}`, body);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_TICKETS}/${id}`);
  },
};
