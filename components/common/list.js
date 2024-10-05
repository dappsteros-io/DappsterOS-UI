export const List = (props) => {
    const { className, ...restProps } = props
    return <ul className={`w-full text-sm font-medium text-gray-900 rounded-lg dark:text-gray-200 border border-gray-900 border-opacity-50 bg-neutral-700 ${className}`} {...restProps}>
        {props.children}
    </ul>
}

export const ListItem = props => {
    const { className, floating, ...restProps } = props
    return <li aria-current="true" className={`block w-full px-4 py-4 rounded-t-lg cursor-pointer hover:bg-ub-warm-grey hover:bg-opacity-10  border-b border-gray-900 border-opacity-50 ${className} ${floating ? "" : "inline-flex flex-auto"}`} {...restProps}>
        {props.label ? <label htmlFor="email-address-icon" className={`block ${floating ? "mb-2 text-xs" : "flex-auto"} font-medium text-neutral-500`}>{props.label}</label> : ""}
        {props.children}
    </li>
}