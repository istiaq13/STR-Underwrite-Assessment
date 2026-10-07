import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", id }) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border border-zinc-200/90 shadow-card transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`px-6 py-4 border-b border-zinc-100 flex items-center justify-between ${className}`}>
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5 font-normal leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return <div className={`px-6 py-3.5 bg-zinc-50/60 border-t border-zinc-100 rounded-b-2xl ${className}`}>{children}</div>;
};
