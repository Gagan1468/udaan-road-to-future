import React from "react";

export function ErrorMessage({ children, id }) {
  if (!children) return null;
  return <p className="form-error" role="alert" id={id}>{children}</p>;
}
