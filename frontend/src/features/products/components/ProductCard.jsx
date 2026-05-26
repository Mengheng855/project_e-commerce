import { formatCurrency } from '../../../shared/utils/formatCurrency'
export function ProductCard({ product }) { return <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h3 className="font-semibold text-slate-900">{product.name}</h3><p className="mt-1 text-sm text-slate-500">{formatCurrency(product.price)}</p></article> }
