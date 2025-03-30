import React, { useState } from "react";

export function Select({ children, onValueChange, className }) {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    if (onValueChange) {
      onValueChange(event.target.value);
    }
  };
  return (
    <div className={`relative ${className}`}>
      <select value={selectedValue} onChange={handleChange} className="border px-2 py-1 rounded w-full">
        {children}
      </select>
    </div>
  );
}

export function SelectTrigger({ children }) {
  return <div>{children}</div>;
}

export function SelectValue({ placeholder }) {
  return <option disabled>{placeholder}</option>;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
