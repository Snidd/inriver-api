import type { EntitySummary } from 'typings/EntitySummary';
import type { Link } from 'typings/Link';
import type { LinkDirection } from 'typings/LinkDirection';
import type { FieldValue } from 'typings/FieldValue';

import pLimit = require('p-limit');

let _maximumConcurrentCalls = 10;
let limit = pLimit(_maximumConcurrentCalls);

let _apiKey: string | undefined = undefined;

/**
 * @param {maximumConcurrentCalls} The new maximum number of concurrent calls, defaults to 10
 * @description Sets the new number of concurrent calls that can be made to the inRiver API.
 */
export const setMaxConcurrentCalls = (maximumConcurrentCalls: number) => {
  _maximumConcurrentCalls = maximumConcurrentCalls;
  limit = pLimit(_maximumConcurrentCalls);
};

/**
 *
 * @param apiKey The new API key to use, if this is undefined, it will try to use the existing credentials instead, set to undefined for production use inside of HTML templates.
 */
export const setApiKey = (apiKey: string | undefined) => {
  _apiKey = apiKey;
};

const getRequestInit = (apiKey?: string): RequestInit => {
  if (apiKey) {
    return {
      headers: new Headers({ 'X-inRiver-APIKey': apiKey }),
    };
  }
  return {
    credentials: 'include',
    mode: 'cors',
  };
};

type IrQueryParams = {
  key: string;
  value: string;
};

const irFetch = async <T>(url: string, params?: IrQueryParams[]): Promise<T> => {
  const baseUrl = 'https://apieuw.productmarketingcloud.com/api/v1.0.0/';

  let reqInit: RequestInit = getRequestInit(_apiKey);

  let apiUrl = new URL(url, baseUrl);
  let queryParams = new URLSearchParams(apiUrl.search);
  if (params) {
    params.forEach((kvp) => queryParams.append(kvp.key, kvp.value));
  }

  apiUrl.search = queryParams.toString();

  const result = await limit(() => fetch(apiUrl.toString(), reqInit));

  if (result.ok) {
    const data = (await result.json()) as T;
    return data;
  } else {
    let text = await result.text();
    throw new Error(`${result.status}, ${text}`);
  }
};

export const getLinks = async (
  entityId: string | number,
  linkDirection?: LinkDirection,
  linkTypeId?: string,
): Promise<Link[]> => {
  const params: IrQueryParams[] = [];
  if (linkDirection) {
    params.push({ key: 'linkDirection', value: linkDirection });
  }
  if (linkTypeId) {
    params.push({ key: 'linkTypeId', value: linkTypeId });
  }
  const links = await irFetch<Link[]>(`entities/${entityId}/links`, params);
  return links ? links : [];
};

export const getEntitySummary = async (entityId: string | number): Promise<EntitySummary> => {
  const summary = await irFetch<EntitySummary>(`entities/${entityId}/summary`);
  return summary;
};

export const getFieldValues = async (entityId: string | number, fieldTypeIds?: string[]): Promise<FieldValue[]> => {
  const params: IrQueryParams[] = [];
  if (fieldTypeIds) {
    params.push({ key: 'fieldTypeIds', value: fieldTypeIds.join(',') });
  }
  const fieldValues = await irFetch<FieldValue[]>(`entities/${entityId}/fieldValues`, params);
  return fieldValues ? fieldValues : [];
};
