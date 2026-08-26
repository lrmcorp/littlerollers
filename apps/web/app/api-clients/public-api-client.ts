import {
  ClassesApi,
  Configuration,
  MasterApi,
  PackagesApi,
  ResponseError,
} from '@dailydose/api-client-ts/generated';

const publicConfiguration = new Configuration({
  basePath: '/api/v1',
  credentials: 'omit',
  headers: { Accept: 'application/json' },
});

export const publicGeneratedApi = {
  classes: new ClassesApi(publicConfiguration),
  master: new MasterApi(publicConfiguration),
  packages: new PackagesApi(publicConfiguration),
};

export function publicApiStatus(error: unknown) {
  return error instanceof ResponseError
    ? error.response.status
    : (error as { response?: { status?: number } })?.response?.status;
}
