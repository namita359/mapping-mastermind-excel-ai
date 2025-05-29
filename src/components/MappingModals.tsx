
import UploadModal from "@/components/UploadModal";
import AddMappingForm from "@/components/AddMappingForm";
import { MappingFile, MappingRow } from "@/lib/types";

interface MappingModalsProps {
  showUploadModal: boolean;
  showAddMappingModal: boolean;
  onUploadModalClose: () => void;
  onAddMappingModalClose: () => void;
  onFileUpload: (file: File, importedMappingFile?: MappingFile) => void;
  onAddMapping: (newRow: MappingRow) => void;
}

const MappingModals = ({
  showUploadModal,
  showAddMappingModal,
  onUploadModalClose,
  onAddMappingModalClose,
  onFileUpload,
  onAddMapping
}: MappingModalsProps) => {
  const emptyMappingFile: MappingFile = {
    id: "temp",
    rows: [],
    name: "",
    sourceSystem: "",
    targetSystem: "",
    createdBy: "",
    status: "draft",
    createdAt: new Date()
  };

  return (
    <>
      <UploadModal
        isOpen={showUploadModal}
        onClose={onUploadModalClose}
        onUpload={onFileUpload}
      />

      <AddMappingForm
        mappingFile={emptyMappingFile}
        onAddMapping={onAddMapping}
        isOpen={showAddMappingModal}
        onClose={onAddMappingModalClose}
      />
    </>
  );
};

export default MappingModals;
