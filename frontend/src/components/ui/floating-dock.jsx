"use client";
/**
 * Floating Dock Navigation - Aceternity UI
 * Positioned at the top of the screen
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useRef, useState } from "react";

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => {
              const isActive = location.pathname === item.href;
              const isExternal = item.href.startsWith("http");
              const LinkComponent = isExternal ? "a" : NavLink;
              const linkProps = isExternal
                ? {
                    href: item.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : { to: item.href };
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      delay: idx * 0.05,
                    },
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                >
                  <LinkComponent
                    {...linkProps}
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
                  >
                    <div className="h-4 w-4">{item.icon}</div>
                  </LinkComponent>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ padding: "8px 16px" }}
      className={cn(
        "mx-auto hidden items-center gap-6 rounded-2xl bg-neutral-900 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, href }) {
  let ref = useRef(null);
  const location = useLocation();
  const isActive = location.pathname === href;

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [44, 80, 44]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [44, 80, 44]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [22, 40, 22]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [22, 40, 22],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const isExternal = href.startsWith("http");
  const LinkComponent = isExternal ? "a" : NavLink;
  const linkProps = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { to: href };

  return (
    <LinkComponent {...linkProps}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-neutral-800"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-neutral-900 bg-neutral-800 px-2 py-0.5 text-xs whitespace-pre text-neutral-200"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </LinkComponent>
  );
}
