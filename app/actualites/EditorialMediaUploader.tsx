"use client";

/* eslint-disable @next/next/no-img-element -- Uploaded media URLs are selected at runtime by the editorial team. */
import { useRef, useState, type ChangeEvent } from "react";

import { isVideoMedia } from "./media";

type UploadResponse = {
  url?: string;
  error?: string;
};

type MediaUploaderProps = {
  coverImage: string;
  gallery: string[];
  disabled?: boolean;
  onCoverChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

function validateFile(file: File, cover: boolean) {
  const image = file.type.startsWith("image/");
  const video = file.type.startsWith("video/");
  if (cover && !image) return "La couverture doit être une image.";
  if (!image && !video) return "Choisissez une image ou une vidéo.";
  if (image && file.size > MAX_IMAGE_BYTES) return "Cette image dépasse 10 Mo.";
  if (video && file.size > MAX_VIDEO_BYTES) return "Cette vidéo dépasse 20 Mo.";
  return "";
}

function uploadToStorage(file: File, progress: (value: number) => void) {
  return new Promise<UploadResponse>((resolve, reject) => {
    const data = new FormData();
    data.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/actualites/admin/media/upload");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) progress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("L’envoi a été interrompu. Vérifiez votre connexion."));
    request.onload = () => {
      let result: UploadResponse = {};
      try { result = JSON.parse(request.responseText) as UploadResponse; } catch { /* The server returned an unreadable response. */ }
      if (request.status < 200 || request.status >= 300 || !result.url) {
        reject(new Error(result.error ?? "Le serveur a refusé ce média."));
        return;
      }
      resolve(result);
    };
    request.send(data);
  });
}

export function EditorialMediaUploader({ coverImage, gallery, disabled = false, onCoverChange, onGalleryChange }: MediaUploaderProps) {
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function upload(files: File[], asCover: boolean) {
    if (!files.length || disabled) return;
    const validationError = files.map((file) => validateFile(file, asCover)).find(Boolean);
    if (validationError) { setMessage(validationError); return; }
    if (!asCover && gallery.length + files.length > 12) { setMessage("La galerie peut contenir au maximum 12 médias."); return; }

    setMessage("");
    setProgress(0);
    try {
      const uploaded: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const result = await uploadToStorage(files[index], (fileProgress) => {
          setProgress(Math.round(((index + fileProgress / 100) / files.length) * 100));
        });
        uploaded.push(result.url!);
      }
      if (asCover) onCoverChange(uploaded[0]);
      else onGalleryChange([...gallery, ...uploaded]);
      setMessage(asCover ? "Image de couverture ajoutée." : `${uploaded.length} média${uploaded.length > 1 ? "s" : ""} ajouté${uploaded.length > 1 ? "s" : ""}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "L’envoi a échoué.");
    } finally {
      setProgress(null);
      if (coverInput.current) coverInput.current.value = "";
      if (galleryInput.current) galleryInput.current.value = "";
    }
  }

  function pick(event: ChangeEvent<HTMLInputElement>, asCover: boolean) {
    void upload(Array.from(event.target.files ?? []), asCover);
  }

  return (
    <div className="editorial-media-manager">
      <div className="editorial-media-manager__actions">
        <label className={disabled ? "is-disabled" : ""}>
          <strong>Ajouter la couverture</strong>
          <span>Image JPG, PNG, WebP ou AVIF · 10 Mo max.</span>
          <input ref={coverInput} type="file" accept="image/*" disabled={disabled || progress !== null} onChange={(event) => pick(event, true)} />
        </label>
        <label className={disabled ? "is-disabled" : ""}>
          <strong>Ajouter à la galerie</strong>
          <span>Images (10 Mo) ou vidéos MP4/WebM (20 Mo) · jusqu’à 12 médias.</span>
          <input ref={galleryInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" multiple disabled={disabled || progress !== null} onChange={(event) => pick(event, false)} />
        </label>
      </div>
      {progress !== null ? <div className="editorial-media-manager__progress" aria-live="polite"><span style={{ width: `${progress}%` }} /><strong>Envoi… {progress}%</strong></div> : null}
      {message ? <p className="editorial-media-manager__message" role="status">{message}</p> : null}
      {coverImage ? <div className="editorial-media-manager__cover"><img src={coverImage} alt="Aperçu de la couverture" /><button type="button" onClick={() => onCoverChange("")}>Retirer</button></div> : null}
      {gallery.length ? <div className="editorial-media-manager__gallery">{gallery.map((url, index) => <figure key={`${url}-${index}`}>{isVideoMedia(url) ? <video src={url} muted preload="metadata" /> : <img src={url} alt="" />}<button type="button" aria-label={`Retirer le média ${index + 1}`} onClick={() => onGalleryChange(gallery.filter((_, itemIndex) => itemIndex !== index))}>×</button></figure>)}</div> : null}
    </div>
  );
}
