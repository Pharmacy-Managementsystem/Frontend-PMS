// CustomerInfo.tsx
import ContactBaseInfo from "./ContactBaseInfo";
import { useTranslation } from "react-i18next";

interface CustomerInfoProps {
  CustomerInfo: string;
  title: string;
  onClose: () => void;
}

export default function CustomerInfo({
  CustomerInfo,
  title,
  onClose,
}: CustomerInfoProps) {
  const { t } = useTranslation();

  const customerSpecificFields = {
    idc: {
      label: t("contactInfo.fields.identificationCard"),
      type: "text" as const,
    },
    group_name: {
      label: t("contactInfo.fields.groupName"),
      type: "text" as const,
    },
    idc_attachment: {
      label: t("contactInfo.fields.idcAttachment"),
      type: "text" as const,
    },
  };

  return (
    <ContactBaseInfo
      contactId={CustomerInfo}
      title={title}
      onClose={onClose}
      contactType="customer"
      additionalFields={customerSpecificFields}
    />
  );
}
