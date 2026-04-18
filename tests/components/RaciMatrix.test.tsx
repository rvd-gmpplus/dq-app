import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaciMatrix from '@/components/governance/RaciMatrix';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import { seedStakeholders, seedDataObjects } from '@/seed';

beforeEach(() => {
  localStorage.clear();
  useStakeholderStore.getState().reset();
  useDataObjectStore.getState().reset();
  useRaciStore.getState().reset();
  useStakeholderStore.getState().replaceAll(seedStakeholders);
  useDataObjectStore.getState().replaceAll(seedDataObjects);
});

describe('RaciMatrix', () => {
  it('cycles a cell through R -> A -> C -> I -> blank', async () => {
    const user = userEvent.setup();
    render(<RaciMatrix />);
    const stakeholder = seedStakeholders[0]!;
    const dataObject = seedDataObjects[0]!;
    const button = screen.getByRole('button', {
      name: new RegExp(`raci for ${stakeholder.name} on ${dataObject.name}`, 'i'),
    });
    expect(button.textContent).toBe('—');
    await user.click(button);
    expect(button.textContent).toBe('R');
    await user.click(button);
    expect(button.textContent).toBe('A');
    await user.click(button);
    expect(button.textContent).toBe('C');
    await user.click(button);
    expect(button.textContent).toBe('I');
    await user.click(button);
    expect(button.textContent).toBe('—');
    expect(useRaciStore.getState().getCell(stakeholder.id, dataObject.id)).toBeUndefined();
  });
});
