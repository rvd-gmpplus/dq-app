import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmTypedDialog from '@/components/common/ConfirmTypedDialog';

describe('ConfirmTypedDialog', () => {
  it('disables the confirm button until the typed word matches', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmTypedDialog
        open
        title="Delete foo"
        description="cannot be undone"
        confirmWord="DELETE"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );

    const confirm = screen.getByRole('button', { name: /confirm/i });
    expect(confirm).toBeDisabled();

    const input = screen.getByLabelText(/type delete to confirm/i);
    await user.type(input, 'wrong');
    expect(confirm).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'DELETE');
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('cancels on escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ConfirmTypedDialog
        open
        title="Title"
        description="desc"
        confirmWord="RESET"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmTypedDialog
        open={false}
        title="x"
        description="y"
        confirmWord="Z"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
