import {
  HiOutlineLink,
  HiOutlineDocumentText,
  HiOutlineMap,
  HiOutlineColorSwatch,
} from "react-icons/hi";
import { paletteNavRoutes } from "../config/routes";

export const staticNavCommands = [
  ...paletteNavRoutes.map((route) => ({
    id: `nav-${route.id}`,
    label: route.label,
    action: route.path,
    type: "nav",
    icon: route.id === "copyright" ? HiOutlineDocumentText : HiOutlineMap,
  })),
  { id: "action-theme", label: "Toggle Theme", action: "TOGGLE_THEME", type: "action", icon: HiOutlineColorSwatch },
  { id: "action-email", label: "Copy Email", action: "COPY_EMAIL", type: "action", icon: HiOutlineLink, keywords: "contact hire email" },
];
