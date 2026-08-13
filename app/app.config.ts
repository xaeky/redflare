export default defineAppConfig({
  ui: {
    colors: {
      primary: 'pink',
      secondary: 'purple',
      neutral: 'mauve',
    },
    container: {
      base: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
    },
    button: {
      slots: {
        base: [
          'rounded-full cursor-pointer sm:active:scale-95 duration-[0.15s,0.3s] transition-transform ease-expo',
        ],
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class:
            'bg-linear-to-t from-primary-400 via-primary-400 to-primary-300',
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'bg-linear-to-t from-inverted via-inverted to-inverted/50',
        },
      ],
      variants: {
        size: {
          md: {
            base: 'px-4 sm:px-3 gap-2 sm:gap-1.5 text-base sm:text-sm font-bold sm:font-normal py-2.5 sm:py-1.5',
          },
        },
      },
    },
    switch: {
      slots: {
        root: 'flex-row-reverse sm:flex-row items-center sm:items-start flex-between bg-muted sm:bg-transparent p-4 sm:p-0 rounded-lg gap-4 sm:gap-0',
        wrapper: 'flex-1 ms-0 sm:ms-2',
      },
      variants: {
        size: {
          md: {
            base: 'w-11 sm:w-9',
            thumb:
              'size-5 sm:size-4 data-[state=checked]:translate-x-5 sm:data-[state=checked]:translate-x-4',
            wrapper: 'text-base sm:text-sm',
          },
        },
      },
    },
    input: {
      variants: {
        size: {
          md: {
            base: 'px-4 sm:px-2.5 py-2.5 sm:py-1.5 gap-2 text-base sm:text-sm',
          },
        },
      },
    },
    table: {
      slots: {
        base: 'border-separate border-spacing-y-1',
        tr: 'group [&>td]:border-none',
        td: 'group-data-[selectable=true]:group-hover:bg-elevated/50 py-2 px-3 first:rounded-l-lg last:rounded-r-lg duration-50 transition-colors',
        th: 'py-2 px-3',
        tbody:
          '[&>tr]:data-[selectable=true]:hover:bg-transparent [&>tr]:data-[selectable=true]:hover>td:bg-elevated/25 [&>tr]:data-[selectable=true]:hover:cursor-pointer',
      },
    },
    slideover: {
      compoundVariants: [
        {
          transition: true,
          side: 'right',
          class: {
            content:
              'data-[state=open]:animate-[slide-in-from-right_500ms_var(--ease-expo)] data-[state=closed]:animate-[slide-out-to-right_500ms_var(--ease-expo)]',
          },
        },
      ],
    },
  },
});
