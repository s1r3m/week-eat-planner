import type { ComputedRef, Ref } from 'vue';
import { createContext } from 'reka-ui';

/** Cookie name for persisting sidebar state. */
export const SIDEBAR_COOKIE_NAME = 'sidebar_state';
/** Cookie expiration time (7 days). */
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
/** Default sidebar width when expanded. */
export const SIDEBAR_WIDTH = '16rem';
/** Sidebar width on mobile devices. */
export const SIDEBAR_WIDTH_MOBILE = '18rem';
/** Sidebar width when collapsed. */
export const SIDEBAR_WIDTH_ICON = '3rem';
/** Keyboard shortcut to toggle sidebar. */
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/**
 * Context for managing the sidebar's open/collapsed state and mobile visibility.
 */
export const [useSidebar, provideSidebarContext] = createContext<{
  state: ComputedRef<'expanded' | 'collapsed'>;
  open: Ref<boolean>;
  setOpen: (value: boolean) => void;
  isMobile: Ref<boolean>;
  openMobile: Ref<boolean>;
  setOpenMobile: (value: boolean) => void;
  toggleSidebar: () => void;
}>('Sidebar');
