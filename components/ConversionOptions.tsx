import React from 'react';
import { ConversionSettings } from '../types';

interface ConversionOptionsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  onConvert: () => void;
  onCancel: () => void;
  totalPages: number;
}

const formatOptions: ConversionSettings['format'][] = ['JPG', 'PNG', 'TIFF'];

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({ settings, onSettingsChange, onConvert, onCancel, totalPages }) => {

  const handleFormatChange = (format: ConversionSettings['format']) => {
    onSettingsChange({ ...settings, format });
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, quality: parseInt(e.target.value, 10) });
  };
  
  const handleDpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dpiValue = parseInt(e.target.value, 10);
    if (!isNaN(dpiValue)) {
      onSettingsChange({ ...settings, dpi: dpiValue });
    }
  };

  const handleAllPagesToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, allPages: e.target.checked });
  };

  const handlePageRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, pageRange: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg backdrop-blur-sm border border-slate-200">
      <h3 className="text-lg font-semibold mb-6 text-slate-800">Opções de Conversão</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-600">Formato da Imagem</label>
          <div className="flex items-center justify-between space-x-2">
            {formatOptions.map(format => (
                <label key={format} className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 bg-slate-100 has-[:checked]:bg-primary has-[:checked]:text-black font-medium">
                    <input 
                        type="radio"
                        name="format"
                        value={format}
                        checked={settings.format === format}
                        onChange={() => handleFormatChange(format)}
                        className="sr-only"
                    />
                    <span>{format}</span>
                </label>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
            <label htmlFor="quality">Qualidade</label>
            <span className="font-semibold text-slate-800">{settings.quality}%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Baixa</span>
            <input 
              id="quality" 
              type="range" 
              min="10" 
              max="100" 
              value={settings.quality}
              onChange={handleQualityChange}
              className="w-full"
              disabled={settings.format === 'PNG'}
            />
            <span className="text-sm text-slate-500">Alta</span>
          </div>
          {settings.format === 'PNG' && <p className="text-xs text-slate-400 mt-2 text-center">A qualidade é sempre máxima para o formato PNG.</p>}
        </div>

        <div>
            <label htmlFor="dpi" className="block text-sm font-medium mb-2 text-slate-600">Resolução (DPI)</label>
            <input 
                id="dpi" 
                type="number" 
                min="72"
                max="600"
                step="1"
                value={settings.dpi}
                onChange={handleDpiChange}
                className="w-full border-slate-300 bg-slate-50 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-slate-700"
            />
            <p className="text-xs text-slate-400 mt-2 text-center">Valores mais altos resultam em imagens de maior qualidade e tamanho.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-slate-600">Páginas para Converter</label>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-700">Todas as páginas</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.allPages} onChange={handleAllPagesToggle} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <input 
            type="text" 
            placeholder="Ex: 1-5, 8, 10-12" 
            value={settings.pageRange}
            onChange={handlePageRangeChange}
            disabled={settings.allPages}
            className="w-full border-slate-300 bg-slate-50 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />
           <p className="mt-2 text-xs text-center text-slate-500">
            Total de páginas nos arquivos: <span className="font-bold">{totalPages}</span>
           </p>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200">
        <button 
          onClick={onConvert}
          className="w-full bg-primary text-black font-bold py-3 px-4 rounded-lg hover:bg-amber-500 transition-colors duration-200 text-base"
        >
          CONVERTER
        </button>
        <button 
          onClick={onCancel}
          className="w-full text-center mt-3 text-slate-500 font-medium py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};