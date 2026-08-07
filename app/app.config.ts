export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cyan',
      secondary: 'purple',
      neutral: 'zinc'
    },
    container: {
      base: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'
    },
    button: {
      slots: {
        base: [
          'rounded-full cursor-pointer active:scale-95 duration-[0.15s,0.3s] transition-transform ease-expo',
        ]
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'bg-linear-to-t from-primary-400 via-primary-400 to-primary-300'
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'bg-linear-to-t from-inverted via-inverted to-inverted/50'
        }
      ],
      variants: {
        size: {
          md: {
            base: 'px-3.5 gap-2'
          }
        }
      }
    },
    table: {
      slots: {
        base: 'border-separate border-spacing-y-1',
        tr: 'group [&>td]:border-none',
        td: 'group-data-[selectable=true]:group-hover:bg-elevated/50 py-2 px-3 first:rounded-l-lg last:rounded-r-lg duration-50 transition-colors',
        th: 'py-2 px-3',
        tbody: '[&>tr]:data-[selectable=true]:hover:bg-transparent [&>tr]:data-[selectable=true]:hover>td:bg-elevated/25 [&>tr]:data-[selectable=true]:hover:cursor-pointer',
      }
    }
  }
});