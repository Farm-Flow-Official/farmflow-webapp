'use client'

import { useId, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { SpeciesRow } from '@/features/species/types'

/**
 * The last step before a coefficient that is already in use changes.
 *
 * It states the blast radius in things a person can picture — farms and trees —
 * rather than asking whether they are sure. "Are you sure" is answered yes by
 * reflex; "340 trees" is read.
 *
 * The typed name is not ceremony either: it is the only interaction that cannot
 * be completed without looking at which species is on screen. It appears ONLY
 * for changes that move future carbon; gating a spelling fix behind it is how a
 * confirmation stops being read at all.
 */
export function CalculationChangeGate({
  species,
  pending,
  onConfirm,
  onCancel,
}: {
  species: SpeciesRow
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const [typed, setTyped] = useState('')
  const inputId = useId()
  const matches = typed.trim() === species.speciesNameTh

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-warning">
          <TriangleAlert className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">
            กำลังแก้ค่าที่ใช้คำนวณคาร์บอน
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">{species.speciesNameTh}</span> —{' '}
            {formatNumber(species.usage.farms)} ฟาร์ม ·{' '}
            <span className="font-medium text-ink">
              {formatNumber(species.usage.calculatedTrees)} ต้นที่คำนวณคาร์บอนไปแล้ว
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-secondary">
        <p>
          ต้นที่คำนวณไปแล้ว <span className="font-semibold text-ink">จะไม่เปลี่ยน</span> —
          ค่าถูกตรึงไว้ตั้งแต่ตอนคำนวณ แต่ต้นที่ประเมินหลังจากนี้จะใช้ค่าใหม่
        </p>
        <p className="mt-2">
          แปลว่า {species.speciesNameTh} สองต้นที่วัดขนาดเท่ากัน
          จะได้คาร์บอนต่างกัน หากอยู่คนละฝั่งของการแก้ครั้งนี้
        </p>
      </div>

      <div>
        <label htmlFor={inputId} className="block text-[13px] font-medium text-ink">
          พิมพ์ <span className="font-mono text-primary">{species.speciesNameTh}</span> เพื่อยืนยัน
        </label>
        <input
          id={inputId}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="mt-1.5 h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          disabled={!matches || pending}
          onClick={onConfirm}
          className="h-10 rounded-lg bg-warning px-4 text-sm font-semibold text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'กำลังบันทึก…' : 'บันทึกค่าใหม่'}
        </button>
      </div>
    </div>
  )
}
