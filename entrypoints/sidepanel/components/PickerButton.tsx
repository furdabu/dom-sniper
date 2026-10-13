import { usePicker } from '../hooks/usePicker';
import { useShortcut } from '../hooks/useShortcut';
import { useSettings } from '../settings';
import { Icon } from './Icon';

export function PickerButton() {
  const { settings, t } = useSettings();
  const { active, unavailable, toggle } = usePicker(settings.keys);
  const shortcut = useShortcut();

  return (
    <div className="picker">
      <button
        type="button"
        className={`button button--primary button--block ${active ? 'is-active' : ''}`}
        aria-pressed={active}
        onClick={toggle}
      >
        <Icon name="crosshair" />
        <span>{active ? t.picker.active(settings.keys.cancel.label) : t.picker.start}</span>
        {!active && shortcut && <kbd className="button__kbd">{shortcut}</kbd>}
      </button>
      {unavailable && (
        <p className="picker__error" role="alert">
          {t.picker.unavailable}
        </p>
      )}
    </div>
  );
}
