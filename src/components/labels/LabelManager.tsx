import React from 'react';
import LabelInput from './LabelInput';
import LabelBadge from './LabelBadge';

interface LabelManagerProps {
  labels: string[];
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

export default function LabelManager({
  labels,
  onAddLabel,
  onRemoveLabel,
}: LabelManagerProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <LabelBadge
            key={label}
            label={label}
            onRemove={() => onRemoveLabel(label)}
          />
        ))}
      </div>
      <LabelInput
        onAddLabel={onAddLabel}
        existingLabels={labels}
        placeholder="Add new label..."
      />
    </div>
  );
}