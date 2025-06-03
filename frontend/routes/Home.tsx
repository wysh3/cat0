import APIKeyManager from '@/components/APIKeyForm';
import Chat from '@/components/Chat';
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeysStore } from '../stores/APIKeysStore';
import { useModelStore } from '../stores/ModelStore';

export default function Home() {
  const hasRequiredKeys = useAPIKeysStore((state) => state.hasRequiredKeys());
  const isAPIKeysHydrated = useAPIKeysStore.persist?.hasHydrated();
  const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

  // Wait for both stores to hydrate
  if (!isAPIKeysHydrated || !isModelStoreHydrated) return null;

  if (!hasRequiredKeys)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl pt-10 pb-44 mx-auto">
        <APIKeyManager />
      </div>
    );

  return <Chat threadId={uuidv4()} initialMessages={[]} />;
}
