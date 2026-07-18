import { HttpStatus } from '@nestjs/common';
import { ApiProblem } from './security';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function assertIsoDate(value: string): string {
  if (!ISO_DATE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`)))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  const [year, month, day] = value.split('-').map(Number);
  const canonical = new Date(Date.UTC(year!, month! - 1, day!)).toISOString().slice(0, 10);
  if (canonical !== value) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  return value;
}

export function dateInTimeZone(instant: Date, timeZone: string): string {
  if (Number.isNaN(instant.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(instant);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((candidate) => candidate.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

function offsetAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const representedAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return representedAsUtc - instant.getTime();
}

export function startOfLocalDateUtc(date: string, timeZone: string): Date {
  assertIsoDate(date);
  const [year, month, day] = date.split('-').map(Number);
  const nominalUtc = Date.UTC(year!, month! - 1, day!);
  let result = new Date(nominalUtc);
  try {
    for (let iteration = 0; iteration < 3; iteration += 1)
      result = new Date(nominalUtc - offsetAt(result, timeZone));
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
  if (dateInTimeZone(result, timeZone) !== date)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  return result;
}
