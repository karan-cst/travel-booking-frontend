'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getReq, postReq } from '@/services/axios';
import { AuthGuard } from '@/components/guards/guards';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ShieldCheck, Calendar, ArrowLeft, CreditCard, Sparkles, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

function BookingCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingResponse, setBookingResponse] = useState(null);

  // Payment Webhook Simulation States
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLog, setPaymentLog] = useState([]);
  const [simulatedEventId, setSimulatedEventId] = useState('');

  useEffect(() => {
    if (packageId) {
      fetchPackageDetails();
    } else {
      setError('No package ID specified.');
      setLoading(false);
    }
  }, [packageId]);

  const fetchPackageDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getReq('/packages');
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        const found = response.data.find((p) => p._id === packageId);
        if (found) {
          setPkg(found);
        } else {
          setError('Travel package not found.');
        }
      } else {
        setError('Failed to fetch package catalogues.');
      }
    } catch (err) {
      setError(err?.message || 'Error fetching package details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceHold = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await postReq('/bookings', { packageId });
      if (response?.status === 'success' && response?.data) {
        setBookingResponse(response.data);
        // Create a unique event ID for the payment simulation
        setSimulatedEventId(`evt_sim_${Math.random().toString(36).substr(2, 9)}`);

        // Sync to LocalStorage fallback database
        try {
          const newBooking = {
            _id: response.data.bookingId,
            packageId: packageId,
            status: response.data.status,
            holdExpiresAt: response.data.holdExpiresAt,
            createdAt: new Date().toISOString(),
          };
          const existing = JSON.parse(localStorage.getItem('local_bookings') || '[]');
          existing.push(newBooking);
          localStorage.setItem('local_bookings', JSON.stringify(existing));
        } catch (e) {
          console.error('LocalStorage write failed:', e);
        }
      } else {
        setError('Unexpected booking response format.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to place booking hold. Inventory might be sold out.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment gateway callback webhook directly to backend
  const handleSimulatePayment = async (isRetry = false) => {
    setPaying(true);
    const eventId = simulatedEventId;
    const bookingId = bookingResponse.bookingId;

    const payload = {
      id: eventId,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `pi_sim_${bookingId.substr(-6)}`,
          metadata: {
            bookingId: bookingId,
          },
        },
      },
    };

    setPaymentLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Sending Webhook Event...`]);

    try {
      // Trigger Webhook directly. Using bypass header x-mock-webhook
      const response = await postReq('/payments/webhook', payload, {
        headers: {
          'x-mock-webhook': 'true',
        },
      });

      if (response?.received) {
        setPaymentSuccess(true);
        setPaymentLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Webhook Accepted! Status: ${isRetry ? 'Idempotent Verified' : 'Paid & Confirmed'}`,
        ]);

        // Sync status to LocalStorage fallback database
        try {
          const existing = JSON.parse(localStorage.getItem('local_bookings') || '[]');
          const updated = existing.map((b) =>
            b._id === bookingId ? { ...b, status: 'PAID', holdExpiresAt: null } : b
          );
          localStorage.setItem('local_bookings', JSON.stringify(updated));
        } catch (e) {
          console.error('LocalStorage update failed:', e);
        }
      } else {
        setPaymentLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Webhook rejected.`]);
      }
    } catch (err) {
      setPaymentLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Failed: ${err?.message || 'Webhook transmission error'}`,
      ]);
    } finally {
      setPaying(false);
    }
  };

  if (loading && !bookingResponse) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-10">
        <EmptyState
          title="Reservation Error"
          description={error}
          actionText="Back to Packages"
          onAction={() => router.push('/packages')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.push('/packages')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Packages
      </button>

      {!bookingResponse ? (
        /* Step 1: Pre-reservation verification hold page */
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Review Reservation</h2>
              <p className="text-sm text-gray-400 mt-1">Please confirm details to establish your booking lock hold.</p>
            </div>
            {pkg.flashSale?.isActive && (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 font-bold text-xs rounded-full border border-red-100 animate-pulse">
                <Zap className="h-3.5 w-3.5 fill-red-600" />
                Flash Sale Price Active
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{pkg.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{pkg.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-2xl text-center">
                <span className="text-xs text-gray-400 block font-medium">Allotment Price</span>
                <span className="text-2xl font-extrabold text-blue-600 mt-1 block">${pkg.price}</span>
              </div>
              <div className="p-4 border border-gray-100 rounded-2xl text-center">
                <span className="text-xs text-gray-400 block font-medium">Hold Duration</span>
                <span className="text-2xl font-extrabold text-gray-900 mt-1 block">10 Minutes</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-4 bg-blue-50 text-blue-800 rounded-2xl text-sm border border-blue-100/50">
            <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
            <p className="leading-normal">
              Upon clicking the button, a temporary <strong>10-minute hold</strong> is secured in our high-concurrency Redis lock registry. You must finish the payment checkout before this counter expires to verify your purchase.
            </p>
          </div>

          <button
            onClick={handlePlaceHold}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Confirm & Lock Reservation Allotment
          </button>
        </div>
      ) : (
        /* Step 2: Hold secured, simulate payment gateway webhook */
        <div className="space-y-6">
          <div className="bg-white border border-green-100 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-5">
              <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Hold Secured Successfully</h2>
                <p className="text-xs text-gray-400 mt-0.5">Booking ID: {bookingResponse.bookingId}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100/60 text-sm flex items-start gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Allotment expiry countdown active!</p>
                <p className="mt-0.5 text-xs text-amber-700 leading-normal">
                  Your reservation hold is locked in Redis. Complete the checkout verification. Hold expires on:{' '}
                  <strong>{new Date(bookingResponse.holdExpiresAt).toLocaleTimeString()}</strong>.
                </p>
              </div>
            </div>

            {/* Simulated Payment Trigger box */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Mock Stripe Payment Integration
              </h3>
              <p className="text-xs text-gray-500 leading-normal">
                Normally, the Stripe gateway communicates with your backend webhook asynchronously upon checkout completion. You can simulate that exact payment webhook callback below.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSimulatePayment(false)}
                  disabled={paying || paymentSuccess}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-green-100 disabled:opacity-50 cursor-pointer"
                >
                  {paying ? 'Processing...' : 'Trigger Succeeded Webhook'}
                </button>

                <button
                  onClick={() => handleSimulatePayment(true)}
                  disabled={paying || !paymentSuccess}
                  className="px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  title="Test webhook idempotency checks by firing the same event payload again"
                >
                  <RefreshCw className="h-4 w-4" />
                  Test Idempotency (Retry)
                </button>
              </div>
            </div>

            {/* Webhook log logger details */}
            {paymentLog.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-1 overflow-x-auto shadow-inner">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Transaction Webhook Logs:</p>
                {paymentLog.map((log, index) => (
                  <p key={index}>{log}</p>
                ))}
              </div>
            )}

            {paymentSuccess && (
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                <p className="font-bold text-green-800">Booking Confirmed!</p>
                <p className="text-xs text-green-600 mt-1">Payment verified. You can now view your bookings dashboard.</p>
                <button
                  onClick={() => router.push('/my-bookings')}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  Go to My Bookings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingCreatePage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}>
          <BookingCreateContent />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
