// import { useEffect, useState } from "react";
// import axios from "../lib/axios";
// import toast from "react-hot-toast";
// import { Pencil, Trash, PlusCircle, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const defaultFormData = { title: "", type: "other", content: "" };

// const PoliciesList = () => {
//   const [policies, setPolicies] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState(defaultFormData);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [selectedPolicy, setSelectedPolicy] = useState(null);

//   const fetchPolicies = async () => {
//     try {
//       const res = await axios.get("/policies/public");
//       setPolicies(res.data);
//     } catch {
//       toast.error("Failed to load policies");
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editingId) {
//         await axios.patch(`/policies/${editingId}`, formData);
//         toast.success("Policy updated");
//       } else {
//         await axios.post("/policies", formData);
//         toast.success("Policy created");
//       }
//       setFormData(defaultFormData);
//       setEditingId(null);
//       setShowCreateForm(false);
//       fetchPolicies();
//     } catch {
//       toast.error("Failed to save policy");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this policy?")) {
//       await axios.delete(`/policies/${id}`);
//       toast.success("Policy deleted");
//       fetchPolicies();
//     }
//   };

//   const openEditModal = (policy) => {
//     setSelectedPolicy(policy);
//     setFormData({
//       title: policy.title,
//       type: policy.type,
//       content: policy.content,
//     });
//     setEditingId(policy._id);
//   };

//   const closeModal = () => {
//     setSelectedPolicy(null);
//     setEditingId(null);
//     setFormData(defaultFormData);
//   };

//   useEffect(() => {
//     fetchPolicies();
//   }, []);

//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-6xl mx-auto mt-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-white">
//           Policy & Info Management
//         </h2>
//         <button
//           onClick={() => {
//             setShowCreateForm(!showCreateForm);
//             setFormData(defaultFormData);
//             setEditingId(null);
//           }}
//           className="flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
//         >
//           {showCreateForm ? (
//             <>
//               <X className="w-4 h-4" />
//               Cancel
//             </>
//           ) : (
//             <>
//               <PlusCircle className="w-4 h-4" />
//               Create New
//             </>
//           )}
//         </button>
//       </div>

//       {/* Create Form */}
//       <AnimatePresence>
//         {showCreateForm && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="overflow-hidden bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-700"
//           >
//             <h3 className="text-xl font-semibold text-white">
//               Create New Policy
//             </h3>

//             {/* Title Field */}
//             <div>
//               <label className="block text-sm text-gray-300 mb-1">Title</label>
//               <input
//                 type="text"
//                 placeholder="Enter policy title"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Type Field */}
//             <div>
//               <label className="block text-sm text-gray-300 mb-1">
//                 Policy Type
//               </label>
//               <select
//                 value={formData.type}
//                 onChange={(e) =>
//                   setFormData({ ...formData, type: e.target.value })
//                 }
//                 className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="shipping">Shipping</option>
//                 <option value="return">Return</option>
//                 <option value="warranty">Warranty</option>
//                 <option value="contact">Contact</option>
//                 <option value="social">Social</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             {/* Content Field */}
//             <div>
//               <label className="block text-sm text-gray-300 mb-1">
//                 Content (Markdown Supported)
//               </label>
//               <textarea
//                 rows="5"
//                 placeholder="Write policy content here... (e.g. **bold**, *italic*, - list item)"
//                 value={formData.content}
//                 onChange={(e) =>
//                   setFormData({ ...formData, content: e.target.value })
//                 }
//                 className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Save Button */}
//             <div className="text-right">
//               <button
//                 onClick={handleSave}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow transition"
//               >
//                 Create
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* List */}
//       <div className="grid md:grid-cols-2 gap-6">
//         {policies.map((p) => (
//           <div
//             key={p._id}
//             className="bg-gray-800 rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer"
//             onClick={() => openEditModal(p)}
//           >
//             <div className="flex justify-between items-start mb-2">
//               <div>
//                 <h4 className="text-lg font-semibold text-white">{p.title}</h4>
//                 <p className="text-sm text-gray-400 capitalize">{p.type}</p>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleDelete(p._id);
//                 }}
//                 className="text-red-400 hover:text-red-300"
//               >
//                 <Trash className="w-4 h-4" />
//               </button>
//             </div>
//             <p className="text-sm text-gray-300 line-clamp-3 whitespace-pre-line">
//               {p.content}
//             </p>
//           </div>
//         ))}
//         {policies.length === 0 && (
//           <div className="col-span-full text-center text-gray-400 py-12">
//             No policies found.
//           </div>
//         )}
//       </div>

//       {/* Modal for Editing */}
//       <AnimatePresence>
//         {selectedPolicy && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.9 }}
//               className="bg-gray-900 p-6 rounded-xl w-full max-w-lg shadow-xl space-y-4"
//             >
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-xl text-white font-semibold">
//                   Edit Policy
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-400 hover:text-white"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
//               />

//               <select
//                 value={formData.type}
//                 onChange={(e) =>
//                   setFormData({ ...formData, type: e.target.value })
//                 }
//                 className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
//               >
//                 <option value="shipping">Shipping</option>
//                 <option value="return">Return</option>
//                 <option value="warranty">Warranty</option>
//                 <option value="contact">Contact</option>
//                 <option value="social">Social</option>
//                 <option value="other">Other</option>
//               </select>

//               <textarea
//                 rows="5"
//                 value={formData.content}
//                 onChange={(e) =>
//                   setFormData({ ...formData, content: e.target.value })
//                 }
//                 className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600"
//               />

//               <div className="flex justify-end gap-2 pt-2">
//                 <button
//                   onClick={closeModal}
//                   className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={async () => {
//                     await handleSave();
//                     closeModal();
//                   }}
//                   className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//                 >
//                   Save
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default PoliciesList;

import { useEffect, useState } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Pencil, Trash, PlusCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "react-modal";

Modal.setAppElement("#root");

const defaultFormData = { title: "", type: "other", content: "" };

const PoliciesList = () => {
  const [policies, setPolicies] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [viewPolicy, setViewPolicy] = useState(null);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get("/policies/public");
      setPolicies(res.data);
    } catch {
      toast.error("Failed to load policies");
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openCreate = () => {
    setEditingPolicy(null);
    setFormData(defaultFormData);
    setIsEditModalOpen(true);
  };

  const openEdit = (policy, e) => {
    e.stopPropagation();
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      type: policy.type,
      content: policy.content,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPolicy(null);
    setFormData(defaultFormData);
  };

  const handleSave = async () => {
    try {
      if (editingPolicy) {
        await axios.patch(`/policies/${editingPolicy._id}`, formData);
        toast.success("Policy updated");
      } else {
        await axios.post("/policies", formData);
        toast.success("Policy created");
      }
      closeEditModal();
      fetchPolicies();
    } catch {
      toast.error("Failed to save policy");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this policy?")) {
      try {
        await axios.delete(`/policies/${id}`);
        toast.success("Policy deleted");
        fetchPolicies();
      } catch {
        toast.error("Failed to delete policy");
      }
    }
  };

  const openView = (policy) => {
    setViewPolicy(policy);
  };
  const closeView = () => setViewPolicy(null);

  const truncate = (text, len = 60) =>
    text && text.length > len ? text.slice(0, len).trimEnd() + "…" : text;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  return (
    <motion.div
      className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto mt-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-2xl font-bold text-white">Policy & Info Management</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md shadow transition"
          title="Create New Policy"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 w-[180px]">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 max-w-[250px]">
                Content Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Updated At
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {policies.map((p, idx) => (
              <tr
                key={p._id}
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => openView(p)}
              >
                <td className="px-4 py-4 text-white text-sm">{idx + 1}</td>
                <td className="px-4 py-4 text-white text-sm max-w-[180px]">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {truncate(p.title, 40)}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300 capitalize">{p.type}</td>
                <td className="px-6 py-4 text-gray-300 text-sm max-w-[250px]">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {truncate((p.content || "").replace(/\n/g, " "), 80)}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {formatDate(p.createdAt || p.updatedAt)}
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {formatDate(p.updatedAt || p.createdAt)}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={(e) => openEdit(p, e)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit"
                  >
                    <Pencil className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(p._id, e)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No policies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        className="bg-gray-900 text-white w-full max-w-2xl mx-auto mt-20 p-8 rounded-lg shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">
            {editingPolicy ? "Edit Policy" : "Create New Policy"}
          </h3>
          <button onClick={closeEditModal} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter policy title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Policy Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="shipping">Shipping</option>
              <option value="return">Return</option>
              <option value="warranty">Warranty</option>
              <option value="contact">Contact</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Content (Markdown Supported)
            </label>
            <textarea
              rows={6}
              placeholder="Write policy content here... (e.g. **bold**, *italic*, - list item)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-line"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={closeEditModal} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            {editingPolicy ? "Save" : "Create"}
          </button>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewPolicy && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 p-6 rounded-xl w-full max-w-lg shadow-xl space-y-4 relative"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">{viewPolicy.title}</h3>
                  <p className="text-sm text-gray-400 capitalize">{viewPolicy.type}</p>
                </div>
                <button onClick={closeView} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-line">{viewPolicy.content}</div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeView}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PoliciesList;
