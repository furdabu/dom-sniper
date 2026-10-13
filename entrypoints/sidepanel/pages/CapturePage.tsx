import { getRouteApi, Link, useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { broadcast } from '@/lib/broadcast';
import { deleteCapture } from '@/lib/db';
import { formatCapture, formatPosition } from '@/lib/format';
import { CopyButton } from '../components/CopyButton';
import { Icon } from '../components/Icon';
import { formatTime } from '../format';
import { useGoBack } from '../hooks/useGoBack';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { useSettings } from '../settings';

const route = getRouteApi('/captures/$captureId');

export function CapturePage() {
  const capture = route.useLoaderData();
  const router = useRouter();
  const goBack = useGoBack();
  const { t, locale } = useSettings();
  const imageUrl = useObjectUrl(capture.screenshot);
  const { screenshot } = capture;

  const remove = async () => {
    await deleteCapture(capture.id);
    broadcast({ type: 'captures-changed' });
    // 一覧のキャッシュを捨てて、戻った先で読み直させる
    router.clearCache();
    goBack();
  };

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <button type="button" className="button button--text" onClick={goBack}>
          <Icon name="back" />
          <span>{t.history.title}</span>
        </button>
        <button
          type="button"
          className="button button--icon button--danger"
          title={t.common.delete}
          aria-label={t.common.delete}
          onClick={remove}
        >
          <Icon name="trash" />
        </button>
      </header>

      <main className="page__body detail">
        {imageUrl && (
          <div className="detail__image">
            <img src={imageUrl} alt="" />
          </div>
        )}

        <div className="detail__heading">
          <h1 className="detail__label">{capture.label}</h1>
          <time className="detail__time">{formatTime(capture.createdAt, locale)}</time>
        </div>

        <div className="detail__actions">
          <CopyButton
            className="button--primary"
            copy={() => formatCapture(capture)}
            label={t.common.copy}
          />
          {screenshot && (
            <CopyButton
              copy={() =>
                navigator.clipboard.write([new ClipboardItem({ [screenshot.type]: screenshot })])
              }
              label={t.detail.copyImage}
              icon="image"
            />
          )}
        </div>

        <Field label="URL">
          <a className="field__link" href={capture.url} target="_blank" rel="noreferrer">
            {capture.url}
          </a>
        </Field>
        <Field label="DOM Path" copy={capture.domPath}>
          <code className="code">{capture.domPath}</code>
        </Field>
        <Field label="Position">
          <code className="code">{formatPosition(capture.rect)}</code>
        </Field>
        <Field label="HTML" copy={capture.html}>
          <pre className="code code--block">{capture.html}</pre>
        </Field>
      </main>
    </div>
  );
}

export function CaptureNotFound() {
  const { t } = useSettings();

  return (
    <div className="page">
      <div className="empty">
        <p className="empty__title">{t.detail.notFound}</p>
        <Link to="/" className="button">
          {t.detail.backToHistory}
        </Link>
      </div>
    </div>
  );
}

function Field({ label, copy, children }: { label: string; copy?: string; children: ReactNode }) {
  const { t } = useSettings();

  return (
    <section className="field">
      <div className="field__header">
        <h2 className="field__label">{label}</h2>
        {copy && <CopyButton copy={() => copy} label={t.detail.copyField(label)} iconOnly />}
      </div>
      {children}
    </section>
  );
}
