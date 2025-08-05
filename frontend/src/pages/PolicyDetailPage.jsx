// 📄 pages/PolicyDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios";
import { ArrowLeft } from "lucide-react";

const PolicyDetailPage = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await axios.get(`/policies/${id}`);
        setPolicy(res.data);
      } catch (err) {
        setError("Unable to load policy.");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-300">Loading policy...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/" className="text-blue-300 hover:text-blue-500 flex items-center mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>

      <div className="bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
          {policy.title}
        </h1>
        <div className="prose prose-invert text-gray-300 whitespace-pre-line">
          {policy.content}
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailPage;
