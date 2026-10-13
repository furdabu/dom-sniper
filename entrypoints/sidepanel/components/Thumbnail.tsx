import { useObjectUrl } from '../hooks/useObjectUrl';
import { Icon } from './Icon';

export function Thumbnail({ blob }: { blob: Blob | undefined }) {
  const url = useObjectUrl(blob);

  return (
    <span className="thumbnail">
      {url ? <img src={url} alt="" loading="lazy" /> : <Icon name="image" />}
    </span>
  );
}
