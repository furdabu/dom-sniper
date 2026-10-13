import { useEffect, useState } from 'react';
import { useSettings } from '../settings';
import { Icon, type IconName } from './Icon';

const FEEDBACK_DURATION = 1500;

interface Props {
  /** 文字列を返せばテキストとしてコピーする。画像などは自分で書き込んで何も返さない */
  copy: () => string | Promise<void>;
  label: string;
  icon?: IconName;
  /** アイコンだけを表示し、label はツールチップに回す */
  iconOnly?: boolean;
  className?: string;
}

export function CopyButton({ copy, label, icon = 'copy', iconOnly, className = '' }: Props) {
  const { t } = useSettings();
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState('idle'), FEEDBACK_DURATION);
    return () => clearTimeout(timer);
  }, [state]);

  const onClick = async () => {
    try {
      const result = copy();
      await (typeof result === 'string' ? navigator.clipboard.writeText(result) : result);
      setState('done');
    } catch {
      setState('failed');
    }
  };

  const text =
    state === 'done' ? t.common.copied : state === 'failed' ? t.common.copyFailed : label;

  return (
    <button
      type="button"
      className={`button ${iconOnly ? 'button--icon' : ''} ${className}`}
      title={iconOnly ? text : undefined}
      aria-label={iconOnly ? text : undefined}
      onClick={onClick}
    >
      <Icon name={state === 'done' ? 'check' : icon} />
      {!iconOnly && <span>{text}</span>}
    </button>
  );
}
