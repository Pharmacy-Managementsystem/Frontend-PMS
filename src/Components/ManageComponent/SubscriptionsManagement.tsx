import { useMemo, useState } from 'react'
import { useGet } from '../../Hook/API/useApiGet'
import { DataTable } from '../Table/DataTable'
import TableRowSubscription from '../Table/TableRowSubscription'
import Pagination from '../Pagination'
import Swal from 'sweetalert2'
import api from '../../Hook/API/api'
import { useQueryClient } from '@tanstack/react-query'

type SubscriptionPackage = {
  id: string | number
  name: string // client/business name
  package_name?: string
  price?: string | number
  subscription_start_date?: string
  subscription_end_date?: string
  subscription_status?: 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending'
}

type PackageItem = {
  id: number | string
  name: string
}

export default function SubscriptionsManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending'>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [pkgId, setPkgId] = useState<string>('all')

  const params = useMemo(() => {
    const p: Record<string, unknown> = {}
    if (search) p.search = search
    if (status !== 'all') p.subscription_status = status
    if (pkgId !== 'all') p.package = pkgId
    p.page = page
    p.page_size = pageSize
    return p
  }, [search, status, pkgId, page, pageSize])

  const { data, isLoading } = useGet<{ results?: SubscriptionPackage[]; data?: SubscriptionPackage[]; count?: number }>({
    endpoint: '/api/superadmin/subscription-packages/',
    queryKey: ['subscription-packages', params],
    params,
  })

  const { data: packagesData } = useGet<{ results?: PackageItem[]; data?: PackageItem[] }>({
    endpoint: '/api/superadmin/packages/',
    queryKey: ['packages'],
  })

  const list: SubscriptionPackage[] = useMemo(() => {
    if (Array.isArray(data)) return data as SubscriptionPackage[]
    if (data?.results) return data.results
    if (data?.data) return data.data
    return []
  }, [data])

  const columns = ['Client', 'Package', 'Start', 'End', 'Status', 'Price']

  const tableData = useMemo(() => {
    const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '-')
    return list.map((pkg) => ({
      id: String(pkg.id),
      Client: pkg.name,
      Package: pkg.package_name ?? '-',
      Start: pkg.subscription_start_date ?? '-',
      End: pkg.subscription_end_date ?? '-',
      Status: capitalize(pkg.subscription_status),
      Price: pkg.price ?? '-',
    }))
  }, [list])

  const handleEdit = async (id: string) => {
    const item = list.find((x) => String(x.id) === id)
    const currentStatus = item?.subscription_status || 'active'
    const currentEnd = item?.subscription_end_date?.slice(0, 10) || ''

    const { isConfirmed, value } = await Swal.fire<{ subscription_status: string; subscription_start_date: string; subscription_end_date: string }>({
      title: 'Update subscription',
      html: `
        <div class="grid grid-cols-1 gap-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Status</label>
            <select id="swal-status" class="w-full border rounded-md px-2 py-2" aria-label="Subscription status">
              <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>Active</option>
              <option value="expired" ${currentStatus === 'expired' ? 'selected' : ''}>Expired</option>
              <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
            </select>
          </div>

          <div class="grid grid-cols-1 gap-4">
            
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">End date</label>
              <input id="swal-end" type="date" class="w-full border rounded-md px-2 py-2" value="${currentEnd}" aria-label="End date" />
            </div>
          </div>

        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl shadow-2xl p-4',
        confirmButton: 'bg-blue-600 hover:bg-emerald-700',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-black',
      },
      preConfirm: () => {
        const statusEl = document.getElementById('swal-status') as HTMLSelectElement | null
        const endEl = document.getElementById('swal-end') as HTMLInputElement | null
        const subscription_status = statusEl?.value
        const subscription_end_date = endEl?.value

        if (!subscription_status || !subscription_end_date) {
          Swal.showValidationMessage('Please fill all fields')
          return
        }

        

        return {
          subscription_status,
          subscription_end_date: new Date(subscription_end_date).toISOString(),
        }
      },
    })

    if (!isConfirmed || !value) return

    try {
      await api.patch(`/api/superadmin/subscription-packages/${id}/`, value)
      await queryClient.invalidateQueries({ queryKey: ['subscription-packages', params] })
      Swal.close()
      Swal.fire({ icon: 'success', title: 'Updated', text: 'Subscription updated successfully' })
    } catch (err: unknown) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subscription';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMessage })
    }
  }

  return (
    <div >
      <div className="px-5 pt-5 pb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-title">Subscriptions</h1>
      </div>

      <div className="px-5 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <select
            className="border border-slate-200 rounded-lg px-3 py-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status)
              setPage(1)
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2"
            value={pkgId}
            onChange={(e) => {
              setPkgId(e.target.value)
              setPage(1)
            }}
            aria-label="Filter by package"
          >
            <option value="all">All Packages</option>
            {(
              (Array.isArray(packagesData) ? packagesData : packagesData?.results || packagesData?.data || []) as PackageItem[]
            ).map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={tableData}
              RowComponent={TableRowSubscription}
              onActionsClick={(id: string) => handleEdit(id)}
            />
            <Pagination
              currentPage={page}
              totalItems={(data as { count?: number })?.count ?? tableData.length}
              itemsPerPage={pageSize}
              onPageChange={(p) => setPage(p)}
              hasNext={Boolean((data as { next?: string | null })?.next)}
              hasPrevious={Boolean((data as { previous?: string | null })?.previous)}
            />
          </>
        )}
      </div>
    </div>
  )
}
