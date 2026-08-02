import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dispatchService } from '../../../services/dispatchService';
import { useAuth } from '../../../auth/AuthContext';
import {
  MapPin, Camera, CheckCircle, XCircle, Navigation, AlertTriangle,
  PenLine, Package, User, Clock, ArrowLeft, Upload, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const DELIVERY_STEPS = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

const FAILURE_TYPES = [
  { value: 'customer_unavailable', label: 'Customer Unavailable', icon: User },
  { value: 'wrong_address', label: 'Wrong Address', icon: MapPin },
  { value: 'returned', label: 'Return to Warehouse', icon: Package },
];

const DeliveryStatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [gps, setGps] = useState({ lat: null, lng: null });
  const [gpsTracking, setGpsTracking] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [signature, setSignature] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureType, setFailureType] = useState('customer_unavailable');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [driverId, setDriverId] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    const load = async () => {
      setDriverId(user.id);
      const result = await dispatchService.getDispatch(id);
      if (!cancelled && result.success) {
        setDispatch(result.data);
        const stepIdx = DELIVERY_STEPS.findIndex(s => s.key === result.data.status);
        setActiveStep(stepIdx >= 0 ? stepIdx : 0);
      }
      if (!cancelled) setLoading(false);
    };
    load();

    const timer = setInterval(load, 15000);

    return () => { cancelled = true; clearInterval(timer); };
  }, [id, user]);

  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not available on this device');
      return;
    }
    setGpsTracking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not get GPS position'),
      { enableHighAccuracy: true }
    );
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGps({ lat, lng });
        dispatchService.recordGps(id, driverId, lat, lng).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handleAccept = async () => {
    setActionLoading(true);
    const result = await dispatchService.acceptDelivery(id, driverId);
    if (result.success) {
      setDispatch(prev => ({ ...prev, status: 'accepted', driver_accepted_at: new Date().toISOString() }));
      setActiveStep(1);
      toast.success('Delivery accepted');
    } else toast.error(result.data?.error || 'Failed to accept');
    setActionLoading(false);
  };

  const handleReject = async (reason) => {
    if (!reason.trim()) return;
    setActionLoading(true);
    const result = await dispatchService.rejectDelivery(id, driverId, reason);
    if (result.success) {
      toast.success('Delivery returned to queue');
      navigate('/driver/deliveries');
    } else toast.error(result.data?.error || 'Failed to reject');
    setActionLoading(false);
  };

  const handleStartDelivery = async () => {
    setActionLoading(true);
    if (!gpsTracking) startGpsTracking();
    const result = await dispatchService.startDelivery(id, driverId, gps.lat, gps.lng);
    if (result.success) {
      setDispatch(prev => ({ ...prev, status: 'picked_up' }));
      setActiveStep(2);
      toast.success('Delivery started');
    } else toast.error(result.data?.error || 'Failed to start');
    setActionLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading(true);
    try {
      const result = await dispatchService.uploadDeliveryPhoto(file, driverId);
      if (result.success) {
        setPhotos(prev => [...prev, result.url]);
        toast.success('Photo uploaded');
      }
    } catch { toast.error('Upload failed'); }
    setActionLoading(false);
  };

  const startSignature = () => {
    setShowSignaturePad(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }, 100);
  };

  const handleSignatureMouse = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL('image/png'));
      setShowSignaturePad(false);
      toast.success('Signature captured');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter the recipient name');
      return;
    }
    setActionLoading(true);
    const result = await dispatchService.completeDelivery({
      dispatchId: id,
      driverId,
      photoUrls: photos,
      signatureUrl: signature,
      customerName,
      notes,
      lat: gps.lat,
      lng: gps.lng,
    });
    if (result.success) {
      setDispatch(prev => ({ ...prev, status: 'delivered', delivered_at: new Date().toISOString() }));
      setActiveStep(4);
      toast.success('Delivery completed!');
    } else toast.error(result.data?.error || 'Failed to complete');
    setActionLoading(false);
  };

  const handleFailure = async () => {
    if (!notes.trim()) { toast.error('Please describe the issue'); return; }
    setActionLoading(true);
    const result = await dispatchService.reportFailure({
      dispatchId: id, driverId, failureType, notes, lat: gps.lat, lng: gps.lng
    });
    if (result.success) {
      toast.success('Issue reported');
      navigate('/driver/deliveries');
    } else toast.error(result.data?.error || 'Failed to report');
    setActionLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-nexus-textSecondary">Loading...</div>;
  if (!dispatch) return <div className="p-8 text-center text-nexus-error">Delivery not found</div>;

  const isDelivered = dispatch.status === 'delivered';
  const isFailed = ['customer_unavailable', 'wrong_address', 'returned'].includes(dispatch.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/driver/deliveries')} className="flex items-center gap-2 text-nexus-textSecondary hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Deliveries
      </button>

      <div className="bg-nexus-card rounded-2xl border border-nexus-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-nexus-heading flex items-center gap-2">
            <Package className="text-nexus-success" size={20} />
            Delivery #{dispatch.dispatch_number || dispatch.id.slice(0, 8)}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDelivered ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' :
            isFailed ? 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error' :
            'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold'
          }`}>
            {dispatch.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-nexus-surface dark:bg-nexus-card/30 rounded-xl">
            <User size={18} className="text-nexus-textSecondary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-nexus-heading">
                {dispatch.orders?.shipping_name || dispatch.customer_name || 'N/A'}
              </p>
              <p className="text-xs text-nexus-textSecondary flex items-center gap-1 mt-0.5">
                <Phone size={12} /> {dispatch.orders?.shipping_phone || dispatch.customer_phone || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-nexus-surface dark:bg-nexus-card/30 rounded-xl">
            <MapPin size={18} className="text-nexus-textSecondary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-nexus-heading">{dispatch.delivery_address}</p>
              {dispatch.delivery_city && <p className="text-xs text-nexus-textSecondary">{dispatch.delivery_city}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step <= activeStep
                  ? 'bg-nexus-success text-white'
                  : 'bg-nexus-surface dark:bg-nexus-card text-nexus-textSecondary'
              }`}>
                {step < activeStep ? <CheckCircle size={16} /> : step + 1}
              </div>
              {step < 3 && <div className={`flex-1 h-1 mx-1 rounded ${step < activeStep ? 'bg-nexus-success' : 'bg-nexus-surface dark:bg-nexus-card'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-nexus-textSecondary px-0.5">
          {DELIVERY_STEPS.map(s => <span key={s.key}>{s.label}</span>)}
        </div>
      </div>

      {!isDelivered && !isFailed && (
        <>
          {dispatch.status === 'assigned' && (
            <div className="bg-nexus-card rounded-2xl border border-nexus-border p-6 space-y-3">
              <h2 className="font-bold text-nexus-heading">Accept this delivery?</h2>
              <div className="flex gap-3">
                <button onClick={handleAccept} disabled={actionLoading} className="flex-1 bg-nexus-success hover:bg-nexus-success disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  {actionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <CheckCircle size={18} />}
                  Accept
                </button>
                <button onClick={() => handleReject('Not available')} disabled={actionLoading} className="flex-1 bg-nexus-error hover:bg-nexus-error disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          )}

          {(dispatch.status === 'accepted') && (
            <div className="bg-nexus-card rounded-2xl border border-nexus-border p-6 space-y-3">
              <h2 className="font-bold text-nexus-heading">Ready to start?</h2>
              <div className="flex items-center gap-2 p-3 bg-nexus-surface dark:bg-nexus-card/30 rounded-xl text-sm">
                <MapPin size={16} className="text-nexus-success" />
                {gpsTracking
                  ? <span className="text-nexus-success font-medium">GPS tracking active</span>
                  : <span className="text-nexus-textSecondary">GPS not yet enabled</span>}
              </div>
              <button onClick={handleStartDelivery} disabled={actionLoading} className="w-full bg-nexus-success hover:bg-nexus-success disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                {actionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Navigation size={18} />}
                Start Delivery
              </button>
            </div>
          )}

          {(dispatch.status === 'picked_up' || dispatch.status === 'in_transit') && (
            <div className="bg-nexus-card rounded-2xl border border-nexus-border p-6 space-y-4">
              <h2 className="font-bold text-nexus-heading">Complete Delivery</h2>

              {!gpsTracking && (
                <button onClick={startGpsTracking} className="w-full bg-nexus-info hover:bg-nexus-primary-hover text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <MapPin size={16} /> Enable GPS Tracking
                </button>
              )}

              <div>
                <label className="block text-sm font-medium text-nexus-heading mb-2">Delivery Photos</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {photos.map((url, i) => (
                    <div key={i} className="w-16 h-16 bg-nexus-surface rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="w-16 h-16 bg-nexus-surface rounded-lg flex items-center justify-center cursor-pointer hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                    <Camera size={20} className="text-nexus-textSecondary" />
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-heading mb-2">
                  Recipient Signature {signature ? '(captured)' : ''}
                </label>
                {showSignaturePad ? (
                  <div className="border border-nexus-border rounded-xl overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-32 bg-white cursor-crosshair"
                      onMouseDown={() => setIsDrawing(true)}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseMove={handleSignatureMouse}
                      onMouseLeave={() => setIsDrawing(false)}
                      onTouchStart={() => setIsDrawing(true)}
                      onTouchEnd={() => setIsDrawing(false)}
                      onTouchMove={(e) => {
                        if (!isDrawing) return;
                        const touch = e.touches[0];
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                        const rect = canvas.getBoundingClientRect();
                        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
                        ctx.stroke();
                      }}
                    />
                    <div className="flex gap-2 p-2 bg-nexus-surface dark:bg-nexus-card/30">
                      <button onClick={clearSignature} className="text-xs text-nexus-textSecondary hover:text-nexus-error px-3 py-1">Clear</button>
                      <button onClick={saveSignature} className="text-xs text-nexus-success hover:text-nexus-success font-medium px-3 py-1 ml-auto">Save Signature</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={startSignature} className="w-full border-2 border-dashed border-nexus-border rounded-xl py-8 flex flex-col items-center gap-2 hover:border-nexus-success transition-colors">
                    <PenLine size={24} className="text-nexus-textSecondary" />
                    <span className="text-sm text-nexus-textSecondary">Tap to sign</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-heading mb-2">Recipient Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter recipient name"
                  className="w-full bg-nexus-surface dark:bg-nexus-card/30 border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-success/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-heading mb-2">Delivery Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full bg-nexus-surface dark:bg-nexus-card/30 border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-success/50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowFailureModal(true)} className="px-4 py-3 bg-nexus-gold hover:bg-nexus-gold text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                  <AlertTriangle size={16} /> Report Issue
                </button>
                <button onClick={handleCompleteDelivery} disabled={actionLoading} className="flex-1 bg-nexus-success hover:bg-nexus-success disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-nexus-success/30">
                  {actionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <CheckCircle size={18} />}
                  Mark Delivered
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isDelivered && (
        <div className="bg-nexus-success/10 dark:bg-nexus-success/10 border border-nexus-success/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-nexus-success/10 dark:bg-nexus-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-nexus-success" />
          </div>
          <h2 className="text-xl font-bold text-nexus-success dark:text-nexus-success mb-2">Delivered Successfully</h2>
          <p className="text-sm text-nexus-success dark:text-nexus-success">
            {dispatch.delivered_at ? new Date(dispatch.delivered_at).toLocaleString() : ''}
          </p>
        </div>
      )}

      {showFailureModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowFailureModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-nexus-card rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-nexus-heading">Report Issue</h3>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value)}
                className="w-full bg-nexus-surface dark:bg-nexus-card/30 border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-heading outline-none"
              >
                {FAILURE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                className="w-full bg-nexus-surface dark:bg-nexus-card/30 border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-heading outline-none resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowFailureModal(false)} className="flex-1 py-2.5 bg-nexus-surface text-nexus-text rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={handleFailure} disabled={actionLoading} className="flex-1 py-2.5 bg-nexus-gold hover:bg-nexus-gold text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  {actionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <AlertTriangle size={16} />}
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryStatusPage;
