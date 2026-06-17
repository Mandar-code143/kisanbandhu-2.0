import { useState, useRef, useCallback, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VoiceInput from '@/components/shared/VoiceInput';

interface VoiceFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}

const VoiceField = memo(function VoiceField({ label, value, onChange, placeholder, type = 'text' }: VoiceFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVoiceResult = useCallback((text: string) => {
    onChange(value ? value + ' ' + text : text);
    // Restore focus to the input after voice result
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [value, onChange]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          ref={inputRef}
          className="flex-1"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <VoiceInput onResult={handleVoiceResult} />
      </div>
    </div>
  );
});

export default VoiceField;
