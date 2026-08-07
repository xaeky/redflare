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
      ]
    }
  }
});