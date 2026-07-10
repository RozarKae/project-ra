import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, CollectionReference, DocumentReference } from 'firebase/firestore';

export abstract class BaseRepository {
  protected getPath(workspaceId: string, weddingId: string, subCollection: string): string {
    return `workspaces/${workspaceId}/weddings/${weddingId}/${subCollection}`;
  }

  protected getCollectionRef(workspaceId: string, weddingId: string, subCollection: string): CollectionReference | null {
    if (isFirebaseConfigured && db) {
      return collection(db, this.getPath(workspaceId, weddingId, subCollection));
    }
    return null;
  }

  protected getDocRef(workspaceId: string, weddingId: string, subCollection: string, docId: string): DocumentReference | null {
    if (isFirebaseConfigured && db) {
      return doc(db, this.getPath(workspaceId, weddingId, subCollection), docId);
    }
    return null;
  }
}

export default BaseRepository;
