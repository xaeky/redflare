import { ModalGenericConfirmation } from '#components';
import type { ComponentProps } from 'vue-component-type-helpers'

type ModalGenericConfirmationProps = ComponentProps<typeof ModalGenericConfirmation>;
export function useConfirmationModal(props: ModalGenericConfirmationProps) {
  const overlay = useOverlay();
  return overlay.create(ModalGenericConfirmation, { props, defaultOpen: true, destroyOnClose: true });
}