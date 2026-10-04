import React from 'react';
import { DebugPage } from './DebugPage';
import { SupportedLanguage } from '../types';

export interface CheckerPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

export const CheckerPage: React.FC<CheckerPageProps> = (props) => {
  return <DebugPage {...props} />;
};

export default CheckerPage;
