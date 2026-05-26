import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { getOrder } from '../../orders/api/orderApi'
import { confirmBakongPayment } from '../api/cartApi'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { useAuth } from '../../../shared/hooks/useAuth'

function findBakongPayment(order) {
  return order?.payment_transactions?.find((payment) => payment.payment_method === 'bakong') ?? null
}

export function BakongPaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [countdown, setCountdown] = useState('')

  const bakongPayment = findBakongPayment(order)
  const isPaid = bakongPayment?.status === 'paid'
  const isExpired = countdown === 'Expired'

  useEffect(() => {
    if (isAuthLoading) return

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    let active = true

    async function loadOrder() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getOrder(orderId)
        if (active) setOrder(data)
      } catch (error) {
        if (active) setError(error?.message ?? 'Could not load Bakong payment.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadOrder()

    return () => { active = false }
  }, [isAuthenticated, isAuthLoading, navigate, orderId])

  useEffect(() => {
    let active = true

    async function makeQrCode() {
      if (!bakongPayment?.qr_code_string || isPaid) {
        setQrDataUrl('')
        return
      }

      const image = await QRCode.toDataURL(bakongPayment.qr_code_string, {
        width: 280,
        margin: 2,
        color: {
          dark: '#003c3c',
          light: '#ffffff',
        },
      })

      if (active) setQrDataUrl(image)
    }

    makeQrCode()

    return () => { active = false }
  }, [bakongPayment?.qr_code_string, isPaid])

  useEffect(() => {
    if (!bakongPayment?.expires_at || isPaid) {
      setCountdown('')
      return undefined
    }

    function updateCountdown() {
      const remainingMs = new Date(bakongPayment.expires_at).getTime() - Date.now()

      if (remainingMs <= 0) {
        setCountdown('Expired')
        return
      }

      const minutes = Math.floor(remainingMs / 60000)
      const seconds = Math.floor((remainingMs % 60000) / 1000)
      setCountdown(`${minutes}:${String(seconds).padStart(2, '0')}`)
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(timer)
  }, [bakongPayment?.expires_at, isPaid])

  useEffect(() => {
    if (!order?.id || !bakongPayment || isPaid || isExpired) return undefined

    let active = true

    async function checkPayment() {
      try {
        const confirmedOrder = await confirmBakongPayment(order.id)
        if (active) setOrder(confirmedOrder)
      } catch {
        // Keep polling quietly until Bakong confirms payment or the QR expires.
      }
    }

    const firstCheck = window.setTimeout(checkPayment, 4000)
    const interval = window.setInterval(checkPayment, 7000)

    return () => {
      active = false
      window.clearTimeout(firstCheck)
      window.clearInterval(interval)
    }
  }, [bakongPayment, isExpired, isPaid, order?.id])

  if (isAuthLoading || isLoading) {
    return <div className="mx-auto max-w-7xl px-5 py-12 text-sm font-black text-teal-900">Loading payment...</div>
  }

  if (error || !order || !bakongPayment) {
    return (
      <section className="mx-auto grid max-w-2xl gap-4 px-5 py-12 text-center">
        <h1 className="text-3xl font-black text-teal-950">Payment not found</h1>
        <p className="text-sm font-semibold text-red-700">{error || 'This order does not have a Bakong payment.'}</p>
        <Link className="mx-auto rounded-md bg-teal-800 px-5 py-3 text-sm font-black text-white hover:bg-teal-900" to="/cart">
          Back to cart
        </Link>
      </section>
    )
  }

  if (isPaid) {
    return (
      <section className="mx-auto grid max-w-2xl gap-5 px-5 py-12 text-center">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-800 text-3xl font-black text-white">✓</div>
          <p className="mt-4 text-sm font-black uppercase tracking-wide text-teal-700">Payment success</p>
          <h1 className="mt-2 text-3xl font-black text-teal-950">Receipt confirmed</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-teal-900/70">
            Your Bakong payment was confirmed. Your order was sent to Telegram and we will contact you soon.
          </p>

          <div className="mx-auto mt-5 grid gap-3 rounded-lg border border-teal-200 bg-white p-4 text-left text-sm font-bold text-teal-950 sm:grid-cols-2">
            <p>Order: {order.order_number}</p>
            <p>Amount: {formatCurrency(bakongPayment.amount, bakongPayment.currency)}</p>
            <p>Status: Paid</p>
            <p>Paid at: {bakongPayment.paid_at ? new Date(bakongPayment.paid_at).toLocaleString() : 'Confirmed'}</p>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link className="rounded-md bg-teal-800 px-4 py-2 text-sm font-black text-white hover:bg-teal-900" to="/orders">
              View orders
            </Link>
            <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white" to="/products">
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto grid max-w-2xl gap-5 px-5 py-12 text-center">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Bakong payment</p>
        <h1 className="mt-2 text-3xl font-black text-teal-950">Scan to pay</h1>
        <p className="mt-1 text-sm font-semibold text-teal-900/70">Order {order.order_number}</p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="overflow-hidden rounded-[28px] bg-white text-left shadow-xl shadow-teal-950/10 ring-1 ring-slate-200">
          <div className="relative bg-[#ed1c24] px-6 py-4 text-center">
            <p className="text-3xl font-black tracking-wide text-white">KHQR</p>
            <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[28px] border-l-[40px] border-b-white border-l-transparent" />
          </div>

          <div className="px-7 pb-7 pt-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">TosTinh</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{formatCurrency(bakongPayment.amount, bakongPayment.currency)}</p>

            <div className="my-6 border-t border-dashed border-slate-300" />

            <div className="relative mx-auto grid w-fit place-items-center bg-white">
              {qrDataUrl ? (
                <img alt="KHQR Bakong payment code" className="h-64 w-64 max-w-full" src={qrDataUrl} />
              ) : (
                <div className="grid h-64 w-64 max-w-full place-items-center rounded-md bg-slate-50 text-sm font-black text-teal-900">Creating QR...</div>
              )}
              <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ed1c24] text-xs font-black text-white ring-4 ring-white">
                KH
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-64 px-4 py-2">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Expires in</p>
          <p className={(isExpired ? 'text-red-600' : 'text-teal-950') + ' mt-1 text-4xl font-black'}>
            {countdown || '--:--'}
          </p>
        </div>
      </div>

      <p className={(isExpired ? 'text-red-700' : 'text-teal-900/70') + ' mx-auto max-w-lg text-sm font-semibold leading-6'}>
        {isExpired
          ? 'This KHQR expired. Please create a new Bakong payment from your cart.'
          : 'After payment, this page checks Bakong automatically and shows your receipt when confirmed.'}
      </p>
    </section>
  )
}
