import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { FaFileAlt, FaTrash } from "react-icons/fa";
import { evidenceApi } from "../context/ApiContext.jsx";

export default function EvidenceUpload({ complaintId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (complaintId) fetchEvidence();
  }, [complaintId]);

  async function fetchEvidence() {
    try {
      const res = await evidenceApi.list(complaintId);
      setFiles(res.data.evidence);
    } catch (err) {
      console.error(err);
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          await evidenceApi.upload(complaintId, file);
        }
        toast.success("Evidence uploaded");
        fetchEvidence();
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [complaintId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function handleDelete(fileId) {
    try {
      await evidenceApi.remove(complaintId, fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (err) {
      toast.error("Could not remove file");
    }
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragActive ? "border-stampRed bg-stampRed/5" : "border-paperDim"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-paperText/60">
          {uploading
            ? "Uploading..."
            : "Drag & drop evidence here (screenshots, PDFs), or click to select"}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f._id}
              className="flex items-center justify-between rounded border border-paperDim bg-white px-3 py-2 text-sm"
            >
              <a
                href={f.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-stampRed hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
              >
                <FaFileAlt aria-hidden="true" /> {f.fileName}
              </a>
              <button
                onClick={() => handleDelete(f._id)}
                className="text-stampRed hover:text-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
                aria-label={`Delete ${f.fileName}`}
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
