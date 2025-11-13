
import React from 'react';
import { ConversionSettings } from '../types';

interface ConversionOptionsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  totalPages: number;
}

const dpiOptions = [
  { value: 96, label: '96 DPI (Screen)' },
  { value: 150, label: '150 DPI (Standard)' },
  { value: 300, label: '300 DPI (High Quality)' },
  { value: 600, label: '600 DPI (Print)' },
];

const formatOptions: ConversionSettings['format'][] = ['JPEG', 'PNG'];

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({ settings, onSettingsChange, totalPages }) => {
  const handleDpiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, dpi: parseInt(e.target.value, 10) });
  };

  const handleFormatChange = (format: ConversionSettings['format']) => {
    onSettingsChange({ ...settings, format });
  };

  return (
    <div className="mt-6 border-t border-dark-700 pt-6">
       <h2 className="text-xl font-semibold text-white mb-4">Conversion Options</h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <div>
            <label htmlFor="dpi-select" className="block text-sm font-medium text-gray-300 mb-2">
                Resolution (DPI)
            </label>
            <select
                id="dpi-select"
                value={settings.dpi}
                onChange={handleDpiChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary"
            >
                {dpiOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
         </div>
         <div>
            <span className="block text-sm font-medium text-gray-300 mb-2">Output Format</span>
            <div className="flex space-x-2">
                {formatOptions.map(format => (
                    <button
                        key={format}
                        type="button"
                        onClick={() => handleFormatChange(format)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                            settings.format === format 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        }`}
                    >
                        {format}
                    </button>
                ))}
            </div>
         </div>
       </div>
       <div className="mt-4 text-center text-sm text-gray-400">
            <p>Total pages to convert: <span className="font-bold text-white">{totalPages}</span></p>
       </div>
    </div>
  );
};
