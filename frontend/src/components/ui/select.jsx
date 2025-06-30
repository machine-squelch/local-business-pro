import React from 'react';
export const Select = ({ children }) => <select className="select">{children}</select>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ children, ...props }) => <option {...props}>{children}</option>;
export const SelectTrigger = ({ children }) => <div>{children}</div>; // Simplified for functionality
export const SelectValue = () => <></>; // Simplified
