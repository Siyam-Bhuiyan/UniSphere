import axios from 'axios';
import { useState } from 'react';

const NewsPortal = () => {
  const [topics, setTopics] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/news', {
        topics,
      });
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-yellow-100">
        <h1 className="text-4xl font-extrabold text-yellow-700 mb-6 text-center tracking-tight">
          📰 UniSphere News Portal
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter topics (comma separated, e.g. AI, Technology, Science)"
            className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:ring-2 focus:ring-yellow-400 text-lg transition-all"
            onChange={e =>
              setTopics(
                e.target.value
                  .split(',')
                  .map(t => t.trim())
                  .filter(Boolean),
              )
            }
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-400 text-white font-bold rounded-lg shadow hover:from-yellow-600 hover:to-orange-500 transition-all text-lg"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Latest News'}
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-yellow-500 mr-3"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="text-yellow-700 text-lg font-semibold">
                Fetching news...
              </span>
            </div>
          ) : articles.length > 0 ? (
            <div className="space-y-8">
              {articles.map((article, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-yellow-100 bg-yellow-50 hover:bg-yellow-100 transition-all shadow group"
                >
                  <h2 className="text-2xl font-bold text-yellow-800 mb-2 group-hover:underline">
                    {article.title}
                  </h2>
                  <p className="text-gray-700 mb-4">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold shadow hover:bg-yellow-700 transition"
                    >
                      Read Full Article →
                    </a>
                    {article.source && (
                      <span className="text-xs text-gray-500 italic">
                        Source: {article.source.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10 text-lg font-medium">
              No articles found. Try searching for a different topic!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPortal;
