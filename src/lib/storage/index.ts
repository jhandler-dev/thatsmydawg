// Supabase Storage helper — upload to a per-session path, return a signed URL.
// Server-only: imports client.ts, which holds SUPABASE_SERVICE_ROLE_KEY.
// Used by /api/upload (dog photos) and /api/generate (proofs).
import { randomUUID } from "crypto";
import { SIGNED_URL_EXPIRES_IN_SECONDS } from "@/constants";
import { storageBucket, supabaseAdmin } from "./client";

export type StorageErrorCode = "STORAGE_UPLOAD_FAILED" | "STORAGE_SIGNED_URL_FAILED";

export class StorageOperationError extends Error {
  constructor(
    message: string,
    public readonly code: StorageErrorCode
  ) {
    super(message);
    this.name = "StorageOperationError";
  }
}

export interface UploadToStorageParams {
  /** Anonymous session id — the upload is namespaced under this path segment. */
  sessionId: string;
  /** Original file name; sanitized and combined with a random id to avoid collisions. */
  fileName: string;
  /** File contents. Accepts what browser uploads and server buffers commonly produce. */
  fileBody: Blob | Buffer | ArrayBuffer | File;
  /** MIME type; required when fileBody isn't a Blob/File (those carry their own type). */
  contentType?: string;
}

export interface UploadToStorageResult {
  /** Storage object path — persist this, not the signed URL, which expires. */
  path: string;
  /** Signed URL valid for SIGNED_URL_EXPIRES_IN_SECONDS from now. */
  signedUrl: string;
}

/**
 * Uploads a file under `<sessionId>/<random>-<fileName>` and returns both the
 * storage path (for persistence) and a freshly signed URL (for immediate use).
 * Callers needing a URL later should call getSignedUrl(path) again rather than
 * reusing this one, since it expires.
 */
export async function uploadToStorage(
  params: UploadToStorageParams
): Promise<UploadToStorageResult> {
  const path = buildSessionPath(params.sessionId, params.fileName);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(storageBucket)
    .upload(path, params.fileBody, {
      contentType: params.contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new StorageOperationError(uploadError.message, "STORAGE_UPLOAD_FAILED");
  }

  const signedUrl = await getSignedUrl(path);
  return { path, signedUrl };
}

/** Returns a signed URL for an existing storage path, valid for `expiresIn` seconds. */
export async function getSignedUrl(
  path: string,
  expiresIn: number = SIGNED_URL_EXPIRES_IN_SECONDS
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(storageBucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new StorageOperationError(
      error?.message ?? "Failed to create signed URL",
      "STORAGE_SIGNED_URL_FAILED"
    );
  }

  return data.signedUrl;
}

function buildSessionPath(sessionId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `${sessionId}/${randomUUID()}-${safeName}`;
}
