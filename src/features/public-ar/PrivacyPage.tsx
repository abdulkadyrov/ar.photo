import { ArrowLeft, Camera, Images, Layers3, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { PublicDocument } from "../../shared/ui/PublicDocument";

export function PrivacyRoute() {
  const location = useLocation();
  const state = location.state as { viewerPath?: string } | null;
  const viewer = state?.viewerPath && /^\/ar\/[a-zA-Z0-9-]+$/.test(state.viewerPath) ? state.viewerPath : "/camera";
  return (
    <PublicDocument>
      <section className="public-privacy-body">
        <h1>Камера и конфиденциальность</h1>
        <p className="public-privacy-description">
          Как KHANZAMA использует камеру при просмотре живых фото и какие данные при этом обрабатываются.
        </p>
        <article className="public-privacy-card">
          <span>
            <Camera size={31} />
          </span>
          <div>
            <h2>Что использует камера</h2>
            <p>
              Камера распознаёт напечатанную фотографию и запускает AR. Кадры обрабатываются на устройстве и не
              отправляются на сервер.
            </p>
          </div>
        </article>
        <article className="public-privacy-card">
          <span>
            <Layers3 size={31} />
          </span>
          <div>
            <h2>Для чего нужны разрешения</h2>
            <p>
              Разрешение позволяет распознать фото и показать связанное видео. Кадры не сохраняются без нажатия кнопки
              записи AR-видео.
            </p>
          </div>
        </article>
        <article className="public-privacy-card">
          <span>
            <Mail size={31} />
          </span>
          <div>
            <h2>Как связаться</h2>
            <p>
              Если у вас есть вопросы о конфиденциальности или работе камеры, обратитесь к владельцу фотографии или в{" "}
              <Link to="/support">поддержку KHANZAMA</Link>.
            </p>
          </div>
        </article>
        <p className="public-privacy-note">
          <Images size={24} />
          <span>
            <strong>Важно знать:</strong> для распознавания используется само изображение на напечатанном фото.
            Специальные метки не нужны, а QR-код лишь открывает просмотр.
          </span>
        </p>
        <footer className="public-privacy-footer">
          <Link to={viewer}>
            <ArrowLeft size={18} />
            Назад к просмотру
          </Link>
          <Link to="/support">Вопрос о конфиденциальности</Link>
        </footer>
      </section>
    </PublicDocument>
  );
}
