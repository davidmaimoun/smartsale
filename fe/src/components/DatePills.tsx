import React from 'react';

const PILLS = [
  { label: 'Today',        days: 1  },
  { label: 'Last 7 Days',  days: 7  },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

interface DatePillsProps {
  activeDays: number | null;
  onChange: (days: number) => void;
}

const DatePills: React.FC<DatePillsProps> = ({ activeDays, onChange }) => (
  <div className="quick-date-pills">
    {PILLS.map(({ label, days }) => (
      <button
        key={days}
        className={`date-pill ${activeDays === days ? 'active' : ''}`}
        onClick={() => onChange(days)}
      >
        {label}
      </button>
    ))}
  </div>
);

export default DatePills;