import { useEffect } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { parseSharedImage, type PhotoInput } from './photo-policy';

/** Read raw local files only; do not use the resolver that can fetch remote URLs. */
export function useIncomingPhoto(
  receive: (input: PhotoInput) => Promise<void>,
  onError: (error: unknown) => void,
): void {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let mounted = true;
    let running = false;
    let refreshAgain = false;

    async function refresh(): Promise<void> {
      if (running) { refreshAgain = true; return; }
      running = true;
      try {
        do {
          refreshAgain = false;
          const payloads = Sharing.getSharedPayloads();
          if (payloads.length === 0) break;
          const fingerprint = JSON.stringify(payloads);
          try {
            await receive(parseSharedImage(payloads));
          } catch (error) {
            if (mounted) onError(error);
          } finally {
            // Do not clear a newer share that arrived while this file copied.
            if (JSON.stringify(Sharing.getSharedPayloads()) === fingerprint) {
              Sharing.clearSharedPayloads();
            } else {
              refreshAgain = true;
            }
          }
        } while (mounted && refreshAgain);
      } catch (error) {
        if (mounted) onError(error);
      } finally {
        running = false;
      }
    }

    void refresh();
    const state = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
    });
    const links = Linking.addEventListener('url', () => { void refresh(); });
    return () => { mounted = false; state.remove(); links.remove(); };
  }, [receive, onError]);
}
