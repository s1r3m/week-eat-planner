export const useMobileSidebar = () => {
  const isOpen = useState<boolean>('mobile-sidebar:isOpen', () => false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return { close, isOpen, open }
}
