export const useSidebar = () => {
	const collapsed = useState('sidebar-collapsed', () => false)

	const toggleCollapsed = () => (collapsed.value = !collapsed.value)

	return { collapsed, toggleCollapsed }
}
