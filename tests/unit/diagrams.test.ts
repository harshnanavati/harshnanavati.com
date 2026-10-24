import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import Diagram from '../../src/components/Diagram.astro';
import { DIAGRAMS } from '../../src/diagrams';
import { diagramSchema } from '../../src/diagrams/types';

const SLUGS = [
  'docupilot',
  'crickpal-intelligence-layer',
  'crickpal-ai-summary',
  'ai-face-matching',
  'quantumcopilot',
  'support-concierge-chatbots',
];

describe('DIAGRAMS registry', () => {
  it('has exactly the six project slugs', () => {
    expect(Object.keys(DIAGRAMS).sort()).toEqual([...SLUGS].sort());
  });

  it('every diagram is valid', () => {
    for (const slug of SLUGS) {
      for (const d of DIAGRAMS[slug as keyof typeof DIAGRAMS]) {
        expect(() => diagramSchema.parse(d), slug).not.toThrow();
      }
    }
  });

  it('describes the QuantumCopilot key check as constant-time, not HMAC', () => {
    const steps = DIAGRAMS.quantumcopilot[0].lanes.flatMap((l) => l.steps);
    const keyCheck = steps.find((s) => s.label === 'API key check');
    expect(keyCheck?.tech).toBe('constant-time compare');
    expect(JSON.stringify(DIAGRAMS)).not.toMatch(/hmac/i);
  });

  it('the chatbots page has two diagrams', () => {
    expect(DIAGRAMS['support-concierge-chatbots']).toHaveLength(2);
  });
});

describe('diagramSchema', () => {
  const step = (key?: boolean) => ({ label: 'x', key });
  it('rejects a diagram with no key step', () => {
    expect(() => diagramSchema.parse({ lanes: [{ steps: [step(), step()] }] })).toThrow();
  });
  it('rejects a diagram with two key steps', () => {
    expect(() => diagramSchema.parse({ lanes: [{ steps: [step(true), step(true)] }] })).toThrow();
  });
});

describe('Diagram component', () => {
  it('renders exactly one key box with an accessible label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Diagram, { props: { diagram: DIAGRAMS.docupilot[0] } });
    const doc = parse(html);
    const keys = doc.querySelectorAll('.key');
    expect(keys).toHaveLength(1);
    expect(keys[0].text).toContain('citation gate');
    const fig = doc.querySelector('figure');
    expect(fig?.getAttribute('role')).toBe('img');
    expect(fig?.getAttribute('aria-label')?.length).toBeGreaterThan(20);
  });
});
