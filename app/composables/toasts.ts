export const invokeSuccessToast = ({ title, description, icon }: { title: string; description?: string; icon?: string }) => {
  useToast().add({
    color: 'success', title, description, icon
  });
};

export const invokeErrorToast = ({ title, description, icon }: { title: string; description?: string; icon?: string }) => {
  useToast().add({
    color: 'error', title, description, icon
  });
};

export const invokeInfoToast = ({ title, description, icon }: { title: string; description?: string; icon?: string }) => {
  useToast().add({
    color: 'neutral', title, description, icon
  });
}