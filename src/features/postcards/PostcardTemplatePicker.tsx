import { useEffect, useId, useRef, useState } from "react";
import { Check, Expand, X } from "lucide-react";
import { Button, Input } from "../../shared/ui";
import {
  getPostcardTemplate,
  postcardTemplateCatalog,
  postcardTemplateImageUrl,
  postcardTemplateThumbnailUrl,
  type PostcardPrintTemplate,
  type PostcardTemplateCode,
} from "./postcardTemplates";
import "./PostcardTemplatePicker.css";

function Artwork({ template, full = false }: { template: PostcardPrintTemplate; full?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="postcard-artwork-error" role="status">
      Превью не загрузилось
      <span>Обновите страницу, чтобы повторить.</span>
    </div>
  ) : (
    <img
      src={full ? postcardTemplateImageUrl(template) : postcardTemplateThumbnailUrl(template)}
      alt={template.name}
      width={full ? 1200 : 480}
      height={full ? 1800 : 720}
      onError={() => setFailed(true)}
    />
  );
}

function PreviewDialog({
  template,
  onClose,
  onSelect,
}: {
  template: PostcardPrintTemplate;
  onClose: () => void;
  onSelect?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      className="postcard-preview-dialog"
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="postcard-preview-content">
        <div className="postcard-preview-heading">
          <h3 id={titleId}>{template.name}</h3>
          <button
            autoFocus
            type="button"
            className="postcard-preview-close"
            aria-label="Закрыть просмотр"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <Artwork template={template} full />
        <p>
          {template.caption} <span className="postcards-muted">10 × 15 см</span>
        </p>
        {onSelect && (
          <Button type="button" onClick={onSelect}>
            Выбрать эту открытку
          </Button>
        )}
      </div>
    </dialog>
  );
}

export function PostcardTemplatePicker({
  value,
  onChange,
}: {
  value: PostcardTemplateCode | null;
  onChange: (code: PostcardTemplateCode) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [preview, setPreview] = useState<PostcardPrintTemplate | null>(null);
  const groupId = useId();
  const normalize = (text: string) => text.toLocaleLowerCase("ru").replaceAll("ё", "е");
  const query = normalize(search.trim());
  const templates = postcardTemplateCatalog.filter(
    (t) =>
      (category === "Все" || category === t.category) &&
      normalize(`${t.name} ${t.caption} ${t.searchTerms ?? ""}`).includes(query),
  );
  return (
    <section className="postcard-template-picker" aria-labelledby={groupId}>
      <h3 id={groupId}>Выберите открытку *</h3>
      <label className="postcard-template-search">
        Найти открытку
        <Input type="search" value={search} onValueChange={setSearch} placeholder="Название или праздник" />
      </label>
      <div className="postcard-template-filters" aria-label="Категории открыток">
        {["Все", "Любовь", "Подарки", "Праздники", "День рождения"].map((name) => (
          <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)}>
            {name}
          </button>
        ))}
      </div>
      <p className="postcard-template-selection" aria-live="polite">
        {value ? `Выбрано: ${getPostcardTemplate(value).name}` : "Выберите макет для тиража · 10 × 15 см"}
      </p>
      <div className="postcard-template-grid" role="radiogroup" aria-labelledby={groupId}>
        {templates.map((template) => (
          <article
            key={template.code}
            className={`postcard-template-card${value === template.code ? " is-selected" : ""}`}
          >
            <label className="postcard-template-option">
              <input
                type="radio"
                name={`${groupId}-template`}
                value={template.code}
                checked={value === template.code}
                required={!value}
                onChange={() => onChange(template.code)}
                aria-label={template.name}
              />
              <span className="postcard-template-art">
                <Artwork template={template} />
                {value === template.code && (
                  <span className="postcard-template-check" aria-hidden="true">
                    <Check size={18} />
                  </span>
                )}
              </span>
              <span className="postcard-template-name">{template.name}</span>
            </label>
            <button
              className="postcard-template-enlarge"
              type="button"
              onClick={() => setPreview(template)}
              aria-label={`Рассмотреть: ${template.name}`}
            >
              <Expand size={16} aria-hidden="true" />
              Рассмотреть
            </button>
          </article>
        ))}
      </div>
      {!templates.length && (
        <div className="postcard-template-empty">
          <p>По вашему запросу открыток нет.</p>
          <Button
            type="button"
            variant="quiet"
            onClick={() => {
              setSearch("");
              setCategory("Все");
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      )}
      {preview && (
        <PreviewDialog
          template={preview}
          onClose={() => setPreview(null)}
          onSelect={() => {
            onChange(preview.code);
            setPreview(null);
          }}
        />
      )}
    </section>
  );
}

export function PostcardTemplatePreview({ code }: { code: string }) {
  const template = getPostcardTemplate(code);
  const [open, setOpen] = useState(false);
  return (
    <div className="postcard-batch-template">
      <button type="button" onClick={() => setOpen(true)} aria-label={`Рассмотреть: ${template.name}`}>
        <Artwork template={template} />
      </button>
      <div>
        <strong>{template.name}</strong>
        <p>{template.caption}</p>
        <span className="postcards-muted">10 × 15 см</span>
      </div>
      {open && <PreviewDialog template={template} onClose={() => setOpen(false)} />}
    </div>
  );
}
