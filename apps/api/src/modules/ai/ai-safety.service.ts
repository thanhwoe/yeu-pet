import { Injectable } from '@nestjs/common';

export interface AiSafetyResult {
  urgent: boolean;
  flags: string[];
}

const URGENT_PATTERNS: { flag: string; pattern: RegExp }[] = [
  {
    flag: 'breathing',
    pattern: /\b(can'?t breathe|difficulty breathing|gasping|choking)\b/i,
  },
  { flag: 'seizure', pattern: /\b(seizure|convulsion|fitting)\b/i },
  {
    flag: 'collapse',
    pattern: /\b(collaps(?:e|ed|ing)|unconscious|fainted)\b/i,
  },
  {
    flag: 'poison',
    pattern: /\b(poison|toxin|ate chocolate|xylitol|rat bait)\b/i,
  },
  {
    flag: 'bleeding',
    pattern: /\b(bleeding heavily|won'?t stop bleeding|blood everywhere)\b/i,
  },
  {
    flag: 'trauma',
    pattern: /\b(hit by car|fell from|broken bone|severe injury)\b/i,
  },
];

@Injectable()
export class AiSafetyService {
  assess(content: string): AiSafetyResult {
    const flags = URGENT_PATTERNS.filter(({ pattern }) =>
      pattern.test(content),
    ).map(({ flag }) => flag);

    return {
      urgent: flags.length > 0,
      flags,
    };
  }

  urgentResponse() {
    return [
      'This may be urgent. Please contact a veterinarian or emergency animal clinic now.',
      'I can offer general pet-care information, but I cannot diagnose your pet or replace professional veterinary care.',
      'If your pet is struggling to breathe, unconscious, having seizures, bleeding heavily, poisoned, or severely injured, seek emergency care immediately.',
    ].join('\n\n');
  }
}
