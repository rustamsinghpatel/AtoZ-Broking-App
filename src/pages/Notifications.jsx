
import { useEffect, useState } from 'react'
import {
  ArrowLeftRight,
  Bell,
  CheckCheck,
  Settings,
  TrendingUp,
  User,
} from 'lucide-react'

import {
  Async,
  Button,
  Card,
  cx,
  EmptyState,
  PageHeader,
} from '../components/common'

import { useToast } from '../components/common/Toast'
import useAsync from '../hooks/useAsync'
import {
  getNotifications,
  markNotificationsRead,
} from '../services/api'
import { fmtDateTime } from '../utils/format'

const icons = {
  'Investment update': TrendingUp,
  Transaction: ArrowLeftRight,
  Account: User,
  System: Settings,
}

function NotificationItem({ n, onRead, saving }) {
  const Icon = icons[n.type] ?? Bell

  return (
    <li
      className={cx(
        'flex gap-3 p-4',
        !n.read && 'bg-green-50/50'
      )}
    >
      <span
        className={cx(
          'h-fit rounded-xl p-2.5',
          n.read
            ? 'bg-slate-100 text-slate-500'
            : 'bg-green-100 text-green-700'
        )}
      >
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cx(
              'text-sm',
              n.read
                ? 'font-medium text-slate-700'
                : 'font-semibold text-slate-900'
            )}
          >
            {n.title}
          </p>

          {!n.read && (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600"
              aria-label="Unread"
            />
          )}
        </div>

        <p className="mt-0.5 text-sm text-slate-600">
          {n.message}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{n.type}</span>
          <span>·</span>
          <span>{fmtDateTime(n.time || n.createdAt)}</span>

          {!n.read && (
            <button
              type="button"
              disabled={saving}
              onClick={() => onRead(n.id)}
              className="ml-auto font-medium text-green-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function NotificationCenter({ initial }) {
  const [items, setItems] = useState(initial)
  const [tab, setTab] = useState('All')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  // API se dobara data aaye to list update karo.
  useEffect(() => {
    setItems(initial)
  }, [initial])

  // Backend API ke through notification read mark karo.
  const markRead = async (ids) => {
    if (!ids.length || saving) return

    setSaving(true)

    try {
      await markNotificationsRead(ids)

      setItems((list) =>
        list.map((n) =>
          ids.includes(n.id) ? { ...n, read: true } : n
        )
      )

      toast(
        ids.length > 1
          ? 'Notifications marked as read.'
          : 'Notification marked as read.'
      )
    } catch (error) {
      toast(error.message || 'Could not update notifications.')
    } finally {
      setSaving(false)
    }
  }

  const unread = items.filter((n) => !n.read)

  const shown =
    tab === 'Unread'
      ? unread
      : tab === 'Read'
        ? items.filter((n) => n.read)
        : items

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Notification filters">
          {['All', 'Unread', 'Read'].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cx(
                'rounded-full border px-4 py-1.5 text-sm font-medium',
                tab === t
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {t}
              {t === 'Unread' && unread.length > 0
                ? ` (${unread.length})`
                : ''}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          disabled={!unread.length || saving}
          onClick={() =>
            markRead(unread.map((n) => n.id))
          }
        >
          <CheckCheck size={16} />
          Mark all as read
        </Button>
      </div>

      <Card className="!p-0">
        {shown.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {shown.map((n) => (
              <NotificationItem
                key={n.id}
                n={n}
                onRead={(id) => markRead([id])}
                saving={saving}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            message="No notifications in this view."
          />
        )}
      </Card>
    </>
  )
}

export default function Notifications() {
  const state = useAsync(getNotifications)

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Updates about your investments and account."
      />

      <Async state={state}>
        {(data) => (
          <NotificationCenter initial={data} />
        )}
      </Async>
    </>
  )
}
