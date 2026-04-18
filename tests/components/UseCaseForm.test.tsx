import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UseCaseForm from '@/components/useCase/UseCaseForm';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { seedStakeholders } from '@/seed';

beforeEach(() => {
  localStorage.clear();
  useUseCaseStore.getState().reset();
  useSettingsStore.getState().reset();
  useStakeholderStore.getState().reset();
  useStakeholderStore.getState().replaceAll(seedStakeholders);
});

function renderForm(onClose = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={['/use-cases']}>
      <Routes>
        <Route path="/use-cases" element={<UseCaseForm open onClose={onClose} />} />
        <Route path="/use-cases/:id" element={<div data-testid="detail-page">detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('UseCaseForm', () => {
  it('rejects submission with an empty title', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /create and open/i }));
    expect(screen.getByText(/please enter a title/i)).toBeInTheDocument();
    expect(useUseCaseStore.getState().list()).toHaveLength(0);
  });

  it('rejects submission without a pillar', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByPlaceholderText(/standardised/i), 'A new use case');
    await user.click(screen.getByRole('button', { name: /create and open/i }));
    expect(screen.getByText(/select at least one/i)).toBeInTheDocument();
    expect(useUseCaseStore.getState().list()).toHaveLength(0);
  });

  it('creates a use case and navigates to its detail page', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByPlaceholderText(/standardised/i), 'Test case');
    await user.click(screen.getByRole('button', { name: /transparency/i }));
    await user.click(screen.getByRole('button', { name: /create and open/i }));

    expect(screen.getByTestId('detail-page')).toBeInTheDocument();
    const list = useUseCaseStore.getState().list();
    expect(list).toHaveLength(1);
    expect(list[0]!.title).toBe('Test case');
    expect(list[0]!.pillars).toEqual(['Transparency']);
    expect(list[0]!.status).toBe('Idea');
  });
});
