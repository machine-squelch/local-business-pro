import React from 'react';
export const Card = ({ children, ...props }) => <div className="card" {...props}>{children}</div>;
export const CardHeader = ({ children }) => <div className="card-header">{children}</div>;
export const CardTitle = ({ children }) => <h3 className="card-title">{children}</h3>;
export const CardDescription = ({ children }) => <p className="card-description">{children}</p>;
export const CardContent = ({ children }) => <div className="card-content">{children}</div>;
