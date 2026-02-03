import { memo } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconBriefcase,
  IconCode,
  IconCertificate,
  IconDeviceLaptop,
  IconUser,
  IconBrandGithub,
} from "@tabler/icons-react";

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: (
      <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
  {
    title: "Experience",
    href: "/experience",
    icon: (
      <IconBriefcase className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
  {
    title: "Projects",
    href: "/projects",
    icon: (
      <IconCode className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
  {
    title: "Certifications",
    href: "/certifications",
    icon: (
      <IconCertificate className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
  {
    title: "Skills",
    href: "/skills",
    icon: (
      <IconDeviceLaptop className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
  {
    title: "About",
    href: "/about",
    icon: (
      <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
  {
    title: "GitHub",
    href: "https://github.com/aryan-dani",
    icon: (
      <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
  },
];

function Navigation() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-9999">
      <FloatingDock items={navItems} />
    </nav>
  );
}

export default memo(Navigation);
