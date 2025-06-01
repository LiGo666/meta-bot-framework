import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const LLM_MODELS = {
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    llmModel: LLM_MODELS.GPT4O,
    verbosityLevel: 'normal', // 'minimal', 'normal', 'detailed'
    autoAdvance: false,
    showAgentCommunication: true,
    enableFilePreview: true,
    maxPreviewLength: 500,
    apiTimeout: 60 // seconds
  });

  const updateSetting = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const resetSettings = () => {
    setSettings({
      llmModel: LLM_MODELS.GPT4O,
      verbosityLevel: 'normal',
      autoAdvance: false,
      showAgentCommunication: true,
      enableFilePreview: true,
      maxPreviewLength: 500,
      apiTimeout: 60
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
