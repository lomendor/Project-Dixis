'use client'

import { useState, useMemo, useCallback } from 'react'

/**
 * Pass PRICE-TRANSPARENCY-01: Bidirectional price breakdown component.
 *
 * The producer can either:
 * 1. Set the selling price → see what they receive (forward)
 * 2. Set what they want to receive → see the required selling price (reverse)
 *
 * Rates are defaults — actual rates may vary per producer/category
 * when commission engine is active with custom rules.
 */

// Default rates (matching backend config/dixis.php)
const DIXIS_COMMISSION_RATE = 0.12    // 12%
const DIXIS_FEE_VAT_RATE = 0.24      // 24% Greek VAT on platform fee
const STRIPE_PERCENT_FEE = 0.015     // 1.5% for EU cards
const STRIPE_FIXED_FEE = 0.25        // €0.25 per transaction

// Combined rate: 1 - stripe% - commission% - (commission% × VAT%)
const TOTAL_DEDUCTION_RATE = STRIPE_PERCENT_FEE + DIXIS_COMMISSION_RATE + (DIXIS_COMMISSION_RATE * DIXIS_FEE_VAT_RATE)
const NET_RATE = 1 - TOTAL_DEDUCTION_RATE // ~0.8362

interface PriceBreakdownProps {
  price: string          // selling price as string from input
  discountPrice?: string // optional discount price
  onPriceChange?: (newPrice: string) => void // callback to update selling price (for reverse calc)
}

function calculateBreakdown(sellingPrice: number) {
  if (sellingPrice <= 0) return null

  const stripeFee = sellingPrice * STRIPE_PERCENT_FEE + STRIPE_FIXED_FEE
  const dixisCommission = sellingPrice * DIXIS_COMMISSION_RATE
  const dixisCommissionVat = dixisCommission * DIXIS_FEE_VAT_RATE
  const totalFees = stripeFee + dixisCommission + dixisCommissionVat
  const netAmount = sellingPrice - totalFees

  return {
    sellingPrice,
    stripeFee: Math.round(stripeFee * 100) / 100,
    dixisCommission: Math.round(dixisCommission * 100) / 100,
    dixisCommissionVat: Math.round(dixisCommissionVat * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  }
}

/** Reverse: given desired net amount, calculate required selling price */
function reverseCalculate(desiredNet: number): number {
  if (desiredNet <= 0) return 0
  // sellingPrice = (desiredNet + STRIPE_FIXED_FEE) / NET_RATE
  return Math.round(((desiredNet + STRIPE_FIXED_FEE) / NET_RATE) * 100) / 100
}

function formatEur(amount: number): string {
  return amount.toLocaleString('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

export default function PriceBreakdown({ price, discountPrice, onPriceChange }: PriceBreakdownProps) {
  const [netInput, setNetInput] = useState('')
  const [isReverseMode, setIsReverseMode] = useState(false)

  const activePrice = discountPrice && parseFloat(discountPrice) > 0
    ? parseFloat(discountPrice)
    : parseFloat(price)

  const breakdown = useMemo(() => {
    if (isNaN(activePrice) || activePrice <= 0) return null
    return calculateBreakdown(activePrice)
  }, [activePrice])

  // When net input changes, reverse-calculate and update selling price
  const handleNetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNetInput(value)
    setIsReverseMode(true)

    const desiredNet = parseFloat(value)
    if (!isNaN(desiredNet) && desiredNet > 0 && onPriceChange) {
      const requiredPrice = reverseCalculate(desiredNet)
      onPriceChange(requiredPrice.toFixed(2))
    }
  }, [onPriceChange])

  // When user focuses on the net input, enter reverse mode
  const handleNetFocus = useCallback(() => {
    setIsReverseMode(true)
    if (breakdown) {
      setNetInput(breakdown.netAmount.toFixed(2))
    }
  }, [breakdown])

  // When user blurs net input, exit reverse mode
  const handleNetBlur = useCallback(() => {
    setIsReverseMode(false)
    setNetInput('')
  }, [])

  if (!breakdown) return null

  const isPositive = breakdown.netAmount > 0
  const hasDiscount = discountPrice && parseFloat(discountPrice) > 0

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4" data-testid="price-breakdown">
      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
        Ανάλυση τιμής
        {onPriceChange && (
          <span className="text-xs font-normal text-blue-600 ml-auto">
            ↕ Αμφίδρομη
          </span>
        )}
      </h4>

      <div className="space-y-1.5 text-sm">
        {/* Selling price */}
        <div className="flex justify-between">
          <span className="text-gray-600">
            Τιμή πώλησης
            {hasDiscount && <span className="text-xs text-orange-500 ml-1">(έκπτωση)</span>}
          </span>
          <span className="font-medium text-gray-900">{formatEur(breakdown.sellingPrice)}</span>
        </div>

        {/* Separator */}
        <div className="border-t border-blue-200 my-1" />

        {/* Dixis commission */}
        <div className="flex justify-between">
          <span className="text-gray-500">Προμήθεια Dixis ({(DIXIS_COMMISSION_RATE * 100).toFixed(0)}%)</span>
          <span className="text-red-600">-{formatEur(breakdown.dixisCommission)}</span>
        </div>

        {/* VAT on commission */}
        <div className="flex justify-between">
          <span className="text-gray-500">ΦΠΑ προμήθειας ({(DIXIS_FEE_VAT_RATE * 100).toFixed(0)}%)</span>
          <span className="text-red-600">-{formatEur(breakdown.dixisCommissionVat)}</span>
        </div>

        {/* Stripe fee */}
        <div className="flex justify-between">
          <span className="text-gray-500">Stripe ({(STRIPE_PERCENT_FEE * 100).toFixed(1)}% + {formatEur(STRIPE_FIXED_FEE)})</span>
          <span className="text-red-600">-{formatEur(breakdown.stripeFee)}</span>
        </div>

        {/* Separator */}
        <div className="border-t border-blue-200 my-1" />

        {/* Net amount - editable when onPriceChange is provided */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Εσείς λαμβάνετε</span>
          {onPriceChange ? (
            <input
              type="number"
              step="0.01"
              min="0"
              value={isReverseMode ? netInput : breakdown.netAmount.toFixed(2)}
              onFocus={handleNetFocus}
              onBlur={handleNetBlur}
              onChange={handleNetChange}
              className={`w-28 text-right font-bold text-lg px-2 py-0.5 rounded border transition-colors
                ${isPositive ? 'text-green-700 border-green-300 bg-green-50 focus:border-green-500' : 'text-red-700 border-red-300 bg-red-50 focus:border-red-500'}
                focus:outline-none focus:ring-1 focus:ring-green-400`}
              data-testid="price-breakdown-net-input"
              title="Πληκτρολογήστε πόσα θέλετε να λάβετε"
            />
          ) : (
            <span className={`font-bold text-lg ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
              {formatEur(breakdown.netAmount)}
            </span>
          )}
        </div>

        {/* Hint for reverse mode */}
        {onPriceChange && (
          <p className="text-xs text-blue-500 text-right mt-0.5">
            Πληκτρολογήστε πόσα θέλετε → η τιμή πώλησης προσαρμόζεται
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
        * Εκτίμηση για πληρωμή με Ευρωπαϊκή κάρτα. Τα ποσά μπορεί να διαφέρουν ελαφρώς.
      </p>
    </div>
  )
}
