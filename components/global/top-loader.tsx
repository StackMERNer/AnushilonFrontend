import React from 'react'
import NextTopLoader from "nextjs-toploader";
const TopLoader = () => {
    return (
        <NextTopLoader
            color="#8B6FE8"
            initialPosition={0.08}
            crawlSpeed={200}
            height={4}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow={false}
            zIndex={9999}
        />
    )
}

export default TopLoader