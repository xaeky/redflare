<template>
  <UApp>
    <div id="redflare_restricted">
      <header id="redflare_backoffice_head">
        <div class="w-full border-b border-neutral-800">
          <div class="container mx-auto px-12 flex items-stretch justify-between">
            <HeaderLogo />
            <HeaderSession />
          </div>
        </div>
      </header>
      <div id="redflare_backoffice_contentwrapper" class="container mx-auto px-12 flex">
        <BackofficeSidebar />
        <div id="redflare_backoffice_content" class="px-12 py-6 w-full">
          <slot />
        </div>
      </div>
    </div>
  </UApp>
</template>