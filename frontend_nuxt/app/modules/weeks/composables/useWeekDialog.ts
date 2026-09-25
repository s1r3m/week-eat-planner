export const useWeekDialog = () => {
  const isOpen = useState<boolean>('week-create-dialog-open', () => false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return { close, isOpen, open }
}
