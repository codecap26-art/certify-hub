import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ParticipantSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ParticipantSearch: React.FC<ParticipantSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search participant name, email, department, or registration number...',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <Search
        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
          isFocused || value ? 'text-[#2563EB]' : 'text-[#94A3B8]'
        }`}
      />
      <input
        type="text"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] rounded-xl pl-10 pr-10 py-2.5 text-xs transition-all duration-200 focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[rgba(37,99,235,0.12)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
