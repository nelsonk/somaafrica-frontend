import { HttpClient } from '@angular/common/http';

export function getRequest(httpClient: HttpClient, url: string, options: any) {
  return httpClient.get(url, options);
}

export function postRequest(httpClient: HttpClient, url: string, data: any, options: any) {
  return httpClient.post(url, data, options);
}

export function putRequest(httpClient: HttpClient, url: string, data: any, options: any) {
  return httpClient.put(url, data, options);
}

export function deleteRequest(httpClient: HttpClient, url: string, options: any) {
  return httpClient.delete(url, options);
}

export function patchRequest(httpClient: HttpClient, url: string, data: any, options: any) {
  return httpClient.patch(url, data, options);
}
