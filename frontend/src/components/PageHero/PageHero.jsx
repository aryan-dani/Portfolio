import { motion } from "framer-motion";
import "./PageHero.scss";

const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

function PageHero({ category, title, titleHighlight, highlights, visual }) {
    return (
        <motion.div
            className="page-hero"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="page-hero__container">
                <motion.div className="page-hero__content" variants={contentVariants}>
                    <motion.span className="page-hero__category" variants={itemVariants}>
                        {category}
                    </motion.span>

                    <motion.h1 className="page-hero__title" variants={itemVariants}>
                        {title}
                        {titleHighlight && (
                            <>
                                <br />
                                <span className="page-hero__title-highlight">
                                    {titleHighlight}
                                </span>
                            </>
                        )}
                    </motion.h1>

                    {highlights && highlights.length > 0 && (
                        <motion.ul className="page-hero__highlights" variants={contentVariants}>
                            {highlights.map((highlight, index) => (
                                <motion.li key={index} variants={itemVariants}>
                                    {highlight}
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </motion.div>

                {visual && (
                    <motion.div
                        className="page-hero__visual"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <div className="page-hero__visual-glow" />
                        {visual}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default PageHero;
