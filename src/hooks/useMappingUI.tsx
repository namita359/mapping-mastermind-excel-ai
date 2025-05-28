
import { useState } from 'react';

export const useMappingUI = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddMappingForm, setShowAddMappingForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  return {
    showUploadModal,
    setShowUploadModal,
    showAddMappingForm,
    setShowAddMappingForm,
    showAIAssistant,
    setShowAIAssistant,
    showSidebar,
    setShowSidebar,
  };
};
