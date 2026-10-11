import React from "react";
import { Link } from "react-router-dom";

/** One button primitive for <button>, router <Link> and external <a>. */
export function Button({ variant = "primary", to, href, children, className = "", ...rest }) {
  const cls = `btn btn-${variant} ${className}`.trim();
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} rel="noopener noreferrer" target="_blank" {...rest}>{children}</a>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
