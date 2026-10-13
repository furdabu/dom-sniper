import { getRouteApi, Link, useRouter } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { broadcast } from '@/lib/broadcast';
import { clearCaptures, deleteCapture } from '@/lib/db';
import { formatCapture } from '@/lib/format';
import type { Capture } from '@/lib/types';
import { CopyButton } from '../components/CopyButton';
import { Icon } from '../components/Icon';
import { PickerButton } from '../components/PickerButton';
import { Thumbnail } from '../components/Thumbnail';
import { formatPage, formatTime } from '../format';
import { useSettings } from '../settings';

const CONFIRM_DURATION = 3000;

const route = getRouteApi('/');

export function HistoryPage() {
  const captures = route.useLoaderData();
  const { q = '' } = route.useSearch();
  const navigate = route.useNavigate();
  const router = useRouter();
  const { t } = useSettings();
  // 入力中 (IME の変換中を含む) の値はここで持ち、URL は詳細から戻ってきたとき用の控えにする
  const [query, setQuery] = useState(q);

  const searchable = useMemo(
    () =>
      captures.map((capture) => ({
        capture,
        haystack: [capture.url, capture.title, capture.domPath, capture.text, capture.html]
          .join('\n')
          .toLowerCase(),
      })),
    [captures],
  );

  const visible = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return captures;
    return searchable
      .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
      .map(({ capture }) => capture);
  }, [captures, searchable, query]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    void navigate({ search: value ? { q: value } : {}, replace: true });
  };

  const refresh = () => {
    broadcast({ type: 'captures-changed' });
    return router.invalidate();
  };
  const remove = async (id: string) => {
    await deleteCapture(id);
    await refresh();
  };
  const clear = async () => {
    await clearCaptures();
    await refresh();
  };

  return (
    <div className="page">
      <header className="page__header">
        <div className="toolbar">
          <PickerButton />
          <Link
            to="/settings"
            className="button button--icon toolbar__settings"
            title={t.settings.title}
            aria-label={t.settings.title}
          >
            <Icon name="settings" />
          </Link>
        </div>
        <label className="search">
          <Icon name="search" />
          <input
            type="search"
            className="search__input"
            placeholder={t.history.searchPlaceholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
      </header>

      <main className="page__body">
        {captures.length === 0 ? (
          <div className="empty">
            <Icon name="crosshair" />
            <p className="empty__title">{t.history.emptyTitle}</p>
            <p>{t.history.emptyBody}</p>
          </div>
        ) : (
          <>
            <div className="list-meta">
              <span>
                {visible.length === captures.length
                  ? t.history.count(captures.length)
                  : t.history.filteredCount(visible.length, captures.length)}
              </span>
              <ClearButton onClear={clear} />
            </div>
            {visible.length === 0 ? (
              <div className="empty">
                <p className="empty__title">{t.history.noMatch}</p>
              </div>
            ) : (
              <ul className="capture-list">
                {visible.map((capture) => (
                  <CaptureItem key={capture.id} capture={capture} onDelete={remove} />
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CaptureItem({ capture, onDelete }: { capture: Capture; onDelete: (id: string) => void }) {
  const { t, locale } = useSettings();

  return (
    <li className="capture-item">
      <Link
        to="/captures/$captureId"
        params={{ captureId: capture.id }}
        className="capture-item__main"
      >
        <Thumbnail blob={capture.screenshot} />
        <span className="capture-item__body">
          <span className="capture-item__label">{capture.label}</span>
          {capture.text && <span className="capture-item__text">{capture.text}</span>}
          <span className="capture-item__meta">
            {formatPage(capture.url)} · {formatTime(capture.createdAt, locale)}
          </span>
        </span>
      </Link>
      <span className="capture-item__actions">
        <CopyButton copy={() => formatCapture(capture)} label={t.common.copy} iconOnly />
        <button
          type="button"
          className="button button--icon button--danger"
          title={t.common.delete}
          aria-label={t.common.delete}
          onClick={() => onDelete(capture.id)}
        >
          <Icon name="trash" />
        </button>
      </span>
    </li>
  );
}

/** 1 回目のクリックで確認状態になり、時間内にもう一度押すと実行する */
function ClearButton({ onClear }: { onClear: () => void }) {
  const { t } = useSettings();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_DURATION);
    return () => clearTimeout(timer);
  }, [confirming]);

  return (
    <button
      type="button"
      className={`button button--text ${confirming ? 'button--danger' : ''}`}
      onClick={() => (confirming ? onClear() : setConfirming(true))}
    >
      {confirming ? t.history.clearConfirm : t.history.clear}
    </button>
  );
}
