import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { FaFileAlt, FaFilePdf, FaFileImage, FaTrash, FaSyncAlt, FaCloudUploadAlt } from "react-icons/fa";
import { evidenceApi } from "../context/ApiContext.jsx";

const ACCEPTED_TYPES = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "application/pdf": [],
  "application/msword": [],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
};

function FileIcon({ fileType }) {
  if (fileType === "pdf") return <FaFilePdf className="text-red-500" />;
  if (fileType === "image") return <FaFileImage className="text-blue-500" />;
  return <FaFileAlt className="text-paperText/50" />;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EvidenceUpload({ complaintId, disabled = false }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);

  const fetchEvidence = useCallback(async () => {
    if (!complaintId) return;
    setLoadingList(true);
    try {
      const res = await evidenceApi.list(complaintId);
      setFiles(res.data.evidence || []);
    } catch (err) {
      console.error("Could not fetch evidence:", err.message);
    } finally {
      setLoadingList(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (disabled) return;

      if (rejectedFiles.length > 0) {
        toast.error("Some files were rejected. Only images, PDFs, and Word docs are allowed.");
      }

      if (acceptedFiles.length === 0) return;

      setUploading(true);
      let success = 0;
      for (const file of acceptedFiles) {
        try {
          await evidenceApi.upload(complaintId, file);
          success++;
        } catch (err) {
          toast.error(`Failed to upload ${file.name}: ${err.response?.data?.message || "unknown error"}`);
        }
      }
      if (success > 0) {
        toast.success(`${success} file${success > 1 ? "s" : ""} uploaded`);
      }
      await fetchEvidence();
      setUploading(false);
    },
    [complaintId, disabled, fetchEvidence]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled: disabled || uploading,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  async function handleDelete(fileId, fileName) {
    if (!window.confirm(`Remove "${fileName}"?`)) return;
    setDeletingId(fileId);
    try {
      await evidenceApi.remove(complaintId, fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      toast.success("Evidence removed");
    } catch (err) {
      toast.error("Could not remove file");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {!disabled && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-stampRed bg-stampRed/5"
              : uploading
              ? "border-paperDim bg-paper"
              : "border-paperDim hover:border-stampRed/40 hover:bg-stampRed/[0.02]"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-paperText/60">
              <FaSyncAlt className="animate-spin text-2xl text-stampRed" />
              <p className="text-sm">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FaCloudUploadAlt
                className={`text-3xl ${isDragActive ? "text-stampRed" : "text-paperText/30"}`}
              />
              <p className="text-sm font-medium text-paperText/70">
                {isDragActive ? "Drop files here" : "Drag & drop or click to upload evidence"}
              </p>
              <p className="text-xs text-paperText/40">
                Images, PDFs, Word docs · Max 10 MB per file
              </p>
            </div>
          )}
        </div>
      )}

      {loadingList ? (
        <div className="mt-4 space-y-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-10 animate-pulse rounded-lg border border-paperDim bg-paper" />
          ))}
        </div>
      ) : files.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f._id}
              className="flex items-center justify-between gap-3 rounded-lg border border-paperDim bg-paper px-3 py-2.5"
            >
              <a
                href={f.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center gap-2.5 text-sm text-ink hover:text-stampRed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed rounded"
              >
                <FileIcon fileType={f.fileType} />
                <span className="truncate font-medium">{f.fileName}</span>
                {f.fileSize && (
                  <span className="shrink-0 text-xs text-paperText/40">
                    {formatBytes(f.fileSize)}
                  </span>
                )}
              </a>

              {!disabled && (
                <button
                  onClick={() => handleDelete(f._id, f.fileName)}
                  disabled={deletingId === f._id}
                  className="shrink-0 rounded p-1.5 text-paperText/30 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
                  aria-label={`Delete ${f.fileName}`}
                >
                  {deletingId === f._id ? (
                    <FaSyncAlt className="animate-spin text-xs" />
                  ) : (
                    <FaTrash className="text-xs" />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !disabled && (
          <p className="mt-3 text-center text-xs text-paperText/40">
            No evidence uploaded yet
          </p>
        )
      )}

      {disabled && files.length === 0 && (
        <p className="text-center text-xs text-paperText/40">No evidence attached</p>
      )}
    </div>
  );
}
