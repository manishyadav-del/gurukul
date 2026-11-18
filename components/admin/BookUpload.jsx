"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function BookUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [tradition, setTradition] = useState("Parashara Jyotish");
  const [publicationYear, setPublicationYear] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [script, setScript] = useState("Devanagari");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files (.pdf) are supported.");
        setFile(null);
        return;
      }
      if (selected.size > MAX_FILE_SIZE) {
        setError(`File size exceeds 100MB limit (${(selected.size / (1024 * 1024)).toFixed(1)}MB).`);
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      setSuccess(null);
      setAnalysisSummary(null);
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val);
    if (val === "English") {
      setScript("Latin");
    } else {
      setScript("Devanagari");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    setAnalysisSummary(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    if (coverFile) formData.append("coverImage", coverFile);
    if (author) formData.append("author", author);
    if (publisher) formData.append("publisher", publisher);
    if (tradition) formData.append("tradition", tradition);
    if (publicationYear) formData.append("publicationYear", publicationYear);
    if (description) formData.append("description", description);
    formData.append("language", language);
    formData.append("script", script);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90); // Up to 90% during upload
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      setUploadProgress(100);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setSuccess(`Book "${data.title}" uploaded and analyzed successfully! (${data.pageCount || 0} pages)`);
          if (data.analysis) {
            setAnalysisSummary(data.analysis);
          }
          if (onUploadComplete) {
            onUploadComplete(data);
          }
          // Reset file and form inputs
          setFile(null);
          setTitle("");
          setAuthor("");
          setPublisher("");
        } else {
          setError(data.error || "Failed to upload and analyze PDF");
        }
      } catch (parseErr) {
        setError("Invalid response from server");
      }
      setUploading(false);
    });

    xhr.addEventListener("error", () => {
      setError("Network error occurred during upload.");
      setUploading(false);
    });

    xhr.open("POST", "/api/books");
    xhr.send(formData);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
        <Upload className="w-5 h-5 text-amber-700" />
        <h2 className="text-lg font-bold text-stone-900 font-serif">Upload Astrology Manuscript / PDF</h2>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Upload Failed</p>
            <p className="text-xs mt-0.5 text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Success</p>
            <p className="text-xs text-emerald-700">{success}</p>
            {analysisSummary && (
              <div className="mt-2 text-xs text-emerald-900 font-mono bg-emerald-100/60 p-2.5 rounded-lg space-y-1">
                <p>Digital Pages (Selectable text): <strong>{analysisSummary.digitalCount}</strong></p>
                <p>Scanned Pages: <strong>{analysisSummary.scannedCount}</strong></p>
                <p>Mixed Pages: <strong>{analysisSummary.mixedCount}</strong></p>
                <p>Overall Classification: <strong>{analysisSummary.overallClassification}</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PDF File Picker */}
        <div className="border-2 border-dashed border-stone-200 hover:border-amber-600 rounded-2xl p-6 text-center transition cursor-pointer bg-stone-50/50">
          <input
            type="file"
            id="pdf-upload-input"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pdf-upload-input" className="cursor-pointer block">
            <FileText className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            {file ? (
              <div>
                <p className="text-sm font-semibold text-stone-900">{file.name}</p>
                <p className="text-xs text-stone-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-stone-700">Click to select PDF or drag and drop</p>
                <p className="text-xs text-stone-400 mt-1">Max file size: 100MB • Formats: .pdf</p>
              </div>
            )}
          </label>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone-600 font-medium">
              <span>{uploadProgress < 100 ? "Uploading PDF..." : "Analyzing PDF pages with pdfjs-dist..."}</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Brihat Parashara Hora Shastra"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Maharishi Parashara"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Language</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 bg-white"
            >
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Sanskrit">Sanskrit (संस्कृतम्)</option>
              <option value="English">English</option>
              <option value="Mixed">Mixed (Hindi + Sanskrit + English)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Publisher (Optional)</label>
            <input
              type="text"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="e.g. Motilal Banarsidass"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tradition / Category</label>
            <select
              value={tradition}
              onChange={(e) => setTradition(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 bg-white"
            >
              <option value="Parashara Jyotish">Parashara Jyotish</option>
              <option value="Jaimini Jyotish">Jaimini Jyotish</option>
              <option value="Vedanga Jyotisha">Vedanga Jyotisha</option>
              <option value="Astrology">Astrology (सामान्य ज्योतिष)</option>
              <option value="Vedas">Vedas (वेद)</option>
              <option value="Upanishad">Upanishad (उपनिषद्)</option>
              <option value="Philosophy">Philosophy (दर्शनशास्त्र)</option>
              <option value="Ayurveda">Ayurveda (आयुर्वेद)</option>
              <option value="Classics">Classics (अन्य शास्त्रीय ग्रंथ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Publication Year (Optional)</label>
            <input
              type="number"
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              placeholder="e.g. 1985"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
            />
          </div>
        </div>

        {/* Cover Image Picker */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Book Cover Image (Optional)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Book Description / Context</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter brief summary, scriptural lineage, or manuscript details..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing & Ingesting PDF...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload & Analyze PDF</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
