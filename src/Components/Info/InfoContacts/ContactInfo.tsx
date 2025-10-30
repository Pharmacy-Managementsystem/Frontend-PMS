// ContactInfo.tsx
import ContactBaseInfo from './ContactBaseInfo';
import { useTranslation } from 'react-i18next';

interface ContactInfoProps {
  contactInfo: string;
  title: string;
  onClose: () => void;
}

export default function ContactInfo({ contactInfo, title, onClose }: ContactInfoProps) {
  const { t } = useTranslation();
  
  const supplierSpecificFields = {
    cr: { label: t('contactInfo.commercialRegistration'), type: 'text' as const },
    land_line: { label: t('contactInfo.landLine'), type: 'text' as const },
    tax_number: { label: t('contactInfo.taxNumber'), type: 'text' as const },
    total_due_amount: { label: t('contactInfo.totalDueAmount'), type: 'text' as const },
  };

  return (
    <ContactBaseInfo
      contactId={contactInfo}
      title={title}
      onClose={onClose}
      contactType="supplier"
      additionalFields={supplierSpecificFields}
    />
  );
}