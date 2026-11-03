import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button, Field, Card, Select, StatusMessage } from '../index.js';
afterEach(cleanup);
describe('Kopaka accessible primitives', () => {
  it('gives buttons safe types and meaningful disabled/loading states', () => {
    render(
      <>
        <Button>Action</Button>
        <Button disabled>Indisponible</Button>
        <Button disabled aria-busy="true">
          Chargement
        </Button>
      </>,
    );
    expect(
      (screen.getByRole('button', { name: 'Action' }) as HTMLButtonElement)
        .type,
    ).toBe('button');
    expect(
      (
        screen.getByRole('button', {
          name: 'Indisponible',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      screen
        .getByRole('button', { name: 'Chargement' })
        .getAttribute('aria-busy'),
    ).toBe('true');
  });
  it('keeps field labels and connects help and error to the input', () => {
    render(
      <Field
        label="Exemple"
        help="Aide persistante"
        error="Erreur explicite"
      />,
    );
    const input = screen.getByLabelText('Exemple');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const descriptions = input
      .getAttribute('aria-describedby')!
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent);
    expect(descriptions).toEqual(['Aide persistante', 'Erreur explicite']);
  });
  it('uses semantic cards, native labelled selects and text for all status meanings', () => {
    render(
      <Card id="demo" title="Démonstration">
        <Select label="Choix" defaultValue="">
          <option value="">Choisir</option>
          <option value="one">Premier exemple</option>
        </Select>
        <StatusMessage
          tone="success"
          label="Succès"
          message="Exemple confirmé"
        />
        <StatusMessage
          tone="error"
          label="Erreur"
          message="Exemple à vérifier"
        />
      </Card>,
    );
    expect(
      screen.getByRole('heading', { name: 'Démonstration', level: 2 }),
    ).not.toBeNull();
    const select = screen.getByRole('combobox', {
      name: 'Choix',
    }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'one' } });
    expect(select.value).toBe('one');
    expect(screen.getByText('Succès')).not.toBeNull();
    expect(screen.getByText('Erreur')).not.toBeNull();
    expect(screen.queryAllByRole('status')).toHaveLength(0);
  });
});
