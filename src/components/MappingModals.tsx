
import UploadModal from "@/components/UploadModal";
import AddMappingForm from "@/components/AddMappingForm";
import { MappingFile, MappingRow } from "@/lib/types";

interface MappingModalsProps {
  showUploadModal: boolean;
  showAddMappingForm: boolean;
  mappingFile: MappingFile;
  onUploadModalClose: () => void;
  onAddMappingFormClose: () => void;
  onFileUpload: (file: File, importedMappingFile?: MappingFile) => void;
  onAddMapping: (newRow: MappingRow) => void;
}

const MappingModals = ({
  showUploadModal,
  showAddMappingForm,
  mappingFile,
  onUploadModalClose,
  onAddMappingFormClose,
  onFileUpload,
  onAddMapping
}: MappingModalsProps) => {
  return (
    <>
      <UploadModal
        isOpen={showUploadModal}
        onClose={onUploadModalClose}
        onUpload={onFileUpload}
      />

      <AddMappingForm
        mappingFile={mappingFile}
        onAddMapping={onAddMapping}
        isOpen={showAddMappingForm}
        onClose={onAddMappingFormClose}
      />
    </>
  );
};

export default MappingModals;
