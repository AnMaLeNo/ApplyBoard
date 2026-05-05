import { useState } from 'react';
import MasterDetailLayout from './MasterDetailLayout.jsx';
import CvModulesList from './CvModulesList.jsx';
import CvModuleDetailPanel from './CvModuleDetailPanel.jsx';

export default function CvModulesPage({ cvModulesState }) {
  const {
    modules,
    isLoading,
    errorMessage,
    refresh,
    createModule,
    renameModule,
    deleteModule,
    createVariant,
    updateVariant,
    deleteVariant,
  } = cvModulesState;

  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Dérivé : la vue détail reflète automatiquement les mutations sans dupliquer le module dans un state local.
  const selectedModule =
    modules.find((module) => module.id === selectedModuleId) ?? null;

  const handleSelectModule = (module) => {
    setSelectedModuleId(module.id);
    setDetailOpen(true);
  };

  const handleDeleteModule = async (id) => {
    await deleteModule(id);
    if (id === selectedModuleId) {
      setSelectedModuleId(null);
      setDetailOpen(false);
    }
  };

  return (
    <MasterDetailLayout
      title="Modules de CV"
      subtitle="Stockez et organisez les blocs réutilisables de votre CV : titre, accroche, expériences, compétences..."
      isLoading={isLoading}
      errorMessage={errorMessage}
      detailOpen={detailOpen}
      onDetailOpenChange={setDetailOpen}
      canOpenDetail={selectedModule != null}
      detailKey={selectedModuleId}
      table={
        <CvModulesList
          modules={modules}
          selectedModuleId={selectedModuleId}
          isLoading={isLoading}
          onSelectModule={handleSelectModule}
          onCreateModule={createModule}
          onRefresh={refresh}
        />
      }
      detail={
        <CvModuleDetailPanel
          module={selectedModule}
          busy={isLoading}
          onBack={() => setDetailOpen(false)}
          onRename={renameModule}
          onDelete={handleDeleteModule}
          onCreateVariant={createVariant}
          onUpdateVariant={updateVariant}
          onDeleteVariant={deleteVariant}
        />
      }
    />
  );
}
