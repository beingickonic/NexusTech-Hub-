import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import { Download, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ReceiptPage = () => {
  const { receiptId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await paymentService.downloadReceipt(receiptId);
        if (res.success) {
          setReceipt(res.data.receipt);
        }
      } catch (error) {
        console.error("Failed to load receipt", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [receiptId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">Receipt not found.</p>
        <Link to="/orders" className="text-orange-500 mt-4 hover:underline">Return to Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-20 px-4 print:pt-0 print:bg-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to={`/orders/${receipt.order_id}`} className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Order
          </Link>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              <Printer size={16} className="mr-2" /> Print
            </button>
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
              <Download size={16} className="mr-2" /> Download PDF
            </button>
          </div>
        </div>

        {/* Receipt Card */}
        <div 
          ref={printRef}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none"
        >
          {/* Header */}
          <div className="bg-slate-900 px-8 py-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-md mb-4 border border-white/20">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">NexusTech Hub</h1>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Payment Receipt</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-12 pb-8 border-b border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Receipt To</p>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{receipt.customer_name}</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{receipt.phone_number}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Receipt Details</p>
                <p className="font-medium text-slate-900 dark:text-white"><span className="text-slate-500">No:</span> {receipt.receipt_number}</p>
                <p className="font-medium text-slate-900 dark:text-white"><span className="text-slate-500">Date:</span> {new Date(receipt.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="font-medium text-slate-900 dark:text-white"><span className="text-slate-500">Order ID:</span> #{receipt.order_id}</p>
              </div>
            </div>

            <div className="mb-12">
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-sm tracking-wider">Order Summary</h4>
              <div className="w-full">
                <div className="flex text-sm text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                  <div className="flex-1">Description</div>
                  <div className="w-24 text-center">Qty</div>
                  <div className="w-32 text-right">Amount</div>
                </div>
                
                {receipt.items && receipt.items.map((item, index) => (
                  <div key={index} className="flex text-slate-900 dark:text-slate-300 py-3 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex-1 font-medium">{item.product_name}</div>
                    <div className="w-24 text-center">{item.quantity}</div>
                    <div className="w-32 text-right">Ksh {parseFloat(item.line_total).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Payment Info</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between max-w-xs"><span className="text-slate-500">Method:</span> <span className="font-bold text-slate-900 dark:text-white uppercase">{receipt.provider || 'ONLINE'}</span></p>
                  <p className="flex justify-between max-w-xs"><span className="text-slate-500">M-Pesa Ref:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{receipt.mpesa_receipt || receipt.payment_id}</span></p>
                  <p className="flex justify-between max-w-xs"><span className="text-slate-500">Status:</span> <span className="text-green-500 font-bold">Successful</span></p>
                </div>
              </div>
              <div className="flex flex-col justify-end text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Paid</p>
                <h2 className="text-3xl font-bold text-orange-500">Ksh {parseFloat(receipt.amount).toLocaleString()}</h2>
              </div>
            </div>

          </div>
          
          <div className="bg-slate-100 dark:bg-slate-900/80 p-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            If you have any questions concerning this receipt, please contact <strong>support@nexustechhub.com</strong>
            <p className="mt-2 text-xs">Thank you for your business!</p>
          </div>
        </div>
      </div>

      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `}
      </style>
    </div>
  );
};

export default ReceiptPage;
