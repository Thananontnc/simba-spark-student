'use client';

import { useState, useEffect } from 'react';
import type { StudentDashboardData, Notification } from '@/lib/types';

type Props = { data: StudentDashboardData };

/**
 * Right-side widget panel — scoped strictly to Simba Spark.
 *
 * Three stacked widgets (our actual features, nothing copied from the legacy
 * system):
 *   1. Credits Tracking  — progress toward a full term, per-course breakdown
 *   2. Block Course Details — the active block + enrolled sections at a glance
 *   3. Notifications — room changes / scheduling conflicts, pulsing until dismissed
 *
 * The panel scrolls independently and sticks to the top on wide screens.
 */
export default function RightPanel({ data }: Props) {
  const { enrolledCourses, currentBlock } = data;

  // ---- Credits tracking (derived from enrolled course credits) ----------
  const totalCredits = enrolledCourses.reduce((n, ec) => n + ec.course.credits, 0);
  const target = 18; // a full Simba term
  const pct = Math.max(0, Math.min(100, Math.round((totalCredits / target) * 100)));

  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start scroll-mt-20">
      {/* ============================================================ */}
      {/* 1. Credits Tracking                                          */}
      {/* ============================================================ */}
      <section className="card-premium p-5 rounded-md animate-fade-in">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold" style={{ color: 'var(--tx)' }}>Credits Tracking</h2>
          <span className="text-sm font-semibold text-[var(--accent)]">
            {totalCredits}/{target}
          </span>
        </div>

        {/* Animated progress bar (fills on mount via .credit-fill) */}
        <div className="h-2.5 rounded-full overflow-hidden border border-zinc-200/80 dark:border-zinc-800/50 bg-zinc-100/50 dark:bg-zinc-900/30">
          <div
            className="credit-fill h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--tx-3)' }}>
          {target - totalCredits > 0
            ? `${target - totalCredits} credits to a full term`
            : 'Full term load reached'}
        </p>

        {/* Per-course credit breakdown */}
        <div className="mt-4 space-y-2">
          {enrolledCourses.map((ec) => (
            <div key={ec.section.id} className="flex items-center justify-between text-sm">
              <span className="truncate" style={{ color: 'var(--tx-2)' }}>
                <span className="font-semibold" style={{ color: 'var(--accent-2)' }}>{ec.course.courseCode}</span>
                {' '}{ec.course.courseName}
              </span>
              <span className="font-medium shrink-0 ml-2" style={{ color: 'var(--tx)' }}>{ec.course.credits} cr</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. Block Course Details                                      */}
      {/* ============================================================ */}
      <section className="card-premium p-5 rounded-md animate-fade-in">
        <h2 className="text-base font-bold mb-3.5" style={{ color: 'var(--tx)' }}>Block Course Details</h2>

        {currentBlock ? (
          <div className="rounded-md p-3 mb-4 bg-[#FF6B00]/5 border border-[#FF6B00]/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#FF6B00] dark:text-[#ff9a3f]">
                Active Block
              </span>
            </div>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--tx)' }}>{currentBlock.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--tx-2)' }}>
              {currentBlock.startDate} → {currentBlock.endDate}
            </p>
          </div>
        ) : (
          <p className="text-sm mb-3.5" style={{ color: 'var(--tx-2)' }}>No active block.</p>
        )}

        {/* Enrolled sections list */}
        <div className="space-y-3.5">
          {enrolledCourses.map((ec) => (
            <div key={ec.section.id} className="flex items-start gap-2.5">
              <span
                className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0"
                style={{ background: 'rgba(255, 107, 0, 0.14)', color: 'var(--accent)' }}
              >
                {ec.course.courseCode}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--tx)' }}>
                  {ec.course.courseName}
                </p>
                <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
                  {ec.section.sectionNumber} · {ec.section.instructorName ?? 'TBA'} · {ec.section.room ?? 'TBA'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
