import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileSelected, disabled = false }: UploadDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/10 scale-105"
            : "border-gray-300 bg-white hover:border-primary hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isDragActive ? (
            <>
              <FileImage className="w-16 h-16 text-primary animate-bounce" />
              <p className="text-lg font-semibold text-primary">Drop your X-ray here...</p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Drag & drop your dental X-ray here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Supported formats: JPG, PNG • Max size: 10MB
              </div>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg">
          <p className="text-sm text-danger font-medium">
            {fileRejections[0].errors[0].code === 'file-too-large'
              ? 'File is too large. Maximum size is 10MB.'
              : 'Invalid file type. Please upload a JPG or PNG image.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
