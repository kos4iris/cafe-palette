import { useEffect, useRef } from 'react';
import type { FlavorProfile } from '../services/drinkApi';
import { FlavorMap } from './FlavorMap';

interface Props {
  profile: FlavorProfile;
  onBack: () => void;
  onClose: () => void;
}

export function FlavorDetailsModal({ profile, onBack, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const recipeDialog = [...document.querySelectorAll('dialog.saved-modal')].find(
      (node) => node !== dialog,
    );
    if (recipeDialog instanceof HTMLElement) {
      const box = recipeDialog.getBoundingClientRect();
      dialog.style.width = `${box.width}px`;
      dialog.style.height = `${box.height}px`;
    }
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(event: Event) {
      event.preventDefault();
      onBack();
    }
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [onBack]);

  return (
    <dialog
      ref={dialogRef}
      className="saved-modal details-modal"
      aria-labelledby="flavor-details-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) onBack();
      }}
    >
      <div className="saved-modal-body">
        <div className="details-strip" aria-hidden="true" />
        <button type="button" className="saved-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="flavor-details-title">Details</h2>
        <FlavorMap profile={profile} />
        <div className="save-recipe-row">
          <button type="button" className="details-toggle" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </dialog>
  );
}
