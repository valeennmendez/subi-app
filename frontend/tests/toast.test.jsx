import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '../src/toast/ToastProvider.jsx';
import { useToast } from '../src/toast/useToast.js';

const SUCCESS_MESSAGE = 'Tu viaje se publicó correctamente.';
const ERROR_MESSAGE = 'No pudimos publicar tu viaje.';

afterEach(cleanup);

function ToastButtons() {
  const { showToast } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => showToast({ type: 'success', message: SUCCESS_MESSAGE })}
      >
        Mostrar éxito
      </button>
      <button
        type="button"
        onClick={() => showToast({ type: 'error', message: ERROR_MESSAGE })}
      >
        Mostrar error
      </button>
    </>
  );
}

function renderWithToasts() {
  render(
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>,
  );
}

function clickButton(name) {
  fireEvent.click(screen.getByRole('button', { name }));
}

test('el toast de éxito usa role status, ícono, etiqueta y mensaje', () => {
  renderWithToasts();
  clickButton('Mostrar éxito');

  const toast = screen.getByRole('status');

  assert.ok(toast.querySelector('[data-icon="check"]'));
  assert.ok(toast.textContent.includes('Listo'));
  assert.ok(toast.textContent.includes(SUCCESS_MESSAGE));
});

test('el toast de error usa role alert, ícono, etiqueta y mensaje', () => {
  renderWithToasts();
  clickButton('Mostrar error');

  const toast = screen.getByRole('alert');

  assert.ok(toast.querySelector('[data-icon="alert"]'));
  assert.ok(toast.textContent.includes('Error'));
  assert.ok(toast.textContent.includes(ERROR_MESSAGE));
});

test('el botón de cerrar tiene aria-label y descarta el toast', () => {
  renderWithToasts();
  clickButton('Mostrar éxito');

  const closeButton = screen.getByRole('button', { name: 'Cerrar notificación' });

  fireEvent.click(closeButton);

  assert.equal(screen.queryByRole('status'), null);
});

test('muestra dos toasts a la vez', () => {
  renderWithToasts();
  clickButton('Mostrar éxito');
  clickButton('Mostrar error');

  assert.equal(screen.getAllByRole('status').length, 1);
  assert.equal(screen.getAllByRole('alert').length, 1);
});

test('se cierra solo a los 5 segundos', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  renderWithToasts();
  clickButton('Mostrar éxito');

  act(() => {
    t.mock.timers.tick(4999);
  });

  assert.ok(screen.queryByRole('status'));

  act(() => {
    t.mock.timers.tick(1);
  });

  assert.equal(screen.queryByRole('status'), null);
});

test('no se cierra solo mientras tiene el foco', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  renderWithToasts();
  clickButton('Mostrar éxito');

  const closeButton = screen.getByRole('button', { name: 'Cerrar notificación' });

  act(() => {
    closeButton.focus();
  });

  act(() => {
    t.mock.timers.tick(5000);
  });

  assert.ok(screen.queryByRole('status'));

  act(() => {
    closeButton.blur();
  });

  act(() => {
    t.mock.timers.tick(5000);
  });

  assert.equal(screen.queryByRole('status'), null);
});
