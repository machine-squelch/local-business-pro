import React from 'react';
export const Button = ({ children, ...props }) => <button className="btn" {...props}>{children}</button>;
