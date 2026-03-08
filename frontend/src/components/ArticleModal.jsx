import "./ArticleModal.css";

const ArticleModal = ({ isOpen, article, onClose }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="article-modal-overlay" onClick={onClose}>
      <div className="article-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="article-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="article-modal-body">
          {/* Judul */}
          <h1 className="article-title">{article.title}</h1>

          {/* Meta Info */}
          <div className="article-meta">
            <span>{article.date}</span>
            <span className="separator">•</span>
            <span>Sumber: {article.source}</span>
            <span className="separator">•</span>
            <span>{article.readTime}</span>
          </div>

          {/* Gambar */}
          {article.image && (
            <img src={article.image} alt={article.title} className="article-image" />
          )}

          {/* Konten */}
          <div className="article-body">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Topik Terkait */}
          {article.topics && article.topics.length > 0 && (
            <div className="article-topics">
              <h3>Topik terkini</h3>
              <div className="topics-list">
                {article.topics.map((topic, idx) => (
                  <span key={idx} className="topic-tag">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Artikel Terkait */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div className="related-articles">
              <h3>Artikel Terkait</h3>
              <div className="related-list">
                {article.relatedArticles.map((related, idx) => (
                  <div key={idx} className="related-item">
                    <p>{related.title}</p>
                    <span className="related-tag">{related.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
