import { HttpStatus } from '@nestjs/common';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';

const UUID = ENTITY_ID_REGEX;

export function assertPublicUuid(value: string, errorCode = 'RESOURCE_NOT_FOUND') {
  if (!UUID.test(value)) throw new ApiProblem(errorCode, HttpStatus.NOT_FOUND);
}

function instant(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return date;
}

export function publicScheduleRange(fromValue?: string, untilValue?: string) {
  const now = new Date();
  const from = instant(fromValue, now);
  const until = instant(untilValue, new Date(from.getTime() + 14 * 86_400_000));
  if (from >= until || until.getTime() - from.getTime() > 31 * 86_400_000)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return { from, until };
}
