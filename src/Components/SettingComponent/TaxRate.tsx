// TaxRate.tsx
import { useState } from 'react';
import { DataTable } from '../Table/DataTable';
import { TableRow } from '../Table/TableRow';
import { useGet } from '../../Hook/API/useApiGet';
import ReusableForm from "../Forms/ReusableForm";
import Pagination from "../Pagination";
import {
  CircularProgress,
  Dialog,
  IconButton
} from '@mui/material';
import Box from '@mui/material/Box';
import { X } from 'lucide-react';
import api from "../../Hook/API/api";
import Swal from 'sweetalert2';
import { PackagePlus } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface TaxRate {
  id: number;
  name: string;
  country: string;
  country_id?: number;
  country_tax_rate: string;
  rate: string;
  type?: 'country' | 'custom';
}

interface DataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaxRate[];
}

interface Country {
  id: number;
  name: string;
  code: string;
  tax_rate: string; 
}

interface CountryResponse {
  results: Country[];
}

const TaxRate = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const countryColumns = [
    t('settings.taxRates.id'),
    t('settings.taxRates.country'),
    t('settings.taxRates.countryTaxRate'),
  ];

  const customColumns = [
    t('settings.taxRates.id'),
    t('settings.taxRates.customName'),
    t('settings.taxRates.taxRate'),
  ];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [rateType, setRateType] = useState<'country' | 'custom'>('country');
  const [createType, setCreateType] = useState<'country' | 'custom'>('country');

  const { data: taxResponse, isLoading, error, refetch } = useGet<DataResponse>({
    endpoint: `/api/business/settings/tax-rates/?page=${page}&page_size=${pageSize}`,
    queryKey: ['tax-rates', page],
  });

  const { data: corecountryTaxResponse } = useGet<CountryResponse>({
    endpoint: `/api/core/country-tax/`,
    queryKey: ['country-tax'],
  });

  const countryOptions = corecountryTaxResponse?.results.map(countryTax => ({
    value: countryTax.id,
    label: countryTax.name,
    tax_rate: countryTax.tax_rate
  })) || [];

  const filteredTaxRates = taxResponse?.results?.filter(tax => {
    if (rateType === 'country') {
      return tax.id; 
    } else {
      return !tax.country_id; 
    }
  }) || [];

  const formFieldsEdit = [
    { 
      name: 'tax', 
      label: t('settings.taxRates.taxRate'), 
      type: 'select', 
      required: true,
      options: countryOptions
    }
  ];
  
  const formFieldsCreateCountry = [
    { 
      name: 'tax', 
      label: t('settings.taxRates.countryTax'), 
      type: 'select', 
      required: true,
      options: countryOptions
    }
  ];

  const formFieldsCreateCustom = [
    { name: 'name', label: t('settings.taxRates.customName'), required: true },
    { name: 'rate', label: t('settings.taxRates.taxRate'), required: true },
  ];

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setCreateType('country'); 
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingTaxRate(null);
    refetch();
  };

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: t('settings.swal.areYouSure'),
      text: t('settings.swal.cantRevert'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('settings.swal.yesDelete')
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/business/settings/tax-rates/${id}/`);
        if (response.status === 204) {
          Swal.fire(
            t('settings.swal.deleted'),
            t('settings.swal.taxRateDeleted'),
            'success'
          );
          refetch();
        }
      } catch (error) {
        console.error('Error deleting tax rate:', error);
        Swal.fire(
          t('settings.swal.error'),
          t('settings.swal.errorDeleting'),
          'error'
        );
      }
    }
  };

  const handleEditClick = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const taxRate = taxResponse?.results.find(p => p.id === numericId);
    if (taxRate) {
      setEditingTaxRate(taxRate);
      setIsEditModalOpen(true);
    }
  };

  const transformedData = filteredTaxRates.map((tax) => {
    if (rateType === 'country') {
      return {
        id: tax.id,
        [countryColumns[0]]: tax.id,
        [countryColumns[1]]: tax.country,
        [countryColumns[2]]: tax.country_tax_rate,
      };
    } else {
      return {
        id: tax.id,
        [customColumns[0]]: tax.id,
        [customColumns[1]]: tax.name,
        [customColumns[2]]: tax.rate,
      };
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <Box className="flex justify-center items-center w-full h-screen">
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error) return <div className="p-6">{t('settings.taxRates.errorLoading')}: {error.message}</div>;

  const hasTaxRates = taxResponse && taxResponse.results && taxResponse.results.length > 0;
  const hasFilteredRates = filteredTaxRates.length > 0;

  return (
    <div className="container mx-auto p-6">

        <h1 className="text-3xl font-bold text-title pb-3 mb-2">{rateType === 'country' ? t('settings.taxRates.countryRates') : t('settings.taxRates.customRates')}</h1>
     
      {/* Toggle Filter */}
      <div className={`mb-6 flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`inline-flex rounded-lg border border-gray-300 bg-white  ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setRateType('country')}
            className={`px-6 py-2 ${isRTL ? 'rounded-l-md' : 'rounded-l-md'}  text-sm font-medium transition-all ${
              rateType === 'country'
                ? 'bg-[#E0E0E0] text-black'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('settings.taxRates.countryRatesToggle')}
          </button>
          <button
            onClick={() => setRateType('custom')}
            className={`px-6 py-2 ${isRTL ? 'rounded-r-md' : 'rounded-r-md'} text-sm font-medium transition-all ${
              rateType === 'custom'
                ? 'bg-[#E0E0E0] text-black'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('settings.taxRates.customRatesToggle')}
          </button>
        </div>

        {/* Add Buttons */}
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setCreateType('country');
              setIsCreateModalOpen(true);
            }}
          >
            {t('settings.taxRates.addCountryRate')}
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => {
              setCreateType('custom');
              setIsCreateModalOpen(true);
            }}
          >
            {t('settings.taxRates.addCustomRate')}
          </button>
        </div>
      </div>

      {!hasTaxRates ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6  mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('settings.taxRates.noTaxRates')}</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {t('settings.taxRates.getStarted')}
          </p>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setCreateType('country');
                setIsCreateModalOpen(true);
              }}
            >
              {t('settings.taxRates.addCountryRate')}
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => {
                setCreateType('custom');
                setIsCreateModalOpen(true);
              }}
            >
              {t('settings.taxRates.addCustomRate')}
            </button>
          </div>
        </div>
      ) : !hasFilteredRates ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackagePlus size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {rateType === 'country' ? t('settings.taxRates.noCountryRates') : t('settings.taxRates.noCustomRates')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {t('settings.taxRates.getStarted')}
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setCreateType(rateType);
              setIsCreateModalOpen(true);
            }}
          >
            {rateType === 'country' ? t('settings.taxRates.addCountryRate') : t('settings.taxRates.addCustomRate')}
          </button>
        </div>
      ) : (
        <>
          
          <DataTable
            columns={rateType === 'country' ? countryColumns : customColumns}
            data={transformedData}
            RowComponent={TableRow}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={page}
            totalItems={taxResponse.count}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            hasNext={!!taxResponse.next}
            hasPrevious={!!taxResponse.previous}
          />
        </>
      )}

      {/* Create Modals */}
      {isCreateModalOpen && (
        <ReusableForm
          fields={createType === 'country' ? formFieldsCreateCountry : formFieldsCreateCustom}
          title={createType === 'country' ? t('settings.taxRates.addCountryRate') : t('settings.taxRates.addCustomRate')}
          endpoint={createType === 'country' 
            ? "/api/business/settings/tax-rates/" 
            : "/api/business/settings/tax-rates/custom/"}
          method="post"
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateType('country');
          }}
          onSuccess={handleCreateSuccess}
          submitButtonText={createType === 'country' ? t('settings.taxRates.addCountryRate') : t('settings.taxRates.addCustomRate')}
          key={`create-${createType}-form`}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingTaxRate && (
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTaxRate(null);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingTaxRate(null);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X />
          </IconButton>
          <ReusableForm
            fields={formFieldsEdit}
            title={t('settings.taxRates.editTaxRate')}
            endpoint={`/api/business/settings/tax-rates/${editingTaxRate.id}/`}
            method="patch"
            initialValues={{ tax: editingTaxRate.country_id }}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTaxRate(null);
            }}
            onSuccess={handleEditSuccess}
            submitButtonText={t('settings.taxRates.updateTaxRate')}
            key={`edit-form-${editingTaxRate.id}`}
          />
        </Dialog>
      )}
    </div>
  );
};

export default TaxRate;