import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useSettingStore } from "../stores/useSettingStore";

const Footer = () => {
  const [policies, setPolicies] = useState([]);
  const { setting: generalSetting, fetchSetting } = useSettingStore();

  useEffect(() => {
    axios.get("/policies/public")
      .then((res) => setPolicies(res.data))
      .catch((err) => console.error("Failed to fetch policies:", err));

    if (!generalSetting) {
      fetchSetting();
    }
  }, []);

  const renderLinksByType = (type) =>
    policies
      .filter((p) => p.type === type)
      .map((p) => {
        let hoverClass = "hover:text-blue-400";
        let Icon = null;

        if (p.title.toLowerCase().includes("linkedin")) {
          hoverClass = "hover:text-cyan-500";
          Icon = FaLinkedin;
        } else if (p.title.toLowerCase().includes("instagram")) {
          hoverClass = "hover:text-pink-400";
          Icon = FaInstagram;
        } else if (p.title.toLowerCase().includes("facebook")) {
          hoverClass = "hover:text-blue-500";
          Icon = FaFacebook;
        }

        return (
          <li key={p._id}>
            <Link to={`/policy/${p._id}`} className={`flex items-center gap-2 ${hoverClass}`}>
              {Icon && <Icon size={16} />}
              {p.title}
            </Link>
          </li>
        );
      });

  const social = generalSetting?.socialLinks || {};
  const aboutText = generalSetting?.aboutUs || "TP.CosmicStore offers premium Gundam models for collectors and enthusiasts worldwide.";

  return (
<footer className="bg-[#0a0a1f] text-gray-400 py-10 border-t border-[#13132a]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Policies</h4>
          <ul className="space-y-1 text-sm">
            {renderLinksByType("shipping")}
            {renderLinksByType("return")}
            {renderLinksByType("warranty")}
            {renderLinksByType("other")}
          </ul>
        </div>

        <div className="space-y-2 w-40">
          <h4 className="text-lg font-semibold text-white">About Us</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {aboutText}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Contact</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            {renderLinksByType("contact")}
          </ul>
        </div>

        {/* Social Media */}
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Follow Us</h4>
          <div className="flex flex-col text-gray-400 gap-2 text-sm">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 flex items-center gap-2"
              >
                <FaFacebook />
                Facebook
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 flex items-center gap-2"
              >
                <FaInstagram />
                Instagram
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 flex items-center gap-2"
              >
                <FaLinkedin />
                LinkedIn
              </a>
            )}
          </div>
        </div>


      </div>

      <div className="text-center text-gray-500 mt-8 text-sm border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} {generalSetting?.storeName || "TP.CosmicStore"}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
