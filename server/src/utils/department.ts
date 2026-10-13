import { DepartmentType } from '@prisma/client';

/**
 * Maps any public website service string to the canonical DepartmentType enum.
 */
export function mapServiceToDepartment(serviceName: string | undefined | null): DepartmentType {
  if (!serviceName) return DepartmentType.AUDIOLOGY;

  const normalized = serviceName.toLowerCase().trim();

  if (
    normalized.includes('hearing') ||
    normalized.includes('audio') ||
    normalized.includes('ear') ||
    normalized.includes('tinnitus') ||
    normalized.includes('pta') ||
    normalized.includes('tympanometry')
  ) {
    if (normalized.includes('hearing aid') || normalized.includes('aid trial')) {
      return DepartmentType.HEARING_AID;
    }
    return DepartmentType.AUDIOLOGY;
  }

  if (
    normalized.includes('speech') ||
    normalized.includes('language') ||
    normalized.includes('voice') ||
    normalized.includes('swallow') ||
    normalized.includes('vitalstim') ||
    normalized.includes('stutter') ||
    normalized.includes('aphasia') ||
    normalized.includes('articulation')
  ) {
    return DepartmentType.SPEECH_THERAPY;
  }

  if (
    normalized.includes('physio') ||
    normalized.includes('movement') ||
    normalized.includes('motor') ||
    normalized.includes('ortho') ||
    normalized.includes('back') ||
    normalized.includes('stroke') ||
    normalized.includes('paralysis') ||
    normalized.includes('mobility')
  ) {
    return DepartmentType.PHYSIOTHERAPY;
  }

  return DepartmentType.AUDIOLOGY;
}
