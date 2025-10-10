import React from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import MainContent from '../components/Dashboard/MainContent';
import SuggestedCreators from '../components/Dashboard/SuggestedCreators';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-800">
      <Sidebar />
      <MainContent />
      <SuggestedCreators />
    </div>
  );
}