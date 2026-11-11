import React from 'react';

type BadgeVariant = 'sage' | 'forest' | 'terracotta' | 'gray' | 'amber' | 'red' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  sage: 'bg-sage/15 text-forest',
  forest: 'bg-forest text-ivory',
  terracotta: 'bg-terracotta/15 text-terracotta-dark',
  gray: 'bg-charcoal/10 text-charcoal/70',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

export default function Badge({ children, variant = 'sage', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const mapping: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: 'Pending', variant: 'amber' },
    SUBMITTED: { label: 'Submitted', variant: 'gray' },
    UNDER_REVIEW: { label: 'Under Review', variant: 'blue' },
    APPROVED: { label: 'Approved', variant: 'sage' },
    PICKUP_SCHEDULED: { label: 'Pickup Scheduled', variant: 'blue' },
    COLLECTED: { label: 'Collected', variant: 'forest' },
    SORTED: { label: 'Sorted', variant: 'sage' },
    DISTRIBUTED: { label: 'Distributed', variant: 'terracotta' },
    UPCYCLED: { label: 'Upcycled', variant: 'terracotta' },
    REJECTED: { label: 'Rejected', variant: 'red' },
    PROCESSING: { label: 'Processing', variant: 'blue' },
    SHIPPED: { label: 'Shipped', variant: 'sage' },
    DELIVERED: { label: 'Delivered', variant: 'forest' },
    CANCELLED: { label: 'Cancelled', variant: 'red' },
    PAID: { label: 'Paid', variant: 'sage' },
    UNPAID: { label: 'Unpaid', variant: 'amber' },
    ACTIVE: { label: 'Active', variant: 'sage' },
    INACTIVE: { label: 'Inactive', variant: 'gray' },
  };

  const config = mapping[status?.toUpperCase()] || { label: status, variant: 'gray' as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
