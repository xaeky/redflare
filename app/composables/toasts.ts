export const invokeSuccessToast = ({ title, description, icon = 'i-lucide-circle-check' }: { title?: string; description?: string; icon?: string }) => {
  useToast().add({
    color: 'success', title, description, icon
  });
};

export const invokeErrorToast = ({ title, description, icon = 'i-lucide-circle-x' }: { title?: string; description?: string; icon?: string }) => {
  useToast().add({
    color: 'error', title, description, icon
  });
};

export const invokeInfoToast = ({ title, description, icon = 'i-lucide-info' }: { title?: string; description?: string; icon?: string }) => {
  useToast().add({
    color: 'neutral', title, description, icon
  });
}