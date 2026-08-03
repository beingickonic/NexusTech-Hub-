import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, Clock, CheckCircle, XCircle, AlertTriangle, Package,
  Search, Filter, Plus, User, MapPin, Phone,
  Calendar, Printer, Eye, Edit3, X, Check,
  ArrowRightLeft
} from 'lucide-react';
import { dispatchService } from '../../services/dispatchService';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    variant: 'pending',   icon: Clock },
  assigned:   { label: 'Assigned',   variant: 'info',      icon: User },
  picked_up:  { label: 'Picked Up',  variant: 'info',      icon: Package },
  in_transit: { label: 'In Transit', variant: 'pending',   icon: Truck },
  delivered:  { label: 'Delivered',  variant: 'success',   icon: CheckCircle },
  failed:     { label: 'Failed',     variant: 'danger',    icon: XCircle },
  returned:   { label: 'Returned',   variant: 'info',      icon: ArrowRightLeft }
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge variant={cfg.variant}>
      <cfg.icon size={11} className="mr-1" /> {cfg.label}
    </Badge>
  );
};

const AssignDriverModal = ({ dispatch, onClose, onAssigned }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    driverService.getAvailableDrivers().then(res => {
      setDrivers(res.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = drivers.filter(d =>
    !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedDriver) return;
    setAssigning(true);
    try {
      await dispatchService.assignDriver(dispatch.id, selectedDriver.user_id);
      toast.success(`Driver ${selectedDriver.full_name} assigned!`);
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Assign Driver"
      footer={
        <>
          <Button onClick={onClose} variant="secondary" size="sm">Cancel</Button>
          <Button onClick={handleAssign} disabled={assigning || !selectedDriver} variant="primary" size="sm">
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SearchInput
          placeholder="Search available drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? (
          <Skeleton variant="rectangular" className="h-20" />
        ) : filtered.length === 0 ? (
          <p className="text-center py-4 text-nexus-muted text-sm">No drivers available</p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filtered.map(d => (
              <div
                key={d.id}
                onClick={() => setSelectedDriver(d)}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedDriver?.id === d.id
                    ? 'border-nexus-primary bg-nexus-primary/10'
                    : 'border-nexus-border hover:bg-nexus-surface'
                }`}
              >
                <p className="font-semibold text-nexus-heading text-sm">{d.full_name}</p>
                <p className="text-xs text-nexus-muted mt-0.5">Vehicle: {d.vehicle_number} | {d.vehicle_type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

const DispatchPage = ({ defaultStatus = 'all' }) => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [selectedDriverModal, setSelectedDriverModal] = useState(null);

  const fetchDispatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dispatchService.getDispatches();
      if (res.success) {
        setDispatches(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load dispatches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  const handleRefresh = () => {
    fetchDispatches();
  };

  const filtered = dispatches.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch = !search ||
      d.dispatch_number?.toLowerCase().includes(search.toLowerCase()) ||
      d.delivery_address?.toLowerCase().includes(search.toLowerCase()) ||
      d.recipient_name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Delivery Dispatch"
        subtitle="Manage route planning, courier assignments, and cargo dispatches"
        actions={
          <Button onClick={handleRefresh} variant="secondary" size="sm">
            Refresh
          </Button>
        }
      />

      <Card className="p-4" hoverElevation={false}>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search dispatches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Assigned', value: 'assigned' },
                { label: 'Picked Up', value: 'picked_up' },
                { label: 'In Transit', value: 'in_transit' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Failed', value: 'failed' },
                { label: 'Returned', value: 'returned' }
              ]}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="rectangular" className="h-10" />
            <Skeleton variant="rectangular" className="h-10" />
            <Skeleton variant="rectangular" className="h-10" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No dispatches found"
            description="No active delivery dispatches match the selected filters."
            icon={Truck}
          />
        ) : (
          <Table headers={['Dispatch #', 'Recipient', 'Destination', 'Status', 'Actions']}>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono font-bold text-nexus-heading">
                  #{d.dispatch_number}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-nexus-heading text-sm">{d.recipient_name}</div>
                  <div className="text-xs text-nexus-muted flex items-center gap-1 mt-0.5">
                    <Phone size={12} /> {d.recipient_phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-nexus-heading flex items-center gap-1.5 max-w-xs truncate">
                    <MapPin size={14} className="text-nexus-muted flex-shrink-0" />
                    {d.delivery_address}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={d.status} />
                </TableCell>
                <TableCell className="text-right">
                  {d.status === 'pending' && (
                    <Button onClick={() => setSelectedDriverModal(d)} variant="primary" size="sm">
                      Assign Driver
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {selectedDriverModal && (
        <AssignDriverModal
          dispatch={selectedDriverModal}
          onClose={() => setSelectedDriverModal(null)}
          onAssigned={fetchDispatches}
        />
      )}
    </div>
  );
};

export default DispatchPage;
export { DispatchPage };
